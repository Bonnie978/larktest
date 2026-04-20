import type { DataSourceType } from '@/types/dashboard';

export interface DataSourceMeta {
  label: string;
  dimensions: { field: string; label: string }[];
  metrics: { field: string; label: string }[];
}

export const dataSourceMeta: Record<DataSourceType, DataSourceMeta> = {
  'line-production': {
    label: '产线数据',
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
  'equipment': {
    label: '设备数据',
    dimensions: [
      { field: 'name', label: '设备名称' },
      { field: 'lineName', label: '所属产线' },
      { field: 'type', label: '设备类型' },
      { field: 'status', label: '状态' },
    ],
    metrics: [
      { field: 'availability', label: '稼动率' },
      { field: 'performance', label: '性能率' },
      { field: 'quality', label: '良品率' },
      { field: 'oee', label: 'OEE' },
    ],
  },
  'quality': {
    label: '质量数据',
    dimensions: [
      { field: 'lineName', label: '产线' },
      { field: 'defectType', label: '不良类型' },
      { field: 'inspector', label: '检验员' },
      { field: 'status', label: '处理状态' },
    ],
    metrics: [
      { field: 'defectCount', label: '不良数量' },
    ],
  },
  'orders': {
    label: '工单数据',
    dimensions: [
      { field: 'productModel', label: '产品型号' },
      { field: 'customer', label: '客户名称' },
      { field: 'deliveryStatus', label: '交期状态' },
    ],
    metrics: [
      { field: 'plannedQty', label: '计划数量' },
      { field: 'completedQty', label: '已完成数量' },
    ],
  },
  'weekly-defects': {
    label: '不良趋势-周',
    dimensions: [
      { field: 'date', label: '日期' },
      { field: 'mainDefectType', label: '主要不良类型' },
    ],
    metrics: [
      { field: 'inspectedQty', label: '检验数量' },
      { field: 'defectQty', label: '不良数' },
      { field: 'defectRate', label: '不良率' },
    ],
  },
};
