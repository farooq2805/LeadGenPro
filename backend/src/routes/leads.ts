import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { sendLeadNotification } from '../lib/email';

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
        status: 'processing',
      },
    });

    const mockLeads = generateMockLeads(data.prompt, data.count);

    const chargeFree = Math.min(data.count, remainingFree);
    const chargePurchased = data.count - chargeFree;

    await prisma.user.update({
      where: { id: userId },
      data: {
        freeLeadsUsed: { increment: chargeFree },
        purchasedLeads: { decrement: chargePurchased },
      },
    });

    await prisma.lead.createMany({
      data: mockLeads.map((l) => ({
        queryId: query.id,
        userId,
        ...l,
      })),
    });

    await prisma.leadQuery.update({
      where: { id: query.id },
      data: { status: 'completed' },
    });

    if (user.email) {
      sendLeadNotification(user.email, user.name, data.count, query.id).catch(() => {});
    }

    const leads = await prisma.lead.findMany({ where: { queryId: query.id } });

    res.status(201).json({
      queryId: query.id,
      count: leads.length,
      leads,
      creditsUsed: data.count,
      freeUsed: chargeFree,
      purchasedUsed: chargePurchased,
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

function generateMockLeads(prompt: string, count: number) {
  const industries = ['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'SaaS', 'E-commerce'];
  const titles = ['CEO', 'CTO', 'VP of Engineering', 'Head of Product', 'Director of Sales', 'Marketing Manager', 'Founder'];
  const locations = ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'Chicago, IL', 'Seattle, WA', 'Boston, MA', 'Denver, CO'];
  const companies = ['TechFlow Inc', 'DataDriven Co', 'CloudScale', 'NeuralPath', 'GrowthHive', 'PixelPerfect', 'LaunchPad'];

  return Array.from({ length: count }, (_, i) => ({
    name: `Lead ${i + 1} from "${prompt.slice(0, 30)}..."`,
    email: `lead${i + 1}@example.com`,
    phone: `+1-555-${String(1000 + i).slice(0, 4)}`,
    company: companies[i % companies.length],
    title: titles[i % titles.length],
    linkedin: `https://linkedin.com/in/lead${i + 1}`,
    website: `https://${companies[i % companies.length].toLowerCase()}.com`,
    location: locations[i % locations.length],
    industry: industries[i % industries.length],
    score: Math.floor(Math.random() * 40) + 60,
  }));
}

export default router;
