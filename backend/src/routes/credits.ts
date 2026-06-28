import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        freeLeadsUsed: true,
        totalFreeLeads: true,
        purchasedLeads: true,
      },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      freeRemaining: user.totalFreeLeads - user.freeLeadsUsed,
      freeUsed: user.freeLeadsUsed,
      totalFreeLeads: user.totalFreeLeads,
      purchasedRemaining: user.purchasedLeads,
      totalAvailable: (user.totalFreeLeads - user.freeLeadsUsed) + user.purchasedLeads,
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
