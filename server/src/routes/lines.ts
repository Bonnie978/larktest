import { Router } from 'express';
import { productionLines } from '../mock/lines.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ code: 0, data: productionLines, message: 'success' });
});

router.get('/:id', (req, res) => {
  const line = productionLines.find((l) => l.id === req.params.id);
  if (!line) {
    res.status(404).json({ code: 1, data: null, message: 'not found' });
    return;
  }
  res.json({ code: 0, data: line, message: 'success' });
});

export default router;
