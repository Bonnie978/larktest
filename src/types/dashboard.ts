export type ChartType = 'bar' | 'line' | 'pie';
export type AggregationType = 'none' | 'sum' | 'avg' | 'count' | 'max' | 'min';

export interface CardConfig {
  id: string;
  title: string;
  dataSourceId: string;
  dimension: string;
  metrics: string[];
  aggregation: AggregationType;
  chartType: ChartType;
}

export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

export interface DashboardConfig {
  cards: CardConfig[];
  layout: LayoutItem[];
  version: string;
}
