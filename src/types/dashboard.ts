// src/types/dashboard.ts

export type ChartType = 'bar' | 'line' | 'pie' | 'number' | 'table';
export type Aggregation = 'sum' | 'avg' | 'count' | 'max' | 'none';

export interface FieldMeta {
  key: string;
  label: string;
  type: 'string' | 'number';
  description?: string;
}

export interface DataSourceMeta {
  id: string;
  name: string;
  icon: string;
  fields: FieldMeta[];
}

export interface CardConfig {
  id: string;
  title: string;
  dataSourceId: string;
  chartType: ChartType;
  groupByField: string;
  valueFields: string[];
  aggregation: Aggregation;
}

export interface GridPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DashboardCard {
  config: CardConfig;
  grid: GridPosition;
}

export interface DashboardLayout {
  version: 2;
  cards: DashboardCard[];
}
