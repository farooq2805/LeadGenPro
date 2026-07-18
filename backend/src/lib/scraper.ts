const SCRAPER_URL = process.env.SCRAPER_URL || 'http://localhost:8000';
const SCRAPER_TIMEOUT_MS = Number(process.env.SCRAPER_TIMEOUT_MS || 10 * 60 * 1000);

export interface ScrapedLead {
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  title?: string | null;
  linkedin?: string | null;
  website?: string | null;
  location?: string | null;
  industry?: string | null;
  score?: number | null;
}

export interface ScrapeParams {
  prompt: string;
  industry?: string;
  location?: string;
  title?: string;
  companySize?: string;
  count: number;
}

export async function scrapeLeads(params: ScrapeParams): Promise<ScrapedLead[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SCRAPER_TIMEOUT_MS);
  try {
    const res = await fetch(`${SCRAPER_URL}/scrape-leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        prompt: params.prompt,
        industry: params.industry,
        location: params.location,
        title: params.title,
        company_size: params.companySize,
        count: params.count,
      }),
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { detail?: string };
      throw new Error(body.detail || `Scraper service returned HTTP ${res.status}`);
    }

    const data = (await res.json()) as { leads: ScrapedLead[] };
    return Array.isArray(data.leads) ? data.leads : [];
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('Scraping timed out — try a smaller lead count or a more specific prompt');
    }
    if (err.cause?.code === 'ECONNREFUSED' || err.message?.includes('fetch failed')) {
      throw new Error('Scraper service is unreachable — make sure the scraper container is running');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
