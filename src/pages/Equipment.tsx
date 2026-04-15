import { useState, useCallback } from 'react';
import Table, { type Column } from '@/components/Table';
import Tag from '@/components/Tag';
import Select from '@/components/Select';
import { Card, CardContent } from '@/components/ui/card';
import { getEquipment, getLines } from '@/api';
import { useRequest } from '@/hooks/useRequest';
import type { Equipment as EquipmentType } from '@/mock/types';

const statusMap: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  '运行中': 'success',
  '待机': 'default',
  '停机': 'danger',
  '维修中': 'warning',
};

export default function Equipment() {
  const [lineFilter, setLineFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: lines } = useRequest(getLines);
  const fetcher = useCallback(
    () => getEquipment({ lineId: lineFilter, status: statusFilter }),
    [lineFilter, statusFilter]
  );
  const { data: filteredData } = useRequest(fetcher, [lineFilter, statusFilter]);

  const lineOptions = (lines ?? []).map((l) => ({ label: l.name, value: l.id }));
  const statusOptions = [
    { label: '运行中', value: '运行中' },
    { label: '待机', value: '待机' },
    { label: '停机', value: '停机' },
    { label: '维修中', value: '维修中' },
  ];

  const columns: Column<EquipmentType>[] = [
    { key: 'id', title: '设备编号' },
    { key: 'name', title: '设备名称' },
    { key: 'lineName', title: '所属产线' },
    { key: 'type', title: '设备类型' },
    { key: 'availability', title: '稼动率', align: 'right', render: (v: number) => <span className={v < 80 ? 'text-[#F53F3F]' : ''}>{v}%</span> },
    { key: 'performance', title: '性能率', align: 'right', render: (v: number) => <span className={v < 80 ? 'text-[#F53F3F]' : ''}>{v}%</span> },
    { key: 'quality', title: '良品率', align: 'right', render: (v: number) => `${v}%` },
    { key: 'oee', title: 'OEE', align: 'right', render: (v: number) => <span className={`font-medium ${v < 65 ? 'text-[#F53F3F]' : v < 75 ? 'text-[#FF7D00]' : 'text-[#00B42A]'}`}>{v}%</span> },
    { key: 'status', title: '状态', align: 'center', render: (value: string) => <Tag type={statusMap[value] || 'default'}>{value}</Tag> },
  ];

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-lg font-semibold">设备管理</h1>
      <div className="flex items-center gap-3">
        <Select label="所有产线" value={lineFilter} options={lineOptions} onChange={setLineFilter} />
        <Select label="所有状态" value={statusFilter} options={statusOptions} onChange={setStatusFilter} />
        <span className="text-xs text-muted-foreground ml-2">共 {filteredData?.length ?? 0} 台设备</span>
      </div>
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table<EquipmentType> columns={columns} data={filteredData ?? []} rowKey="id" />
        </CardContent>
      </Card>
    </div>
  );
}
