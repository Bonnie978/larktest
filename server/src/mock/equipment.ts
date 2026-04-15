import type { Equipment } from './types';

export const equipmentList: Equipment[] = [
  // A线-冲压 (4台)
  { id: 'EQ-A01', name: '冲压机 #1', lineId: 'LINE-A', lineName: 'A线-冲压', type: '冲压机', availability: 91.3, performance: 88.7, quality: 97.2, oee: 78.6, status: '运行中' },
  { id: 'EQ-A02', name: '冲压机 #2', lineId: 'LINE-A', lineName: 'A线-冲压', type: '冲压机', availability: 87.5, performance: 85.3, quality: 96.8, oee: 72.3, status: '运行中' },
  { id: 'EQ-A03', name: '冲压机 #3', lineId: 'LINE-A', lineName: 'A线-冲压', type: '冲压机', availability: 45.2, performance: 0, quality: 0, oee: 0, status: '维修中' },
  { id: 'EQ-A04', name: '液压剪板机', lineId: 'LINE-A', lineName: 'A线-冲压', type: '剪板机', availability: 93.8, performance: 91.2, quality: 98.1, oee: 83.9, status: '运行中' },

  // B线-焊接 (4台)
  { id: 'EQ-B01', name: '焊接机器人 #1', lineId: 'LINE-B', lineName: 'B线-焊接', type: '焊接机器人', availability: 89.4, performance: 86.1, quality: 95.7, oee: 73.7, status: '运行中' },
  { id: 'EQ-B02', name: '焊接机器人 #2', lineId: 'LINE-B', lineName: 'B线-焊接', type: '焊接机器人', availability: 92.1, performance: 90.5, quality: 97.3, oee: 81.1, status: '运行中' },
  { id: 'EQ-B03', name: '焊接机器人 #3', lineId: 'LINE-B', lineName: 'B线-焊接', type: '焊接机器人', availability: 78.6, performance: 72.4, quality: 93.1, oee: 53.0, status: '待机' },
  { id: 'EQ-B04', name: '点焊专机', lineId: 'LINE-B', lineName: 'B线-焊接', type: '点焊机', availability: 85.3, performance: 82.7, quality: 96.4, oee: 68.0, status: '运行中' },

  // C线-涂装 (4台)
  { id: 'EQ-C01', name: '自动喷涂线 #1', lineId: 'LINE-C', lineName: 'C线-涂装', type: '喷涂设备', availability: 94.7, performance: 92.8, quality: 98.6, oee: 86.6, status: '运行中' },
  { id: 'EQ-C02', name: '自动喷涂线 #2', lineId: 'LINE-C', lineName: 'C线-涂装', type: '喷涂设备', availability: 96.2, performance: 94.1, quality: 99.1, oee: 89.7, status: '运行中' },
  { id: 'EQ-C03', name: '烘干炉', lineId: 'LINE-C', lineName: 'C线-涂装', type: '烘干设备', availability: 97.8, performance: 95.6, quality: 99.4, oee: 92.8, status: '运行中' },
  { id: 'EQ-C04', name: '前处理清洗机', lineId: 'LINE-C', lineName: 'C线-涂装', type: '清洗设备', availability: 90.5, performance: 87.3, quality: 97.9, oee: 77.3, status: '运行中' },

  // D线-总装 (4台)
  { id: 'EQ-D01', name: '装配台 #1', lineId: 'LINE-D', lineName: 'D线-总装', type: '装配台', availability: 88.9, performance: 84.6, quality: 96.2, oee: 72.3, status: '运行中' },
  { id: 'EQ-D02', name: '装配台 #2', lineId: 'LINE-D', lineName: 'D线-总装', type: '装配台', availability: 91.7, performance: 89.4, quality: 97.5, oee: 79.9, status: '运行中' },
  { id: 'EQ-D03', name: '拧紧机', lineId: 'LINE-D', lineName: 'D线-总装', type: '拧紧设备', availability: 86.3, performance: 81.9, quality: 95.8, oee: 67.7, status: '运行中' },
  { id: 'EQ-D04', name: '功能检测台', lineId: 'LINE-D', lineName: 'D线-总装', type: '检测设备', availability: 0, performance: 0, quality: 0, oee: 0, status: '停机' },

  // E线-包装 (2台)
  { id: 'EQ-E01', name: '自动封箱机', lineId: 'LINE-E', lineName: 'E线-包装', type: '封箱机', availability: 82.4, performance: 79.6, quality: 98.3, oee: 64.5, status: '待机' },
  { id: 'EQ-E02', name: '缠绕包装机', lineId: 'LINE-E', lineName: 'E线-包装', type: '包装机', availability: 84.1, performance: 80.8, quality: 97.6, oee: 66.3, status: '待机' },
];
