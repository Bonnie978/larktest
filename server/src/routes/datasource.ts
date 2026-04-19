import { Router } from 'express';
import registry from '../datasource/registry.js';

const router = Router();

// GET /api/datasource — list all datasource metadata
router.get('/', (_req, res) => {
  const sources = registry.getAll();
  res.json({ code: 0, data: sources, message: 'success' });
});

// GET /api/datasource/:id/data — query datasource data
router.get('/:id/data', (req, res) => {
  const { id } = req.params;
  const { fields, ...filters } = req.query as Record<string, string>;

  const fieldList = fields ? fields.split(',').map((f) => f.trim()) : undefined;

  const cleanFilters: Record<string, string> = {};
  for (const [key, value] of Object.entries(filters)) {
    if (value) cleanFilters[key] = value;
  }

  const data = registry.queryData(id, {
    fields: fieldList,
    filters: Object.keys(cleanFilters).length > 0 ? cleanFilters : undefined,
  });

  if (data === null) {
    res.status(404).json({ code: 1, data: null, message: `数据源 ${id} 不存在` });
    return;
  }

  res.json({ code: 0, data, message: 'success' });
});

export default router;
