import { lineProductionData, weeklyDefectData } from './production.js';
import { equipmentList } from './equipment.js';
import { qualityRecords } from './quality.js';
import { workOrders } from './orders.js';

export interface DataSourceField {
  name: string;
  type: 'string' | 'number' | 'date';
  label: string;
}

export interface DataSource {
  id: string;
  name: string;
  description: string;
  fields: DataSourceField[];
  data: any[];
}

export const dataSources: DataSource[] = [
  {
    id: 'line-production',
    name: '产线产量',
    description: '各产线班次产量完成情况',
    fields: [
      { name: 'lineId', type: 'string', label: '产线ID' },
      { name: 'lineName', type: 'string', label: '产线名称' },
      { name: 'shift', type: 'string', label: '班次' },
      { name: 'planned', type: 'number', label: '计划产量' },
      { name: 'actual', type: 'number', label: '实际产量' },
      { name: 'completionRate', type: 'number', label: '完成率(%)' },
      { name: 'status', type: 'string', label: '状态' },
    ],
    data: lineProductionData,
  },
  {
    id: 'equipment',
    name: '设备状态',
    description: '设备运行状态与OEE指标',
    fields: [
      { name: 'id', type: 'string', label: '设备ID' },
      { name: 'name', type: 'string', label: '设备名称' },
      { name: 'lineId', type: 'string', label: '所属产线ID' },
      { name: 'lineName', type: 'string', label: '所属产线' },
      { name: 'type', type: 'string', label: '设备类型' },
      { name: 'availability', type: 'number', label: '可用率(%)' },
      { name: 'performance', type: 'number', label: '性能率(%)' },
      { name: 'quality', type: 'number', label: '质量率(%)' },
      { name: 'oee', type: 'number', label: 'OEE(%)' },
      { name: 'status', type: 'string', label: '状态' },
    ],
    data: equipmentList,
  },
  {
    id: 'quality',
    name: '质量记录',
    description: '质量缺陷记录与处理状态',
    fields: [
      { name: 'id', type: 'string', label: '记录ID' },
      { name: 'batchNo', type: 'string', label: '批次号' },
      { name: 'lineId', type: 'string', label: '产线ID' },
      { name: 'lineName', type: 'string', label: '产线名称' },
      { name: 'defectType', type: 'string', label: '缺陷类型' },
      { name: 'defectCount', type: 'number', label: '缺陷数量' },
      { name: 'inspector', type: 'string', label: '检验员' },
      { name: 'occurTime', type: 'date', label: '发生时间' },
      { name: 'status', type: 'string', label: '状态' },
      { name: 'description', type: 'string', label: '描述' },
      { name: 'resolution', type: 'string', label: '处理方案' },
    ],
    data: qualityRecords,
  },
  {
    id: 'orders',
    name: '工单管理',
    description: '生产工单与交付状态',
    fields: [
      { name: 'id', type: 'string', label: '工单ID' },
      { name: 'productModel', type: 'string', label: '产品型号' },
      { name: 'customer', type: 'string', label: '客户' },
      { name: 'plannedQty', type: 'number', label: '计划数量' },
      { name: 'completedQty', type: 'number', label: '完成数量' },
      { name: 'plannedStart', type: 'date', label: '计划开始' },
      { name: 'plannedEnd', type: 'date', label: '计划结束' },
      { name: 'actualEnd', type: 'date', label: '实际结束' },
      { name: 'deliveryStatus', type: 'string', label: '交付状态' },
    ],
    data: workOrders,
  },
  {
    id: 'weekly-defect',
    name: '周缺陷统计',
    description: '每日缺陷率统计',
    fields: [
      { name: 'date', type: 'date', label: '日期' },
      { name: 'inspectedQty', type: 'number', label: '检验数量' },
      { name: 'defectQty', type: 'number', label: '缺陷数量' },
      { name: 'defectRate', type: 'number', label: '缺陷率(%)' },
      { name: 'mainDefectType', type: 'string', label: '主要缺陷类型' },
    ],
    data: weeklyDefectData,
  },
];
