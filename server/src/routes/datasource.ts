import { Router } from 'express';
import { dataSources, dataSourceDataMap } from '../mock/datasource.js';

const router = Router();

// GET /api/datasource - 获取所有数据源元数据
router.get('/', (_req, res) => {
  res.json({ code: 0, data: dataSources, message: 'success' });
});

// GET /api/datasource/:id - 获取单个数据源元数据
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const meta = dataSources.find((ds) => ds.id === id);
  if (!meta) {
    res.status(404).json({ code: 404, data: null, message: `数据源 ${id} 不存在` });
    return;
  }
  res.json({ code: 0, data: meta, message: 'success' });
});

// GET /api/datasource/:id/data - 获取指定数据源的原始数据
// 支持可选查询参数:
//   fields - 逗号分隔的字段名，用于字段投影
//   其他参数 - 作为等值筛选条件
router.get('/:id/data', (req, res) => {
  const { id } = req.params;
  const rawData = dataSourceDataMap[id];
  if (!rawData) {
    res.status(404).json({ code: 404, data: null, message: `数据源 ${id} 不存在` });
    return;
  }

  const { fields, ...filters } = req.query;

  // 应用等值筛选
  let data = rawData;
  const filterEntries = Object.entries(filters).filter(
    ([, v]) => typeof v === 'string' && v !== '',
  );
  if (filterEntries.length > 0) {
    data = data.filter((row) =>
      filterEntries.every(([key, value]) => String(row[key]) === value),
    );
  }

  // 应用字段投影
  if (typeof fields === 'string' && fields.length > 0) {
    const fieldList = fields.split(',').map((f) => f.trim());
    data = data.map((row) => {
      const projected: Record<string, unknown> = {};
      for (const f of fieldList) {
        if (f in row) projected[f] = row[f];
      }
      return projected;
    });
  }

  res.json({ code: 0, data, message: 'success' });
});

export default router;
