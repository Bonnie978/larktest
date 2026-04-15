import { Router } from 'express';
import { qualityRecords } from '../mock/quality.js';

const router = Router();

router.get('/', (req, res) => {
  let result = qualityRecords;

  const { lineName, defectType, status } = req.query;

  if (typeof lineName === 'string' && lineName) {
    result = result.filter((r) => r.lineName === lineName);
  }

  if (typeof defectType === 'string' && defectType) {
    result = result.filter((r) => r.defectType === defectType);
  }

  if (typeof status === 'string' && status) {
    result = result.filter((r) => r.status === status);
  }

  res.json({ code: 0, data: result, message: 'success' });
});

export default router;
