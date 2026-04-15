import { Router } from 'express';
import { equipmentList } from '../mock/equipment.js';

const router = Router();

router.get('/', (req, res) => {
  let result = equipmentList;

  const { lineId, status } = req.query;

  if (typeof lineId === 'string' && lineId) {
    result = result.filter((e) => e.lineId === lineId);
  }

  if (typeof status === 'string' && status) {
    result = result.filter((e) => e.status === status);
  }

  res.json({ code: 0, data: result, message: 'success' });
});

export default router;
