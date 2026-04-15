import { useState } from 'react';
import Table, { type Column } from '@/components/Table';
import Tag from '@/components/Tag';
import Drawer from '@/components/Drawer';
import { productionLines } from '@/mock/lines';
import type { ProductionLine } from '@/mock/types';

const statusMap: Record<string, 'success' | 'danger' | 'warning'> = {
  '运行中': 'success',
  '停机': 'danger',
  '维保': 'warning',
};

export default function Lines() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedLine, setSelectedLine] = useState<ProductionLine | null>(null);

  const columns: Column<ProductionLine>[] = [
    { key: 'id', title: '产线ID', width: '100px' },
    { key: 'name', title: '产线名称' },
    { key: 'workshop', title: '所属车间' },
    { key: 'shiftMode', title: '班次模式', width: '100px' },
    { key: 'staffCount', title: '当班人数', width: '100px', align: 'right' },
    {
      key: 'status',
      title: '当前状态',
      width: '100px',
      align: 'center',
      render: (value: string) => (
        <Tag type={statusMap[value] || 'default'}>{value}</Tag>
      ),
    },
  ];

  const hourlyColumns: Column<{ hour: string; output: number }>[] = [
    { key: 'hour', title: '时间', width: '100px' },
    { key: 'output', title: '产量（件）', align: 'right' },
  ];

  const handleRowClick = (record: ProductionLine) => {
    setSelectedLine(record);
    setDrawerOpen(true);
  };

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-lg font-semibold text-text-primary">产线管理</h1>

      <div className="bg-white rounded-lg border border-border shadow-sm">
        <Table<ProductionLine>
          columns={columns}
          data={productionLines}
          rowKey="id"
          onRowClick={handleRowClick}
        />
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedLine?.name || '产线详情'}
      >
        {selectedLine && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-text-primary mb-3">基本信息</h3>
              <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-tertiary">产线名称</span>
                  <span className="text-text-primary">{selectedLine.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-tertiary">所属车间</span>
                  <span className="text-text-primary">{selectedLine.workshop}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-tertiary">班次模式</span>
                  <span className="text-text-primary">{selectedLine.shiftMode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-tertiary">当班人数</span>
                  <span className="text-text-primary">{selectedLine.staffCount} 人</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-tertiary">当前状态</span>
                  <Tag type={statusMap[selectedLine.status] || 'default'}>{selectedLine.status}</Tag>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-text-primary mb-3">当日小时产量流水</h3>
              <div className="border border-border rounded-lg overflow-hidden">
                <Table
                  columns={hourlyColumns}
                  data={selectedLine.hourlyOutput}
                  rowKey="hour"
                />
              </div>
            </div>

            <div className="bg-[#F7F8FA] rounded-lg px-4 py-3">
              <span className="text-sm text-text-tertiary">当前运行工单：</span>
              <span className="text-sm text-primary font-medium">{selectedLine.currentOrder}</span>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
