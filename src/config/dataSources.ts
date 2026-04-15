// src/config/dataSources.ts
import type { DataSourceMeta } from '@/types/dashboard';

export const DATA_SOURCES: DataSourceMeta[] = [
  {
    id: 'line-production',
    name: '产线数据',
    icon: '🏭',
    fields: [
      { key: 'lineName', label: '产线名称', type: 'string' },
      { key: 'shift', label: '班次', type: 'string' },
      { key: 'planned', label: '计划产量', type: 'number' },
      { key: 'actual', label: '实际产量', type: 'number' },
      { key: 'completionRate', label: '完成率', type: 'number', description: '百分比' },
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
      { key: 'availability', label: '稼动率', type: 'number' },
      { key: 'performance', label: '性能率', type: 'number' },
      { key: 'quality', label: '良品率', type: 'number' },
      { key: 'oee', label: 'OEE', type: 'number', description: '综合设备效率' },
    ],
  },
  {
    id: 'quality',
    name: '质量数据',
    icon: '🔍',
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
    icon: '📋',
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
    name: '不良趋势(周)',
    icon: '📈',
    fields: [
      { key: 'date', label: '日期', type: 'string' },
      { key: 'mainDefectType', label: '主要不良类型', type: 'string' },
      { key: 'inspectedQty', label: '检验数量', type: 'number' },
      { key: 'defectQty', label: '不良数', type: 'number' },
      { key: 'defectRate', label: '不良率', type: 'number' },
    ],
  },
];

export function getDataSourceMeta(id: string): DataSourceMeta | undefined {
  return DATA_SOURCES.find((ds) => ds.id === id);
}
