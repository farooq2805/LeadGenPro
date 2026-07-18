import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { sendLeadNotification } from '../lib/email';
import { scrapeLeads } from '../lib/scraper';

const JWT_SECRET = process.env.JWT_SECRET || 'prospectpro-jwt-secret';

const router = Router();

const generateSchema = z.object({
  prompt: z.string().min(10, 'Please describe your ideal lead in more detail'),
  industry: z.string().optional(),
  location: z.string().optional(),
  title: z.string().optional(),
  companySize: z.string().optional(),
  count: z.number().min(1).max(100).default(10),
});

router.post('/generate', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const data = generateSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const remainingFree = user.totalFreeLeads - user.freeLeadsUsed;
    const totalAvailable = remainingFree + user.purchasedLeads;

    if (totalAvailable < data.count) {
      return res.status(402).json({
        error: 'Insufficient credits',
        remaining: totalAvailable,
        needed: data.count,
        freeRemaining: remainingFree,
        purchasedRemaining: user.purchasedLeads,
      });
    }

    const query = await prisma.leadQuery.create({
      data: {
        userId,
        prompt: data.prompt,
        industry: data.industry,
        location: data.location,
        title: data.title,
        companySize: data.companySize,
        requestedCount: data.count,
        status: 'processing',
      },
    });

    // Scraping the web takes minutes — run it in the background and let the
    // client poll GET /api/leads/:id for status. Credits are only charged for
    // leads actually delivered.
    void processQuery(query.id, userId, data);

    res.status(202).json({
      queryId: query.id,
      status: 'processing',
      requestedCount: data.count,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.issues[0].message });
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const queries = await prisma.leadQuery.findMany({
      where: { userId: req.userId },
      include: {
        _count: { select: { leads: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    res.json(queries);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const query = await prisma.leadQuery.findFirst({
      where: { id, userId: req.userId },
      include: { leads: true },
    });
    if (!query) return res.status(404).json({ error: 'Query not found' });
    res.json(query);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function resolveUser(req: AuthRequest): Promise<boolean> {
  if (req.userId) return true;
  const token = String(req.query.token || '');
  if (!token) return false;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    return true;
  } catch {
    return false;
  }
}

router.get('/:id/download', async (req: AuthRequest, res: Response) => {
  const authed = await resolveUser(req);
  if (!authed) return res.status(401).json({ error: 'Authentication required' });
  try {
    const id = String(req.params.id);
    const query = await prisma.leadQuery.findFirst({
      where: { id, userId: req.userId },
      include: { leads: true },
    });
    if (!query) return res.status(404).json({ error: 'Query not found' });

    const header = 'Name,Email,Phone,Company,Title,LinkedIn,Website,Location,Industry\n';
    const leads = (query as any).leads || [];
    const rows = leads.map((l: any) =>
      [
        escapeCsv(l.name),
        escapeCsv(l.email || ''),
        escapeCsv(l.phone || ''),
        escapeCsv(l.company || ''),
        escapeCsv(l.title || ''),
        escapeCsv(l.linkedin || ''),
        escapeCsv(l.website || ''),
        escapeCsv(l.location || ''),
        escapeCsv(l.industry || ''),
      ].join(',')
    ).join('\n');

    const csv = header + rows;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="leads-${query.id}.csv"`);
    res.send(csv);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

function escapeCsv(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

async function processQuery(
  queryId: string,
  userId: string,
  data: { prompt: string; industry?: string; location?: string; title?: string; companySize?: string; count: number }
) {
  try {
    const scraped = await scrapeLeads({
      prompt: data.prompt,
      industry: data.industry,
      location: data.location,
      title: data.title,
      companySize: data.companySize,
      count: data.count,
    });

    if (scraped.length === 0) {
      await prisma.leadQuery.update({
        where: { id: queryId },
        data: {
          status: 'failed',
          error: 'No leads found for this search. Try a broader description — no credits were charged.',
        },
      });
      return;
    }

    const delivered = scraped.slice(0, data.count);

    // Re-read balances at charge time and only charge for delivered leads.
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const remainingFree = user ? Math.max(user.totalFreeLeads - user.freeLeadsUsed, 0) : 0;
    const chargeFree = Math.min(delivered.length, remainingFree);
    const chargePurchased = Math.min(delivered.length - chargeFree, user?.purchasedLeads ?? 0);

    await prisma.$transaction([
      prisma.lead.createMany({
        data: delivered.map((l) => ({
          queryId,
          userId,
          name: l.name,
          email: l.email || null,
          phone: l.phone || null,
          company: l.company || null,
          title: l.title || null,
          linkedin: l.linkedin || null,
          website: l.website || null,
          location: l.location || null,
          industry: l.industry || null,
          score: l.score ?? null,
        })),
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          freeLeadsUsed: { increment: chargeFree },
          purchasedLeads: { decrement: chargePurchased },
        },
      }),
      prisma.leadQuery.update({
        where: { id: queryId },
        data: { status: 'completed', error: null },
      }),
    ]);

    if (user?.email) {
      sendLeadNotification(user.email, user.name, delivered.length, queryId).catch(() => {});
    }
  } catch (err: any) {
    console.error(`Lead query ${queryId} failed:`, err);
    await prisma.leadQuery
      .update({
        where: { id: queryId },
        data: {
          status: 'failed',
          error: err?.message || 'Lead generation failed — no credits were charged.',
        },
      })
      .catch(() => {});
  }
}

export default router;
