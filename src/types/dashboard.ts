export type DataSourceType =
  | 'line-production'
  | 'equipment-oee'
  | 'quality-defects'
  | 'order-delivery'
  | 'shift-output';

export type AggregationType = 'sum' | 'avg' | 'count' | 'max' | 'min' | 'none';
export type ChartType = 'bar' | 'line' | 'pie' | 'area';

/** API-shaped data source field */
export interface DataSourceField {
  name: string;
  type: 'string' | 'number' | 'date';
  label: string;
}

/** API-shaped data source metadata (matches server response) */
export interface DataSourceMeta {
  id: string;
  name: string;
  description: string;
  fields: DataSourceField[];
}

/** Card configuration used by DashboardEditor / ChartBuilder */
export interface CardConfig {
  id: string;
  title: string;
  dataSourceId: string;
  chartType: 'bar' | 'line' | 'pie';
  groupByField: string;
  valueFields: string[];
  aggregation: AggregationType;
}

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
