export type DataSourceType =
  | 'line-production'
  | 'equipment'
  | 'quality'
  | 'orders'
  | 'weekly-defects';

export type AggregationType = 'sum' | 'avg' | 'count' | 'max' | 'min' | 'none';
export type ChartType = 'bar' | 'line' | 'pie' | 'area';

export interface LayoutConfig {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ChartConfig {
  id: string;
  title: string;
  dataSource: DataSourceType;
  dimension: string;
  metrics: string[];
  aggregation: AggregationType;
  chartType: ChartType;
  layout: LayoutConfig;
}

export interface AggregatedDataPoint {
  category: string;
  value: number;
}

export interface AggregatedData {
  name: string;
  data: AggregatedDataPoint[];
}

// CardConfig for DashboardEditor (compatible with existing code)
export interface CardConfig {
  id: string;
  title: string;
  dataSourceId: string;
  chartType: ChartType;
  groupByField: string;
  valueFields: string[];
  aggregation: AggregationType;
}

// DataSourceMeta from backend API
export interface DataSourceField {
  key: string;
  label: string;
  type: 'string' | 'number';
}

export interface DataSourceMeta {
  id: string;
  name: string;
  fields: DataSourceField[];
}
