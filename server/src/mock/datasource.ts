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
  },
  {
    id: 'weekly-defects',
    name: '每日质量',
    description: '近7日质量检验与不良统计',
    fields: [
      { name: 'date', type: 'string', label: '日期' },
      { name: 'mainDefectType', type: 'string', label: '主要缺陷类型' },
      { name: 'inspectedQty', type: 'number', label: '检验数量' },
      { name: 'defectQty', type: 'number', label: '不良数量' },
      { name: 'defectRate', type: 'number', label: '不良率(%)' },
    ],
  },
  {
    id: 'equipment',
    name: '设备状态',
    description: '设备OEE与运行状态',
    fields: [
      { name: 'lineName', type: 'string', label: '所属产线' },
      { name: 'name', type: 'string', label: '设备名称' },
      { name: 'type', type: 'string', label: '设备类型' },
      { name: 'status', type: 'string', label: '状态' },
      { name: 'availability', type: 'number', label: '可用率(%)' },
      { name: 'performance', type: 'number', label: '性能率(%)' },
      { name: 'quality', type: 'number', label: '质量率(%)' },
      { name: 'oee', type: 'number', label: 'OEE(%)' },
    ],
  },
  {
    id: 'quality-records',
    name: '质量记录',
    description: '质量缺陷记录与处理状态',
    fields: [
      { name: 'lineName', type: 'string', label: '产线名称' },
      { name: 'defectType', type: 'string', label: '缺陷类型' },
      { name: 'status', type: 'string', label: '处理状态' },
      { name: 'inspector', type: 'string', label: '检验员' },
      { name: 'defectCount', type: 'number', label: '缺陷数量' },
    ],
  },
  {
    id: 'work-orders',
    name: '工单管理',
    description: '生产工单与交付状态',
    fields: [
      { name: 'id', type: 'string', label: '工单号' },
      { name: 'productModel', type: 'string', label: '产品型号' },
      { name: 'customer', type: 'string', label: '客户' },
      { name: 'deliveryStatus', type: 'string', label: '交付状态' },
      { name: 'plannedQty', type: 'number', label: '计划数量' },
      { name: 'completedQty', type: 'number', label: '完成数量' },
    ],
  },
];

export const dataSourceDataMap: Record<string, Record<string, any>[]> = {
  'line-production': lineProductionData,
  'weekly-defects': weeklyDefectData,
  'equipment': equipmentList,
  'quality-records': qualityRecords,
  'work-orders': workOrders,
};
