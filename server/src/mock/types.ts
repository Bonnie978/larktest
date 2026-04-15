export interface KPIData {
  label: string;
  value: string;
  unit?: string;
}

export interface ProductionLine {
  id: string;
  name: string;
  workshop: string;
  shiftMode: string;
  currentShift: string;
  staffCount: number;
  status: '运行中' | '停机' | '维保';
  hourlyOutput: { hour: string; output: number }[];
  currentOrder: string;
}

export interface Equipment {
  id: string;
  name: string;
  lineId: string;
  lineName: string;
  type: string;
  availability: number;
  performance: number;
  quality: number;
  oee: number;
  status: '运行中' | '停机' | '维修中' | '待机';
}

export interface QualityRecord {
  id: string;
  batchNo: string;
  lineId: string;
  lineName: string;
  defectType: '尺寸超差' | '外观划伤' | '焊接虚焊' | '装配错误' | '功能失效';
  defectCount: number;
  inspector: string;
  occurTime: string;
  status: '待处理' | '处理中' | '已关闭';
  description: string;
  resolution: string;
}

export interface WorkOrder {
  id: string;
  productModel: string;
  customer: string;
  plannedQty: number;
  completedQty: number;
  plannedStart: string;
  plannedEnd: string;
  actualEnd: string | null;
  deliveryStatus: '准时' | '延期' | '风险' | '进行中';
}

export interface LineProductionRow {
  lineId: string;
  lineName: string;
  shift: string;
  planned: number;
  actual: number;
  completionRate: number;
  status: '正常' | '预警' | '异常';
}

export interface WeeklyDefectRow {
  date: string;
  inspectedQty: number;
  defectQty: number;
  defectRate: number;
  mainDefectType: string;
}
