import { request } from './request';
import type {
  KPIData,
  LineProductionRow,
  WeeklyDefectRow,
  ProductionLine,
  Equipment,
  QualityRecord,
  WorkOrder,
} from '@/mock/types';
import type { DataSourceMeta } from '@/types/dashboard';

// 生产概览
export const getKPI = () => request<KPIData[]>('/production/kpi');
export const getLineProduction = () => request<LineProductionRow[]>('/production/lines');
export const getWeeklyDefects = () => request<WeeklyDefectRow[]>('/production/defects');

// 产线管理
export const getLines = () => request<ProductionLine[]>('/lines');
export const getLineDetail = (id: string) => request<ProductionLine>(`/lines/${id}`);

// 设备管理
export const getEquipment = (params?: { lineId?: string; status?: string }) =>
  request<Equipment[]>('/equipment', params as Record<string, string>);

// 质量管理
export const getQualityRecords = (params?: { lineName?: string; defectType?: string; status?: string }) =>
  request<QualityRecord[]>('/quality', params as Record<string, string>);

// 工单管理
export const getOrders = () => request<WorkOrder[]>('/orders');

// 数据源
export const getDatasources = () => request<DataSourceMeta[]>('/datasource');
export const getDatasourceData = (id: string, params?: Record<string, string>) =>
  request<Record<string, any>[]>(`/datasource/${id}/data`, params);
