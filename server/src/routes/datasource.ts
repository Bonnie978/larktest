import { Router } from 'express';
import { lineProductionData, weeklyDefectData } from '../mock/production.js';
import { equipmentList } from '../mock/equipment.js';
import { qualityRecords } from '../mock/quality.js';
import { workOrders } from '../mock/orders.js';

const router = Router();

// ---------------------------------------------------------------------------
// Data-source metadata definitions
// ---------------------------------------------------------------------------

interface FieldMeta {
  key: string;
  label: string;
  type: 'string' | 'number';
}

interface DataSourceMeta {
  id: string;
  name: string;
  fields: FieldMeta[];
}

const datasources: DataSourceMeta[] = [
  {
    id: 'line-production',
    name: '产线产量',
    fields: [
      { key: 'lineId', label: '产线编号', type: 'string' },
      { key: 'lineName', label: '产线名称', type: 'string' },
      { key: 'shift', label: '班次', type: 'string' },
      { key: 'planned', label: '计划产量', type: 'number' },
      { key: 'actual', label: '实际产量', type: 'number' },
      { key: 'completionRate', label: '完成率', type: 'number' },
      { key: 'status', label: '状态', type: 'string' },
    ],
  },
  {
    id: 'equipment',
    name: '设备状态',
    fields: [
      { key: 'id', label: '设备编号', type: 'string' },
      { key: 'name', label: '设备名称', type: 'string' },
      { key: 'lineId', label: '产线编号', type: 'string' },
      { key: 'lineName', label: '产线名称', type: 'string' },
      { key: 'type', label: '设备类型', type: 'string' },
      { key: 'availability', label: '可用率', type: 'number' },
      { key: 'performance', label: '性能率', type: 'number' },
      { key: 'quality', label: '质量率', type: 'number' },
      { key: 'oee', label: 'OEE', type: 'number' },
      { key: 'status', label: '状态', type: 'string' },
    ],
  },
  {
    id: 'quality',
    name: '质量记录',
    fields: [
      { key: 'id', label: '记录编号', type: 'string' },
      { key: 'batchNo', label: '批次号', type: 'string' },
      { key: 'lineId', label: '产线编号', type: 'string' },
      { key: 'lineName', label: '产线名称', type: 'string' },
      { key: 'defectType', label: '缺陷类型', type: 'string' },
      { key: 'defectCount', label: '缺陷数量', type: 'number' },
      { key: 'inspector', label: '检验员', type: 'string' },
      { key: 'occurTime', label: '发生时间', type: 'string' },
      { key: 'status', label: '状态', type: 'string' },
      { key: 'description', label: '描述', type: 'string' },
      { key: 'resolution', label: '处理措施', type: 'string' },
    ],
  },
  {
    id: 'orders',
    name: '工单',
    fields: [
      { key: 'id', label: '工单编号', type: 'string' },
      { key: 'productModel', label: '产品型号', type: 'string' },
      { key: 'customer', label: '客户', type: 'string' },
      { key: 'plannedQty', label: '计划数量', type: 'number' },
      { key: 'completedQty', label: '完成数量', type: 'number' },
      { key: 'plannedStart', label: '计划开始', type: 'string' },
      { key: 'plannedEnd', label: '计划结束', type: 'string' },
      { key: 'actualEnd', label: '实际结束', type: 'string' },
      { key: 'deliveryStatus', label: '交付状态', type: 'string' },
    ],
  },
  {
    id: 'weekly-defects',
    name: '近7天不良趋势',
    fields: [
      { key: 'date', label: '日期', type: 'string' },
      { key: 'inspectedQty', label: '检验数量', type: 'number' },
      { key: 'defectQty', label: '不良数量', type: 'number' },
      { key: 'defectRate', label: '不良率', type: 'number' },
      { key: 'mainDefectType', label: '主要缺陷类型', type: 'string' },
    ],
  },
];

// Map datasource id → raw data array
const dataMap: Record<string, Record<string, any>[]> = {
  'line-production': lineProductionData as unknown as Record<string, any>[],
  equipment: equipmentList as unknown as Record<string, any>[],
  quality: qualityRecords as unknown as Record<string, any>[],
  orders: workOrders as unknown as Record<string, any>[],
  'weekly-defects': weeklyDefectData as unknown as Record<string, any>[],
};

// ---------------------------------------------------------------------------
// GET /api/datasource — return metadata for all datasources
// ---------------------------------------------------------------------------
router.get('/', (_req, res) => {
  res.json({ code: 0, data: datasources, message: 'success' });
});

// ---------------------------------------------------------------------------
// GET /api/datasource/:id/data — return data with optional projection & filter
// ---------------------------------------------------------------------------
router.get('/:id/data', (req, res) => {
  const { id } = req.params;

  const meta = datasources.find((ds) => ds.id === id);
  if (!meta) {
    res.status(404).json({ code: 1, data: null, message: `datasource "${id}" not found` });
    return;
  }

  let rows = dataMap[id] ?? [];

  // --- fields projection ------------------------------------------------
  const fieldsParam = req.query.fields;
  const projectedKeys: string[] | null =
    typeof fieldsParam === 'string' && fieldsParam
      ? fieldsParam.split(',').map((f) => f.trim()).filter(Boolean)
      : null;

  // --- equality filters (every query param except "fields") -------------
  const filters: Record<string, string> = {};
  for (const [key, value] of Object.entries(req.query)) {
    if (key === 'fields') continue;
    if (typeof value === 'string' && value) {
      filters[key] = value;
    }
  }

  // Apply equality filters
  if (Object.keys(filters).length > 0) {
    rows = rows.filter((row) =>
      Object.entries(filters).every(([k, v]) => String(row[k]) === v),
    );
  }

  // Apply field projection
  if (projectedKeys) {
    rows = rows.map((row) => {
      const projected: Record<string, any> = {};
      for (const k of projectedKeys) {
        if (k in row) {
          projected[k] = row[k];
        }
      }
      return projected;
    });
  }

  res.json({ code: 0, data: rows, message: 'success' });
});

export default router;
