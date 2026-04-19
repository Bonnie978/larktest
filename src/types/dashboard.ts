// 图表类型枚举
export type ChartType = "bar" | "line" | "pie";

// 聚合方式枚举
export type AggregationType = "none" | "sum" | "avg" | "count" | "max";

// 图表卡片配置
export interface CardConfig {
  id: string;               // 唯一标识 Date.now().toString()
  title: string;            // 图表标题
  dataSourceId: string;     // 数据源 ID
  chartType: ChartType;
  groupByField: string;     // X 轴维度字段 key
  valueFields: string[];    // Y 轴数值字段 key[]
  aggregation: AggregationType;
}

// 网格布局位置
export interface GridPosition {
  x: number; y: number;     // 网格坐标
  w: number; h: number;     // 宽高（网格单位）
}

// 看板卡片（配置 + 位置）
export interface DashboardCard {
  config: CardConfig;
  grid: GridPosition;
}

// localStorage 持久化结构
export interface DashboardState {
  version: 2;
  cards: DashboardCard[];
}

// 数据源字段定义
export interface DataSourceField {
  name: string;
  type: 'string' | 'number' | 'date';
  label: string;
}

// 数据源元数据
export interface DataSourceMeta {
  id: string;
  name: string;
  description: string;
  fields: DataSourceField[];
}
