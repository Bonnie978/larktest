import { useState, useMemo } from 'react';
import Table, { type Column } from '@/components/Table';
import Tag from '@/components/Tag';
import Select from '@/components/Select';
import { equipmentList } from '@/mock/equipment';
import { productionLines } from '@/mock/lines';
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

  const lineOptions = productionLines.map((l) => ({ label: l.name, value: l.id }));

  const statusOptions = [
    { label: '运行中', value: '运行中' },
    { label: '待机', value: '待机' },
    { label: '停机', value: '停机' },
    { label: '维修中', value: '维修中' },
  ];

  const filteredData = useMemo(() => {
    return equipmentList.filter((item) => {
      if (lineFilter && item.lineId !== lineFilter) return false;
      if (statusFilter && item.status !== statusFilter) return false;
      return true;
    });
  }, [lineFilter, statusFilter]);

  const columns: Column<EquipmentType>[] = [
    { key: 'id', title: '设备编号', width: '100px' },
    { key: 'name', title: '设备名称' },
    { key: 'lineName', title: '所属产线', width: '100px' },
    { key: 'type', title: '设备类型', width: '100px' },
    {
      key: 'availability',
      title: '稼动率',
      width: '80px',
      align: 'right',
      render: (v: number) => <span className={v < 80 ? 'text-danger' : ''}>{v}%</span>,
    },
    {
      key: 'performance',
      title: '性能率',
      width: '80px',
      align: 'right',
      render: (v: number) => <span className={v < 80 ? 'text-danger' : ''}>{v}%</span>,
    },
    {
      key: 'quality',
      title: '良品率',
      width: '80px',
      align: 'right',
      render: (v: number) => `${v}%`,
    },
    {
      key: 'oee',
      title: 'OEE',
      width: '80px',
      align: 'right',
      render: (v: number) => (
        <span className={`font-medium ${v < 65 ? 'text-danger' : v < 75 ? 'text-warning' : 'text-success'}`}>
          {v}%
        </span>
      ),
    },
    {
      key: 'status',
      title: '状态',
      width: '90px',
      align: 'center',
      render: (value: string) => (
        <Tag type={statusMap[value] || 'default'}>{value}</Tag>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-lg font-semibold text-text-primary">设备管理</h1>

      <div className="flex items-center gap-3">
        <Select label="所有产线" value={lineFilter} options={lineOptions} onChange={setLineFilter} />
        <Select label="所有状态" value={statusFilter} options={statusOptions} onChange={setStatusFilter} />
        <span className="text-xs text-text-tertiary ml-2">共 {filteredData.length} 台设备</span>
      </div>

      <div className="bg-white rounded-lg border border-border shadow-sm">
        <Table<EquipmentType>
          columns={columns}
          data={filteredData}
          rowKey="id"
        />
      </div>
    </div>
  );
}
