import { useState, useCallback } from 'react';
import Table, { type Column } from '@/components/Table';
import Tag from '@/components/Tag';
import Select from '@/components/Select';
import { Card, CardContent } from '@/components/ui/card';
import { getQualityRecords, getLines } from '@/api';
import { useRequest } from '@/hooks/useRequest';
import type { QualityRecord } from '@/mock/types';

const statusMap: Record<string, 'danger' | 'warning' | 'success'> = {
  '待处理': 'danger',
  '处理中': 'warning',
  '已关闭': 'success',
};

export default function Quality() {
  const [lineFilter, setLineFilter] = useState('');
  const [defectTypeFilter, setDefectTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: lines } = useRequest(getLines);
  const fetcher = useCallback(
    () => getQualityRecords({ lineName: lineFilter, defectType: defectTypeFilter, status: statusFilter }),
    [lineFilter, defectTypeFilter, statusFilter]
  );
  const { data: filteredData } = useRequest(fetcher, [lineFilter, defectTypeFilter, statusFilter]);

  const lineOptions = (lines ?? []).map((l) => ({ label: l.name, value: l.name }));
  const defectTypeOptions = [
    { label: '尺寸超差', value: '尺寸超差' },
    { label: '外观划伤', value: '外观划伤' },
    { label: '焊接虚焊', value: '焊接虚焊' },
    { label: '装配错误', value: '装配错误' },
    { label: '功能失效', value: '功能失效' },
  ];
  const statusOptions = [
    { label: '待处理', value: '待处理' },
    { label: '处理中', value: '处理中' },
    { label: '已关闭', value: '已关闭' },
  ];

  const columns: Column<QualityRecord>[] = [
    { key: 'id', title: '记录ID' },
    { key: 'batchNo', title: '批次号' },
    { key: 'lineName', title: '产线' },
    { key: 'defectType', title: '不良类型' },
    { key: 'defectCount', title: '不良数量', align: 'right' },
    { key: 'inspector', title: '检验员' },
    { key: 'occurTime', title: '发生时间' },
    { key: 'status', title: '处理状态', align: 'center', render: (value: string) => <Tag type={statusMap[value] || 'default'}>{value}</Tag> },
  ];

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-lg font-semibold">质量管理</h1>
      <div className="flex items-center gap-3">
        <Select label="所有产线" value={lineFilter} options={lineOptions} onChange={setLineFilter} />
        <Select label="所有类型" value={defectTypeFilter} options={defectTypeOptions} onChange={setDefectTypeFilter} />
        <Select label="所有状态" value={statusFilter} options={statusOptions} onChange={setStatusFilter} />
        <span className="text-xs text-muted-foreground ml-2">共 {filteredData?.length ?? 0} 条记录</span>
      </div>
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table<QualityRecord>
            columns={columns}
            data={filteredData ?? []}
            rowKey="id"
            expandable={{
              expandedRowRender: (record: QualityRecord) => (
                <div className="grid grid-cols-1 gap-2 text-sm py-1">
                  <div><span className="text-muted-foreground">不良描述：</span><span className="ml-1">{record.description}</span></div>
                  <div><span className="text-muted-foreground">处置记录：</span><span className="ml-1">{record.resolution || '暂无处置记录'}</span></div>
                </div>
              ),
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
