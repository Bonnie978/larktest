import KPICard from '@/components/KPICard';
import Table, { type Column } from '@/components/Table';
import Tag from '@/components/Tag';
import { kpiData, lineProductionData, weeklyDefectData } from '@/mock/production';
import type { LineProductionRow, WeeklyDefectRow } from '@/mock/types';

export default function Overview() {
  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const productionColumns: Column<LineProductionRow>[] = [
    { key: 'lineName', title: '产线编号' },
    { key: 'shift', title: '班次', width: '80px' },
    { key: 'planned', title: '计划产量', align: 'right', render: (v: number) => v.toLocaleString() },
    { key: 'actual', title: '实际产量', align: 'right', render: (v: number) => v.toLocaleString() },
    {
      key: 'completionRate',
      title: '完成率',
      align: 'right',
      render: (v: number) => (
        <span className={v < 85 ? 'text-danger font-medium' : 'text-text-primary'}>{v}%</span>
      ),
    },
    {
      key: 'status',
      title: '状态',
      width: '80px',
      align: 'center',
      render: (_: any, record: LineProductionRow) => (
        <Tag type={record.completionRate < 85 ? 'warning' : 'success'}>
          {record.completionRate < 85 ? '未达标' : '达标'}
        </Tag>
      ),
    },
  ];

  const defectColumns: Column<WeeklyDefectRow>[] = [
    { key: 'date', title: '日期' },
    { key: 'inspectedQty', title: '检验数量', align: 'right', render: (v: number) => v.toLocaleString() },
    { key: 'defectQty', title: '不良数', align: 'right', render: (v: number) => v.toLocaleString() },
    {
      key: 'defectRate',
      title: '不良率',
      align: 'right',
      render: (v: number) => (
        <span className={v > 2.5 ? 'text-danger font-medium' : 'text-text-primary'}>{v}%</span>
      ),
    },
    { key: 'mainDefectType', title: '主要不良类型' },
  ];

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-text-primary">生产概览</h1>
        <span className="text-sm text-text-tertiary">{today}</span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4">
        {kpiData.map((kpi, index) => (
          <KPICard key={index} label={kpi.label} value={kpi.value} unit={kpi.unit} />
        ))}
      </div>

      {/* Production Table */}
      <div className="bg-white rounded-lg border border-border shadow-sm">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-[15px] font-medium text-text-primary">产线产量完成情况</h2>
        </div>
        <Table<LineProductionRow>
          columns={productionColumns}
          data={lineProductionData}
          rowKey="lineId"
        />
      </div>

      {/* Defect Table */}
      <div className="bg-white rounded-lg border border-border shadow-sm">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-[15px] font-medium text-text-primary">近 7 天不良数据汇总</h2>
        </div>
        <Table<WeeklyDefectRow>
          columns={defectColumns}
          data={weeklyDefectData}
          rowKey="date"
        />
      </div>
    </div>
  );
}
