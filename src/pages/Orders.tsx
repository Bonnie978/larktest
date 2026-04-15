import Table, { type Column } from '@/components/Table';
import Tag from '@/components/Tag';
import { workOrders } from '@/mock/orders';
import type { WorkOrder } from '@/mock/types';

const deliveryStatusMap: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  '准时': 'success',
  '风险': 'warning',
  '延期': 'danger',
  '进行中': 'default',
};

export default function Orders() {
  const columns: Column<WorkOrder>[] = [
    { key: 'id', title: '工单号', width: '130px' },
    { key: 'productModel', title: '产品型号', width: '110px' },
    { key: 'customer', title: '客户名称', width: '110px' },
    { key: 'plannedQty', title: '计划数量', width: '90px', align: 'right', render: (v: number) => v.toLocaleString() },
    {
      key: 'completedQty',
      title: '已完成',
      width: '120px',
      align: 'right',
      render: (value: number, record: WorkOrder) => {
        const pct = record.plannedQty > 0
          ? ((value / record.plannedQty) * 100).toFixed(1)
          : '0.0';
        return (
          <span>
            {value.toLocaleString()}
            <span className="text-text-tertiary text-xs ml-1">({pct}%)</span>
          </span>
        );
      },
    },
    { key: 'plannedStart', title: '计划开始', width: '110px' },
    { key: 'plannedEnd', title: '计划完成', width: '110px' },
    {
      key: 'actualEnd',
      title: '实际完成',
      width: '110px',
      render: (value: string | null) => value || <span className="text-text-tertiary">—</span>,
    },
    {
      key: 'deliveryStatus',
      title: '交期状态',
      width: '90px',
      align: 'center',
      render: (value: string) => (
        <Tag type={deliveryStatusMap[value] || 'default'}>{value}</Tag>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-lg font-semibold text-text-primary">工单管理</h1>

      <div className="bg-white rounded-lg border border-border shadow-sm">
        <Table<WorkOrder>
          columns={columns}
          data={workOrders}
          rowKey="id"
        />
      </div>
    </div>
  );
}
