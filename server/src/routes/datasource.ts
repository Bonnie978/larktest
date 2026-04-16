import { Router } from 'express';
import { lineProductionData } from '../mock/production.js';
import { equipmentList } from '../mock/equipment.js';
import { qualityRecords } from '../mock/quality.js';
import { workOrders } from '../mock/orders.js';
import { weeklyDefectData } from '../mock/production.js';

const router = Router();

interface FieldMeta {
  key: string;
  label: string;
  type: 'string' | 'number';
}

interface DataSourceMeta {
  id: string;
  name: string;
  icon: string;
  fields: FieldMeta[];
}

const dataSources: DataSourceMeta[] = [
  {
    id: 'line-production',
    name: '产线数据',
    icon: '🏭',
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
    icon: '⚙️',
    fields: [
      { key: 'name', label: '设备名称', type: 'string' },
      { key: 'lineName', label: '所属产线', type: 'string' },
      { key: 'type', label: '设备类型', type: 'string' },
      { key: 'status', label: '状态', type: 'string' },
      { key: 'availability', label: '可用率', type: 'number' },
      { key: 'performance', label: '性能率', type: 'number' },
      { key: 'quality', label: '质量率', type: 'number' },
      { key: 'oee', label: 'OEE', type: 'number' },
    ],
  },
  {
    id: 'quality',
    name: '质量数据',
    icon: '✅',
    fields: [
      { key: 'lineName', label: '产线名称', type: 'string' },
      { key: 'defectType', label: '不良类型', type: 'string' },
      { key: 'status', label: '状态', type: 'string' },
      { key: 'defectCount', label: '不良数量', type: 'number' },
    ],
  },
  {
    id: 'orders',
    name: '工单数据',
    icon: '📋',
    fields: [
      { key: 'productModel', label: '产品型号', type: 'string' },
      { key: 'customer', label: '客户', type: 'string' },
      { key: 'deliveryStatus', label: '交付状态', type: 'string' },
      { key: 'plannedQty', label: '计划数量', type: 'number' },
      { key: 'completedQty', label: '完成数量', type: 'number' },
    ],
  },
  {
    id: 'weekly-defects',
    name: '周不良趋势',
    icon: '📉',
    fields: [
      { key: 'date', label: '日期', type: 'string' },
      { key: 'mainDefectType', label: '主要不良类型', type: 'string' },
      { key: 'inspectedQty', label: '检验数量', type: 'number' },
      { key: 'defectQty', label: '不良数', type: 'number' },
      { key: 'defectRate', label: '不良率', type: 'number' },
    ],
  },
];

// GET /api/datasource - Get all data sources metadata
router.get('/', (req, res) => {
  res.json({ code: 0, data: dataSources, message: 'success' });
});

// GET /api/datasource/:id/data - Query data source data
router.get('/:id/data', (req, res) => {
  const { id } = req.params;
  const { fields } = req.query;

  let data: any[] = [];

  switch (id) {
    case 'line-production':
      data = lineProductionData;
      break;
    case 'equipment':
      data = equipmentList;
      break;
    case 'quality':
      data = qualityRecords;
      break;
    case 'orders':
      data = workOrders;
      break;
    case 'weekly-defects':
      data = weeklyDefectData;
      break;
    default:
      return res.status(404).json({ code: 1, data: null, message: 'Data source not found' });
  }

  // Apply field projection if specified
  if (fields && typeof fields === 'string') {
    const fieldList = fields.split(',');
    data = data.map((row) => {
      const projected: any = {};
      fieldList.forEach((field) => {
        if (field in row) {
          projected[field] = row[field];
        }
      });
      return projected;
    });
  }

  res.json({ code: 0, data, message: 'success' });
});

export default router;
