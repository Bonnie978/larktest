import type { Column } from './Table';
import type { ChartConfig } from './ChartCard';
import {
  getLineProduction,
  getWeeklyDefects,
  getEquipment,
  getOrders,
  getKPI,
} from '@/api';
import type {
  LineProductionRow,
  WeeklyDefectRow,
  Equipment,
  KPIData,
} from '@/mock/types';

export type ChartType = 'table' | 'bar' | 'line' | 'pie';

export interface Indicator {
  id: string;
  name: string;
  category: '生产' | '质量' | '设备' | '工单';
  supportedChartTypes: ChartType[];
  defaultChartType: ChartType;
  fetchData: () => Promise<any[]>;
  chartConfig: ChartConfig;
  columns: Column<any>[];
}

export const indicators: Indicator[] = [
  {
    id: 'line-production',
    name: '产线产量完成情况',
    category: '生产',
    supportedChartTypes: ['table', 'bar', 'line'],
    defaultChartType: 'bar',
    fetchData: getLineProduction,
    chartConfig: {
      xKey: 'lineName',
      bars: [
        { dataKey: 'planned', name: '计划产量', fill: '#1664FF' },
        { dataKey: 'actual', name: '实际产量', fill: '#14C9C9' },
      ],
      lines: [
        { dataKey: 'planned', name: '计划产量', stroke: '#1664FF' },
        { dataKey: 'actual', name: '实际产量', stroke: '#14C9C9' },
      ],
    },
    columns: [
      { key: 'lineName', title: '产线编号' },
      { key: 'shift', title: '班次' },
      {
        key: 'planned',
        title: '计划产量',
        align: 'right',
        render: (v: number) => v.toLocaleString(),
      },
      {
        key: 'actual',
        title: '实际产量',
        align: 'right',
        render: (v: number) => v.toLocaleString(),
      },
      {
        key: 'completionRate',
        title: '完成率',
        align: 'right',
        render: (v: number) => `${v}%`,
      },
    ] as Column<LineProductionRow>[],
  },
  {
    id: 'weekly-defect-rate',
    name: '近7天不良率趋势',
    category: '质量',
    supportedChartTypes: ['table', 'line'],
    defaultChartType: 'line',
    fetchData: getWeeklyDefects,
    chartConfig: {
      xKey: 'date',
      lines: [{ dataKey: 'defectRate', name: '不良率(%)', stroke: '#F53F3F' }],
    },
    columns: [
      { key: 'date', title: '日期' },
      {
        key: 'inspectedQty',
        title: '检验数量',
        align: 'right',
        render: (v: number) => v.toLocaleString(),
      },
      {
        key: 'defectQty',
        title: '不良数',
        align: 'right',
        render: (v: number) => v.toLocaleString(),
      },
      {
        key: 'defectRate',
        title: '不良率',
        align: 'right',
        render: (v: number) => `${v}%`,
      },
      { key: 'mainDefectType', title: '主要不良类型' },
    ] as Column<WeeklyDefectRow>[],
  },
  {
    id: 'defect-type-distribution',
    name: '不良类型分布',
    category: '质量',
    supportedChartTypes: ['table', 'pie', 'bar'],
    defaultChartType: 'pie',
    fetchData: async () => {
      const data = await getWeeklyDefects();
      const countMap: Record<string, number> = {};
      data.forEach((row) => {
        const type = row.mainDefectType;
        countMap[type] = (countMap[type] || 0) + 1;
      });
      return Object.entries(countMap).map(([name, value]) => ({ name, value }));
    },
    chartConfig: {
      pieDataKey: 'value',
      pieNameKey: 'name',
      xKey: 'name',
      bars: [{ dataKey: 'value', name: '出现次数', fill: '#1664FF' }],
    },
    columns: [
      { key: 'name', title: '不良类型' },
      { key: 'value', title: '出现次数', align: 'right' },
    ],
  },
  {
    id: 'equipment-oee',
    name: '设备OEE排行',
    category: '设备',
    supportedChartTypes: ['table', 'bar'],
    defaultChartType: 'bar',
    fetchData: async () => {
      const data = await getEquipment();
      return data.map((e) => ({ name: e.name, oee: e.oee }));
    },
    chartConfig: {
      xKey: 'name',
      bars: [{ dataKey: 'oee', name: 'OEE(%)', fill: '#1664FF' }],
    },
    columns: [
      { key: 'name', title: '设备名称' },
      {
        key: 'oee',
        title: 'OEE(%)',
        align: 'right',
        render: (v: number) => `${v}%`,
      },
    ] as Column<Equipment>[],
  },
  {
    id: 'order-status',
    name: '工单交付状态分布',
    category: '工单',
    supportedChartTypes: ['table', 'pie'],
    defaultChartType: 'pie',
    fetchData: async () => {
      const data = await getOrders();
      const countMap: Record<string, number> = {};
      data.forEach((o) => {
        const status = o.deliveryStatus;
        countMap[status] = (countMap[status] || 0) + 1;
      });
      return Object.entries(countMap).map(([name, value]) => ({ name, value }));
    },
    chartConfig: {
      pieDataKey: 'value',
      pieNameKey: 'name',
      xKey: 'name',
      bars: [{ dataKey: 'value', name: '工单数', fill: '#1664FF' }],
    },
    columns: [
      { key: 'name', title: '交付状态' },
      { key: 'value', title: '工单数', align: 'right' },
    ],
  },
  {
    id: 'kpi-overview',
    name: 'KPI概览',
    category: '生产',
    supportedChartTypes: ['table'],
    defaultChartType: 'table',
    fetchData: getKPI,
    chartConfig: {},
    columns: [
      { key: 'label', title: '指标' },
      { key: 'value', title: '数值', align: 'right' },
      { key: 'unit', title: '单位' },
    ] as Column<KPIData>[],
  },
];
