export type DataSourceType = 'production' | 'equipment' | 'quality' | 'order' | 'shift';

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
  metric: string;
  aggregation: AggregationType;
  chartType: ChartType;
  layout: LayoutConfig;
}
