export type {
  KPIData,
  ProductionLine,
  Equipment,
  QualityRecord,
  WorkOrder,
  LineProductionRow,
  WeeklyDefectRow,
} from './types';

export { kpiData, lineProductionData, weeklyDefectData } from './production';
export { productionLines } from './lines';
export { equipmentList } from './equipment';
export { qualityRecords } from './quality';
export { workOrders } from './orders';
