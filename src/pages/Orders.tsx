import Table, { type Column } from '@/components/Table';
import Tag from '@/components/Tag';
import { Card, CardContent } from '@/components/ui/card';
import { getOrders } from '@/api';
import { useRequest } from '@/hooks/useRequest';
import type { WorkOrder } from '@/mock/types';

const deliveryStatusMap: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  '准时': 'success',
  '风险': 'warning',
  '延期': 'danger',
  '进行中': 'default',
};

export default function Orders() {
  const { data: workOrders } = useRequest(getOrders);

  const columns: Column<WorkOrder>[] = [
    { key: 'id', title: '工单号' },
    { key: 'productModel', title: '产品型号' },
    { key: 'customer', title: '客户名称' },
    { key: 'plannedQty', title: '计划数量', align: 'right', render: (v: number) => v.toLocaleString() },
    {
      key: 'completedQty', title: '已完成', align: 'right',
      render: (value: number, record: WorkOrder) => {
        const pct = record.plannedQty > 0 ? ((value / record.plannedQty) * 100).toFixed(1) : '0.0';
        return <span>{value.toLocaleString()}<span className="text-muted-foreground text-xs ml-1">({pct}%)</span></span>;
      },
    },
    { key: 'plannedStart', title: '计划开始' },
    { key: 'plannedEnd', title: '计划完成' },
    { key: 'actualEnd', title: '实际完成', render: (value: string | null) => value || <span className="text-muted-foreground">—</span> },
    { key: 'deliveryStatus', title: '交期状态', align: 'center', render: (value: string) => <Tag type={deliveryStatusMap[value] || 'default'}>{value}</Tag> },
  ];

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-lg font-semibold">工单管理</h1>
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table<WorkOrder> columns={columns} data={workOrders ?? []} rowKey="id" />
        </CardContent>
      </Card>
    </div>
  );
}
