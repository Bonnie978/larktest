import type { KPIData, LineProductionRow, WeeklyDefectRow } from './types';

export const kpiData: KPIData[] = [
  { label: '今日计划产量', value: '12,400', unit: '件' },
  { label: '实际产量', value: '11,137', unit: '件' },
  { label: 'OEE', value: '73.2', unit: '%' },
  { label: '不良率', value: '2.41', unit: '%' },
  { label: '准时交付率', value: '86.5', unit: '%' },
];

export const lineProductionData: LineProductionRow[] = [
  { lineId: 'LINE-A', lineName: 'A线-冲压', shift: '白班', planned: 2000, actual: 1876, completionRate: 93.8, status: '正常' },
  { lineId: 'LINE-B', lineName: 'B线-焊接', shift: '白班', planned: 1800, actual: 1423, completionRate: 79.1, status: '预警' },
  { lineId: 'LINE-C', lineName: 'C线-涂装', shift: '白班', planned: 2400, actual: 2390, completionRate: 99.6, status: '正常' },
  { lineId: 'LINE-D', lineName: 'D线-总装', shift: '白班', planned: 2200, actual: 1987, completionRate: 90.3, status: '正常' },
  { lineId: 'LINE-E', lineName: 'E线-包装', shift: '白班', planned: 1800, actual: 1461, completionRate: 81.2, status: '预警' },
];

export const weeklyDefectData: WeeklyDefectRow[] = [
  { date: '2026-04-09', inspectedQty: 2340, defectQty: 47, defectRate: 2.01, mainDefectType: '外观划伤' },
  { date: '2026-04-10', inspectedQty: 2580, defectQty: 63, defectRate: 2.44, mainDefectType: '尺寸超差' },
  { date: '2026-04-11', inspectedQty: 2710, defectQty: 78, defectRate: 2.88, mainDefectType: '焊接虚焊' },
  { date: '2026-04-12', inspectedQty: 2150, defectQty: 34, defectRate: 1.58, mainDefectType: '外观划伤' },
  { date: '2026-04-13', inspectedQty: 2890, defectQty: 56, defectRate: 1.94, mainDefectType: '装配错误' },
  { date: '2026-04-14', inspectedQty: 2460, defectQty: 72, defectRate: 2.93, mainDefectType: '尺寸超差' },
  { date: '2026-04-15', inspectedQty: 2780, defectQty: 51, defectRate: 1.83, mainDefectType: '功能失效' },
];
