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

  // Check datasource exists
  const meta = dataSources.find(ds => ds.id === id);
  if (!meta) {
    res.status(404).json({ code: 1, data: null, message: `数据源 ${id} 不存在` });
    return;
  }

  let data = dataSourceDataMap[id] ?? [];
  const validKeys = new Set(meta.fields.map(f => f.key));

  // Parse fields param for projection
  const { fields: fieldsParam, ...filterParams } = req.query;
  let projectionKeys: string[] | null = null;

  if (typeof fieldsParam === 'string' && fieldsParam.trim()) {
    projectionKeys = fieldsParam.split(',').map(s => s.trim()).filter(Boolean);
    const invalidFields = projectionKeys.filter(k => !validKeys.has(k));
    if (invalidFields.length > 0) {
      res.status(400).json({
        code: 1,
        data: null,
        message: `无效字段: ${invalidFields.join(', ')}`,
      });
      return;
    }
  }

  // Apply equality filters
  for (const [key, value] of Object.entries(filterParams)) {
    if (!validKeys.has(key)) continue; // ignore unknown filter keys
    if (typeof value === 'string') {
      data = data.filter(row => String(row[key]) === value);
    }
  }

  // Apply field projection
  if (projectionKeys) {
    const keys = projectionKeys;
    data = data.map(row => {
      const projected: Record<string, any> = {};
      for (const k of keys) {
        projected[k] = row[k];
      }
      return projected;
    });
  }

  res.json({ code: 0, data, message: 'success' });
});

export default router;
