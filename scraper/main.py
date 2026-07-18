"""LeadGenPro scraping service.

Wraps ScrapeGraphAI's SearchGraph: takes a plain-language description of an
ideal lead, searches the web, scrapes matching pages, and returns structured
lead records. Called internally by the Express backend.
"""

import logging
import os
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from scrapegraphai.graphs import SearchGraph

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("leadgen-scraper")

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
MAX_SEARCH_RESULTS = int(os.environ.get("MAX_SEARCH_RESULTS", "8"))

app = FastAPI(title="LeadGenPro Scraper", version="1.0.0")


class Lead(BaseModel):
    name: str = Field(description="Full name of the person, or company name if no person is identified")
    email: Optional[str] = Field(default=None, description="Publicly listed email address")
    phone: Optional[str] = Field(default=None, description="Publicly listed phone number")
    company: Optional[str] = Field(default=None, description="Company or organization name")
    title: Optional[str] = Field(default=None, description="Job title or role")
    linkedin: Optional[str] = Field(default=None, description="LinkedIn profile or company page URL")
    website: Optional[str] = Field(default=None, description="Company or personal website URL")
    location: Optional[str] = Field(default=None, description="City, region, or country")
    industry: Optional[str] = Field(default=None, description="Industry or sector")


class Leads(BaseModel):
    leads: List[Lead]


class ScrapeRequest(BaseModel):
    prompt: str
    industry: Optional[str] = None
    location: Optional[str] = None
    title: Optional[str] = None
    company_size: Optional[str] = None
    count: int = Field(default=10, ge=1, le=100)


class ScrapeResponse(BaseModel):
    leads: List[dict]
    sources: List[str] = []


def build_prompt(req: ScrapeRequest) -> str:
    criteria = [f"Ideal lead description: {req.prompt.strip()}"]
    if req.industry:
        criteria.append(f"Industry: {req.industry}")
    if req.location:
        criteria.append(f"Location: {req.location}")
    if req.title:
        criteria.append(f"Job title: {req.title}")
    if req.company_size:
        criteria.append(f"Company size: {req.company_size}")
    criteria_text = "\n".join(criteria)
    return (
        "You are a B2B lead-generation researcher. Find real companies and, where "
        "possible, real decision-makers matching ALL of the following criteria:\n"
        f"{criteria_text}\n\n"
        f"Return up to {req.count} distinct leads. For each lead extract: name, "
        "email, phone, company, title, linkedin, website, location, industry. "
        "Only include contact details (email/phone) that are publicly listed on "
        "the scraped pages — never invent or guess them; leave a field null when "
        "the information is not present. Do not fabricate people or companies."
    )


def completeness_score(lead: dict) -> int:
    score = 55
    weights = {"email": 15, "phone": 6, "linkedin": 8, "website": 6, "title": 5, "location": 3, "company": 2}
    for field, weight in weights.items():
        if lead.get(field):
            score += weight
    return min(score, 100)


def normalize(raw: object) -> List[dict]:
    """SearchGraph output shape varies by model/run; coerce it to a lead list."""
    if isinstance(raw, dict):
        for key in ("leads", "results", "content"):
            if isinstance(raw.get(key), list):
                raw = raw[key]
                break
        else:
            raw = [raw]
    if not isinstance(raw, list):
        return []

    leads: List[dict] = []
    seen: set = set()
    for item in raw:
        if not isinstance(item, dict):
            continue
        name = str(item.get("name") or item.get("company") or "").strip()
        if not name:
            continue
        dedupe_key = (name.lower(), str(item.get("company") or "").lower())
        if dedupe_key in seen:
            continue
        seen.add(dedupe_key)
        lead = {
            field: (str(item[field]).strip() if item.get(field) else None)
            for field in ("name", "email", "phone", "company", "title", "linkedin", "website", "location", "industry")
        }
        lead["name"] = name
        lead["score"] = completeness_score(lead)
        leads.append(lead)
    return leads


@app.get("/health")
def health():
    return {"status": "ok", "model": OPENAI_MODEL, "configured": bool(OPENAI_API_KEY)}


@app.post("/scrape-leads", response_model=ScrapeResponse)
def scrape_leads(req: ScrapeRequest):
    if not OPENAI_API_KEY:
        raise HTTPException(status_code=503, detail="OPENAI_API_KEY is not configured on the scraper service")

    graph_config = {
        "llm": {
            "api_key": OPENAI_API_KEY,
            "model": f"openai/{OPENAI_MODEL}",
            "temperature": 0,
        },
        "max_results": max(3, min(MAX_SEARCH_RESULTS, req.count)),
        "verbose": False,
        "headless": True,
    }

    prompt = build_prompt(req)
    logger.info("Scraping leads: count=%s prompt=%r", req.count, req.prompt[:80])

    try:
        graph = SearchGraph(prompt=prompt, config=graph_config, schema=Leads)
        raw = graph.run()
        sources = []
        try:
            sources = list(graph.get_considered_urls() or [])
        except Exception:
            pass
    except Exception as exc:
        logger.exception("SearchGraph run failed")
        raise HTTPException(status_code=502, detail=f"Scraping failed: {exc}") from exc

    leads = normalize(raw)[: req.count]
    logger.info("Scrape finished: %s leads from %s sources", len(leads), len(sources))
    return ScrapeResponse(leads=leads, sources=sources)
