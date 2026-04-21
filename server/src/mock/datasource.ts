import type { DataSourceMeta } from '../types/datasource.js';
import { lineProductionData, weeklyDefectData } from './production.js';
import { equipmentList } from './equipment.js';
import { qualityRecords } from './quality.js';
import { workOrders } from './orders.js';

export const dataSources: DataSourceMeta[] = [
  {
    id: 'line-production',
    name: '产线产量',
    description: '各产线班次产量完成情况',
    fields: [
      { name: 'lineName', type: 'string', label: '产线名称' },
      { name: 'shift', type: 'string', label: '班次' },
      { name: 'status', type: 'string', label: '状态' },
      { name: 'planned', type: 'number', label: '计划产量' },
      { name: 'actual', type: 'number', label: '实际产量' },
      { name: 'completionRate', type: 'number', label: '完成率(%)' },
    ],
    dimensions: [
      { field: 'lineName', label: '产线名称' },
      { field: 'shift', label: '班次' },
    ],
    metrics: [
      { field: 'planned', label: '计划产量' },
      { field: 'actual', label: '实际产量' },
      { field: 'completionRate', label: '完成率' },
    ],
  },
  {
    id: 'equipment-oee',
    name: '设备OEE',
    description: '设备OEE与运行状态',
    fields: [
      { name: 'name', type: 'string', label: '设备名称' },
      { name: 'lineName', type: 'string', label: '所属产线' },
      { name: 'type', type: 'string', label: '设备类型' },
      { name: 'status', type: 'string', label: '状态' },
      { name: 'availability', type: 'number', label: '可用率(%)' },
      { name: 'performance', type: 'number', label: '性能率(%)' },
      { name: 'quality', type: 'number', label: '质量率(%)' },
      { name: 'oee', type: 'number', label: 'OEE(%)' },
    ],
    dimensions: [
      { field: 'name', label: '设备名称' },
      { field: 'lineName', label: '所属产线' },
    ],
    metrics: [
      { field: 'oee', label: 'OEE' },
      { field: 'availability', label: '可用率' },
      { field: 'performance', label: '性能率' },
      { field: 'quality', label: '质量率' },
    ],
  },
  {
    id: 'quality-defects',
    name: '质量不良',
    description: '质量缺陷记录与处理状态',
    fields: [
      { name: 'lineName', type: 'string', label: '产线名称' },
      { name: 'defectType', type: 'string', label: '缺陷类型' },
      { name: 'status', type: 'string', label: '处理状态' },
      { name: 'inspector', type: 'string', label: '检验员' },
      { name: 'defectCount', type: 'number', label: '缺陷数量' },
    ],
    dimensions: [
      { field: 'lineName', label: '产线名称' },
      { field: 'defectType', label: '不良类型' },
    ],
    metrics: [
      { field: 'defectCount', label: '不良数量' },
    ],
  },
  {
    id: 'order-delivery',
    name: '工单交付',
    description: '生产工单与交付状态',
    fields: [
      { name: 'id', type: 'string', label: '工单号' },
      { name: 'productModel', type: 'string', label: '产品型号' },
      { name: 'customer', type: 'string', label: '客户' },
      { name: 'deliveryStatus', type: 'string', label: '交付状态' },
      { name: 'plannedQty', type: 'number', label: '计划数量' },
      { name: 'completedQty', type: 'number', label: '完成数量' },
    ],
    dimensions: [
      { field: 'productModel', label: '产品型号' },
      { field: 'deliveryStatus', label: '交付状态' },
    ],
    metrics: [
      { field: 'plannedQty', label: '计划数量' },
      { field: 'completedQty', label: '完成数量' },
    ],
  },
  {
    id: 'shift-output',
    name: '班次产量',
    description: '各产线分班次产量统计',
    fields: [
      { name: 'lineName', type: 'string', label: '产线名称' },
      { name: 'shift', type: 'string', label: '班次' },
      { name: 'status', type: 'string', label: '状态' },
      { name: 'planned', type: 'number', label: '计划产量' },
      { name: 'actual', type: 'number', label: '实际产量' },
    ],
    dimensions: [
      { field: 'lineName', label: '产线名称' },
      { field: 'shift', label: '班次' },
    ],
    metrics: [
      { field: 'actual', label: '实际产量' },
      { field: 'planned', label: '计划产量' },
    ],
  },
];

export const dataSourceDataMap: Record<string, Record<string, any>[]> = {
  'line-production': lineProductionData,
  'equipment-oee': equipmentList,
  'quality-defects': qualityRecords,
  'order-delivery': workOrders,
  'shift-output': lineProductionData,
};
