import { Router } from 'express';
import { dataSources, dataSourceDataMap } from '../mock/datasource.js';

const router = Router();

// GET /api/datasource - 获取所有数据源元数据
router.get('/', (_req, res) => {
  res.json({ code: 0, data: dataSources, message: 'success' });
});

// GET /api/datasource/:id/data - 获取指定数据源的原始数据
router.get('/:id/data', (req, res) => {
  const { id } = req.params;
  const data = dataSourceDataMap[id];
  if (!data) {
    res.status(404).json({ code: 404, data: null, message: `数据源 ${id} 不存在` });
    return;
  }
  res.json({ code: 0, data, message: 'success' });
});

export default router;
