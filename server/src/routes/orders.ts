import { Router } from 'express';
import { workOrders } from '../mock/orders.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ code: 0, data: workOrders, message: 'success' });
});

export default router;
