import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

const PRICE_PER_LEAD = 0.2;

const createOrderSchema = z.object({
  quantity: z.number().int().min(1).max(10000),
});

router.post('/create', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { quantity } = createOrderSchema.parse(req.body);
    const amount = quantity * PRICE_PER_LEAD;

    const order = await prisma.order.create({
      data: {
        userId: req.userId!,
        quantity,
        amount,
        status: 'pending',
      },
    });

    res.status(201).json({
      orderId: order.id,
      quantity,
      total: amount,
      currency: 'USD',
      pricePerLead: PRICE_PER_LEAD,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.issues[0].message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/confirm', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { orderId, paymentId } = req.body;
    if (!orderId) return res.status(400).json({ error: 'Order ID required' });

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: req.userId },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status !== 'pending') return res.status(400).json({ error: 'Order already processed' });

    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { status: 'completed', paymentId: paymentId || null },
      }),
      prisma.user.update({
        where: { id: req.userId },
        data: { purchasedLeads: { increment: order.quantity } },
      }),
    ]);

    res.json({ success: true, creditsAdded: order.quantity });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    res.json(orders);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
