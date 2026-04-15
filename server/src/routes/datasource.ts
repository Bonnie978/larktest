import { Router } from 'express';
import { lineProductionData, weeklyDefectData } from '../mock/production.js';
import { equipmentList } from '../mock/equipment.js';
import { qualityRecords } from '../mock/quality.js';
import { workOrders } from '../mock/orders.js';

const router = Router();

const datasourceRegistry = [
  {
    id: 'line-production',
    name: '产线数据',
    fields: [
      { key: 'lineName', label: '产线名称', type: 'string' },
      { key: 'shift', label: '班次', type: 'string' },
      { key: 'planned', label: '计划产量', type: 'number' },
      { key: 'actual', label: '实际产量', type: 'number' },
      { key: 'completionRate', label: '完成率', type: 'number' },
    ],
  },
  {
    id: 'equipment',
    name: '设备数据',
    fields: [
      { key: 'name', label: '设备名称', type: 'string' },
      { key: 'lineName', label: '所属产线', type: 'string' },
      { key: 'type', label: '设备类型', type: 'string' },
      { key: 'status', label: '状态', type: 'string' },
      { key: 'availability', label: '稼动率', type: 'number' },
      { key: 'performance', label: '性能率', type: 'number' },
      { key: 'quality', label: '良品率', type: 'number' },
      { key: 'oee', label: 'OEE', type: 'number' },
    ],
  },
  {
    id: 'quality',
    name: '质量数据',
    fields: [
      { key: 'lineName', label: '产线', type: 'string' },
      { key: 'defectType', label: '不良类型', type: 'string' },
      { key: 'inspector', label: '检验员', type: 'string' },
      { key: 'status', label: '处理状态', type: 'string' },
      { key: 'defectCount', label: '不良数量', type: 'number' },
    ],
  },
  {
    id: 'orders',
    name: '工单数据',
    fields: [
      { key: 'productModel', label: '产品型号', type: 'string' },
      { key: 'customer', label: '客户名称', type: 'string' },
      { key: 'deliveryStatus', label: '交期状态', type: 'string' },
      { key: 'plannedQty', label: '计划数量', type: 'number' },
      { key: 'completedQty', label: '已完成数量', type: 'number' },
    ],
  },
  {
    id: 'weekly-defects',
    name: '不良趋势-周',
    fields: [
      { key: 'date', label: '日期', type: 'string' },
      { key: 'mainDefectType', label: '主要不良类型', type: 'string' },
      { key: 'inspectedQty', label: '检验数量', type: 'number' },
      { key: 'defectQty', label: '不良数', type: 'number' },
      { key: 'defectRate', label: '不良率', type: 'number' },
    ],
  },
];

const dataMap: Record<string, any[]> = {
  'line-production': lineProductionData,
  'equipment': equipmentList,
  'quality': qualityRecords,
  'orders': workOrders,
  'weekly-defects': weeklyDefectData,
};

// GET /api/datasource — 元数据
router.get('/', (_req, res) => {
  res.json({ code: 0, data: datasourceRegistry, message: 'success' });
});

// GET /api/datasource/:id/data — 数据查询
router.get('/:id/data', (req, res) => {
  const { id } = req.params;
  const rawData = dataMap[id];

  if (!rawData) {
    res.status(404).json({ code: 1, data: null, message: `数据源 ${id} 不存在` });
    return;
  }

  const { fields, ...filters } = req.query;
  let result = [...rawData] as Record<string, any>[];

  // 等值筛选
  Object.entries(filters).forEach(([key, value]) => {
    if (typeof value === 'string' && value) {
      result = result.filter((row) => String(row[key]) === value);
    }
  });

  // 字段投影
  if (typeof fields === 'string' && fields) {
    const fieldList = fields.split(',').map((f) => f.trim());
    result = result.map((row) => {
      const projected: Record<string, any> = {};
      fieldList.forEach((f) => {
        if (f in row) projected[f] = row[f];
      });
      return projected;
    });
  }

  res.json({ code: 0, data: result, message: 'success' });
});

export default router;
