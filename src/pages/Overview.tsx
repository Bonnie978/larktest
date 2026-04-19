import KPICard from '@/components/KPICard';
import Table, { type Column } from '@/components/Table';
import Tag from '@/components/Tag';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getKPI, getLineProduction, getWeeklyDefects, getLines, getEquipment, getOrders, getQualityRecords } from '@/api';
import { useRequest } from '@/hooks/useRequest';
import type { LineProductionRow, WeeklyDefectRow } from '@/mock/types';
import DashboardGrid from '@/components/dashboard/DashboardGrid';
import { useDashboard } from '@/hooks/useDashboard';

export default function Overview() {
  const {
    editing,
    toggleEditing,
    cards,
    layouts,
    onLayoutChange,
    addCard,
    updateChartType,
    removeCard,
    save,
    resetToDefault,
  } = useDashboard();
  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const { data: kpiData } = useRequest(getKPI);
  const { data: lineProductionData } = useRequest(getLineProduction);
  const { data: weeklyDefectData } = useRequest(getWeeklyDefects);
  const { data: lines } = useRequest(getLines);
  const { data: equipment } = useRequest(getEquipment);
  const { data: orders } = useRequest(getOrders);
  const { data: qualityRecords } = useRequest(getQualityRecords);

  // Build dataMap for dashboard charts
  const dataMap = {
    'line-production': lineProductionData ?? [],
    'weekly-defects': weeklyDefectData ?? [],
    'equipment': equipment ?? [],
    'quality': qualityRecords ?? [],
    'orders': orders ?? [],
  };

  const runningLines = lines?.filter(l => l.status === '运行中').length ?? 0;
  const totalLines = lines?.length ?? 0;
  const runningEquipment = equipment?.filter(e => e.status === '运行中').length ?? 0;
  const totalEquipment = equipment?.length ?? 0;
  const pendingOrders = orders?.filter(o => o.deliveryStatus === '进行中').length ?? 0;
  const riskOrders = orders?.filter(o => o.deliveryStatus === '风险').length ?? 0;
  const pendingQuality = qualityRecords?.filter(q => q.status === '待处理').length ?? 0;

  const productionColumns: Column<LineProductionRow>[] = [
    { key: 'lineName', title: '产线编号' },
    { key: 'shift', title: '班次' },
    { key: 'planned', title: '计划产量', align: 'right', render: (v: number) => v.toLocaleString() },
    { key: 'actual', title: '实际产量', align: 'right', render: (v: number) => v.toLocaleString() },
    {
      key: 'completionRate', title: '完成率', align: 'right',
      render: (v: number) => (
        <span className={v < 85 ? 'text-[#F53F3F] font-medium' : ''}>{v}%</span>
      ),
    },
    {
      key: 'status', title: '状态', align: 'center',
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
      key: 'defectRate', title: '不良率', align: 'right',
      render: (v: number) => (
        <span className={v > 2.5 ? 'text-[#F53F3F] font-medium' : ''}>{v}%</span>
      ),
    },
    { key: 'mainDefectType', title: '主要不良类型' },
  ];

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">生产概览</h1>
        <span className="text-sm text-muted-foreground">{today}</span>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {(kpiData ?? []).map((kpi, index) => (
          <KPICard key={index} label={kpi.label} value={kpi.value} unit={kpi.unit} />
        ))}
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="flex items-center justify-between pt-0 pb-0 h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#E8FFEA] flex items-center justify-center">
                <svg className="w-5 h-5 text-[#00B42A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">产线运行</div>
                <div className="text-sm font-semibold">{runningLines}/{totalLines} <span className="text-xs font-normal text-muted-foreground">条运行中</span></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="flex items-center justify-between pt-0 pb-0 h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#E8F0FF] flex items-center justify-center">
                <svg className="w-5 h-5 text-[#1664FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">设备在线</div>
                <div className="text-sm font-semibold">{runningEquipment}/{totalEquipment} <span className="text-xs font-normal text-muted-foreground">台运行中</span></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="flex items-center justify-between pt-0 pb-0 h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#FFF7E8] flex items-center justify-center">
                <svg className="w-5 h-5 text-[#FF7D00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">工单进度</div>
                <div className="text-sm font-semibold">{pendingOrders} <span className="text-xs font-normal text-muted-foreground">进行中</span> · {riskOrders} <span className="text-xs font-normal text-[#FF7D00]">风险</span></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="flex items-center justify-between pt-0 pb-0 h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#FFECE8] flex items-center justify-center">
                <svg className="w-5 h-5 text-[#F53F3F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">质量异常</div>
                <div className="text-sm font-semibold">{pendingQuality} <span className="text-xs font-normal text-[#F53F3F]">待处理</span></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-0 pt-4 px-5">
          <CardTitle className="text-[15px] font-medium">产线产量完成情况</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0 pt-3">
          <Table<LineProductionRow> columns={productionColumns} data={lineProductionData ?? []} rowKey="lineId" />
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-0 pt-4 px-5">
          <CardTitle className="text-[15px] font-medium">近 7 天不良数据汇总</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0 pt-3">
          <Table<WeeklyDefectRow> columns={defectColumns} data={weeklyDefectData ?? []} rowKey="date" />
        </CardContent>
      </Card>

      {/* 可拖拽看板网格 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">自定义看板</h2>
          <div className="flex items-center gap-2">
            <button
              className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${editing ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
              onClick={toggleEditing}
            >
              {editing ? '退出编辑' : '编辑模式'}
            </button>
            {editing && (
              <>
                <button
                  className="px-3 py-1.5 text-sm rounded-md border bg-background hover:bg-muted transition-colors"
                  onClick={() => addCard({
                    id: `new-${Date.now()}`,
                    title: '新图表',
                    dataSourceId: 'line-production',
                    chartType: 'bar',
                    groupByField: 'lineName',
                    valueFields: ['planned', 'actual'],
                    aggregation: 'none'
                  })}
                >
                  + 新增图表
                </button>
                <button
                  className="px-3 py-1.5 text-sm rounded-md border bg-background hover:bg-muted transition-colors"
                  onClick={resetToDefault}
                >
                  恢复默认
                </button>
                <button
                  className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  onClick={save}
                >
                  保存布局
                </button>
              </>
            )}
          </div>
        </div>
        <DashboardGrid
          cards={cards}
          layouts={layouts}
          editing={editing}
          onLayoutChange={onLayoutChange}
          onRemoveCard={removeCard}
          onChartTypeChange={updateChartType}
          dataMap={dataMap}
        />
      </div>
    </div>
  );
}
