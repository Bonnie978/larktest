import { Router } from 'express';
import { MetadataManager } from '../datasource/MetadataManager.js';
import { QueryEngine } from '../datasource/QueryEngine.js';

const router = Router();

// GET /api/datasource - 获取所有数据源元数据
router.get('/', (_req, res) => {
  const metadata = MetadataManager.getAllDataSources();
  res.json({ code: 0, data: metadata, message: 'success' });
});

// GET /api/datasource/:id/data - 查询数据源数据
router.get('/:id/data', async (req, res) => {
  const { id } = req.params;
  const { fields, ...filters } = req.query as Record<string, string>;

  try {
    const data = await QueryEngine.query(id, {
      fields: fields ? fields.split(',').map((f) => f.trim()) : undefined,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
    });
    res.json({ code: 0, data, message: 'success' });
  } catch (error) {
    res.status(404).json({
      code: 1,
      data: null,
      message: (error as Error).message,
    });
  }
});

export default router;
