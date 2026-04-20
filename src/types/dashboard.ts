export type DataSourceType =
  | 'line-production'
  | 'weekly-defects'
  | 'equipment'
  | 'quality-records'
  | 'work-orders';

export type AggregationType = 'sum' | 'avg' | 'count' | 'max' | 'min';
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
