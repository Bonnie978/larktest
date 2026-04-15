import { useState } from 'react';
import Table, { type Column } from '@/components/Table';
import Tag from '@/components/Tag';
import Drawer from '@/components/Drawer';
import { Card, CardContent } from '@/components/ui/card';
import { getLines } from '@/api';
import { useRequest } from '@/hooks/useRequest';
import type { ProductionLine } from '@/mock/types';

const statusMap: Record<string, 'success' | 'danger' | 'warning'> = {
  '运行中': 'success',
  '停机': 'danger',
  '维保': 'warning',
};

export default function Lines() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedLine, setSelectedLine] = useState<ProductionLine | null>(null);
  const { data: productionLines } = useRequest(getLines);

  const columns: Column<ProductionLine>[] = [
    { key: 'id', title: '产线ID' },
    { key: 'name', title: '产线名称' },
    { key: 'workshop', title: '所属车间' },
    { key: 'shiftMode', title: '班次模式' },
    { key: 'staffCount', title: '当班人数', align: 'right' },
    {
      key: 'status', title: '当前状态', align: 'center',
      render: (value: string) => <Tag type={statusMap[value] || 'default'}>{value}</Tag>,
    },
  ];

  const hourlyColumns: Column<{ hour: string; output: number }>[] = [
    { key: 'hour', title: '时间' },
    { key: 'output', title: '产量（件）', align: 'right' },
  ];

  const handleRowClick = (record: ProductionLine) => {
    setSelectedLine(record);
    setDrawerOpen(true);
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">产线管理</h1>
        <span className="text-sm text-muted-foreground">共 {productionLines?.length ?? 0} 条产线</span>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table<ProductionLine> columns={columns} data={productionLines ?? []} rowKey="id" onRowClick={handleRowClick} />
        </CardContent>
      </Card>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={selectedLine?.name || '产线详情'}>
        {selectedLine && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-3">基本信息</h3>
              <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">产线名称</span><span>{selectedLine.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">所属车间</span><span>{selectedLine.workshop}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">班次模式</span><span>{selectedLine.shiftMode}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">当班人数</span><span>{selectedLine.staffCount} 人</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">当前状态</span><Tag type={statusMap[selectedLine.status] || 'default'}>{selectedLine.status}</Tag></div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-3">当日小时产量流水</h3>
              <Card><CardContent className="p-0"><Table columns={hourlyColumns} data={selectedLine.hourlyOutput} rowKey="hour" /></CardContent></Card>
            </div>
            <Card className="bg-muted">
              <CardContent className="py-3">
                <span className="text-sm text-muted-foreground">当前运行工单：</span>
                <span className="text-sm text-primary font-medium">{selectedLine.currentOrder}</span>
              </CardContent>
            </Card>
          </div>
        )}
      </Drawer>
    </div>
  );
}
