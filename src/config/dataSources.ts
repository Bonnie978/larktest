import type { DataSourceType } from '@/types/dashboard';

export interface DataSourceMeta {
  label: string;
  dimensions: { field: string; label: string }[];
  metrics: { field: string; label: string }[];
}

export const dataSourceMeta: Record<DataSourceType, DataSourceMeta> = {
  'line-production': {
    label: '产线产量',
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
  'weekly-defects': {
    label: '每日质量',
    dimensions: [
      { field: 'date', label: '日期' },
      { field: 'mainDefectType', label: '主要缺陷类型' },
    ],
    metrics: [
      { field: 'inspectedQty', label: '检验数量' },
      { field: 'defectQty', label: '不良数量' },
      { field: 'defectRate', label: '不良率' },
    ],
  },
  'equipment': {
    label: '设备状态',
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
  'quality-records': {
    label: '质量记录',
    dimensions: [
      { field: 'lineName', label: '产线名称' },
      { field: 'defectType', label: '缺陷类型' },
    ],
    metrics: [
      { field: 'defectCount', label: '缺陷数量' },
    ],
  },
  'work-orders': {
    label: '工单管理',
    dimensions: [
      { field: 'productModel', label: '产品型号' },
      { field: 'deliveryStatus', label: '交付状态' },
    ],
    metrics: [
      { field: 'plannedQty', label: '计划数量' },
      { field: 'completedQty', label: '完成数量' },
    ],
  },
};
