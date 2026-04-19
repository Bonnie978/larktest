import { Router } from 'express';
import { lineProductionData, weeklyDefectData } from '../mock/production.js';
import { productionLines } from '../mock/lines.js';
import { equipmentList } from '../mock/equipment.js';
import { qualityRecords } from '../mock/quality.js';
import { workOrders } from '../mock/orders.js';

const router = Router();

// 数据源元数据定义
const datasources = [
  {
    id: 'line-production',
    name: '产线生产数据',
    fields: [
      { name: 'lineId', type: 'string', label: '产线ID' },
      { name: 'lineName', type: 'string', label: '产线名称' },
      { name: 'shift', type: 'string', label: '班次' },
      { name: 'planned', type: 'number', label: '计划产量' },
      { name: 'actual', type: 'number', label: '实际产量' },
      { name: 'completionRate', type: 'number', label: '完成率' },
      { name: 'status', type: 'string', label: '状态' },
    ],
  },
  {
    id: 'equipment',
    name: '设备状态数据',
    fields: [
      { name: 'id', type: 'string', label: '设备ID' },
      { name: 'name', type: 'string', label: '设备名称' },
      { name: 'lineId', type: 'string', label: '所属产线ID' },
      { name: 'lineName', type: 'string', label: '所属产线' },
      { name: 'type', type: 'string', label: '设备类型' },
      { name: 'availability', type: 'number', label: '可用率' },
      { name: 'performance', type: 'number', label: '性能率' },
      { name: 'quality', type: 'number', label: '质量率' },
      { name: 'oee', type: 'number', label: 'OEE' },
      { name: 'status', type: 'string', label: '状态' },
    ],
  },
  {
    id: 'quality',
    name: '质量记录数据',
    fields: [
      { name: 'id', type: 'string', label: '记录ID' },
      { name: 'batchNo', type: 'string', label: '批次号' },
      { name: 'lineId', type: 'string', label: '产线ID' },
      { name: 'lineName', type: 'string', label: '产线名称' },
      { name: 'defectType', type: 'string', label: '缺陷类型' },
      { name: 'defectCount', type: 'number', label: '缺陷数量' },
      { name: 'inspector', type: 'string', label: '检验员' },
      { name: 'occurTime', type: 'string', label: '发生时间' },
      { name: 'status', type: 'string', label: '状态' },
      { name: 'description', type: 'string', label: '描述' },
      { name: 'resolution', type: 'string', label: '解决方案' },
    ],
  },
  {
    id: 'orders',
    name: '工单数据',
    fields: [
      { name: 'id', type: 'string', label: '工单ID' },
      { name: 'productModel', type: 'string', label: '产品型号' },
      { name: 'customer', type: 'string', label: '客户' },
      { name: 'plannedQty', type: 'number', label: '计划数量' },
      { name: 'completedQty', type: 'number', label: '完成数量' },
      { name: 'plannedStart', type: 'string', label: '计划开始' },
      { name: 'plannedEnd', type: 'string', label: '计划结束' },
      { name: 'actualEnd', type: 'string', label: '实际结束' },
      { name: 'deliveryStatus', type: 'string', label: '交付状态' },
    ],
  },
  {
    id: 'weekly-defects',
    name: '周缺陷统计',
    fields: [
      { name: 'date', type: 'string', label: '日期' },
      { name: 'inspectedQty', type: 'number', label: '检验数量' },
      { name: 'defectQty', type: 'number', label: '缺陷数量' },
      { name: 'defectRate', type: 'number', label: '缺陷率' },
      { name: 'mainDefectType', type: 'string', label: '主要缺陷类型' },
    ],
  },
];

// 数据源ID到实际数据的映射
const dataMapping: Record<string, any[]> = {
  'line-production': lineProductionData,
  'equipment': equipmentList,
  'quality': qualityRecords,
  'orders': workOrders,
  'weekly-defects': weeklyDefectData,
};

// GET /api/datasource - 获取所有数据源元数据
router.get('/', (_req, res) => {
  res.json({ code: 0, data: datasources, message: 'success' });
});

// GET /api/datasource/:id/data - 获取指定数据源的数据
router.get('/:id/data', (req, res) => {
  const { id } = req.params;
  const { fields, query } = req.query;

  // 获取原始数据
  const rawData = dataMapping[id];
  if (!rawData) {
    return res.status(404).json({ code: 404, message: '数据源不存在' });
  }

  let result = [...rawData];

  // 处理 query 参数（等值筛选）
  if (query && typeof query === 'string') {
    try {
      const queryObj = JSON.parse(query);
      result = result.filter((item) => {
        return Object.entries(queryObj).every(([key, value]) => item[key] === value);
      });
    } catch (e) {
      return res.status(400).json({ code: 400, message: 'query 参数格式错误' });
    }
  }

  // 处理 fields 参数（字段投影）
  if (fields && typeof fields === 'string') {
    const fieldList = fields.split(',').map((f) => f.trim());
    result = result.map((item) => {
      const projected: Record<string, any> = {};
      fieldList.forEach((field) => {
        if (field in item) {
          projected[field] = item[field];
        }
      });
      return projected;
    });
  }

  res.json({ code: 0, data: result, message: 'success' });
});

export default router;
