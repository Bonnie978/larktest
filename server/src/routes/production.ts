import { Router } from 'express';
import { kpiData, lineProductionData, weeklyDefectData } from '../mock/production.js';

const router = Router();

router.get('/kpi', (_req, res) => {
  res.json({ code: 0, data: kpiData, message: 'success' });
});

router.get('/lines', (_req, res) => {
  res.json({ code: 0, data: lineProductionData, message: 'success' });
});

router.get('/defects', (_req, res) => {
  res.json({ code: 0, data: weeklyDefectData, message: 'success' });
});

export default router;
