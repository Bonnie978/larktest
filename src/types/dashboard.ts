export type DataSourceType =
  | 'line-production'
  | 'equipment-oee'
  | 'quality-defects'
  | 'order-delivery'
  | 'shift-output'
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

export interface DataSourceField {
  name: string;
  type: 'string' | 'number' | 'date';
  label: string;
}

export interface DataSourceMeta {
  id: string;
  name: string;
  description: string;
  fields: DataSourceField[];
}

export interface CardConfig {
  id: string;
  title: string;
  dataSourceId: string;
  chartType: ChartType;
  groupByField: string;
  valueFields: string[];
  aggregation: AggregationType;
}
