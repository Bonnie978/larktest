import { useState, useEffect, useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { aggregate } from '@/lib/aggregationEngine';
import { DATA_SOURCES } from '@/config/dataSources';
import { getDataSourceData } from '@/api';
import { useRequest } from '@/hooks/useRequest';
import type { CardConfig, ChartType, Aggregation } from '@/types/dashboard';

const COLORS = ['#1664FF', '#14C9C9', '#78D3F8', '#9FDB1D', '#F7BA1E', '#722ED1', '#F53F3F', '#FF7D00'];

interface ChartBuilderProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (config: CardConfig) => void;
  editingCard?: CardConfig;
}

const AGGREGATION_OPTIONS: { value: Aggregation; label: string }[] = [
  { value: 'none', label: '无聚合' },
  { value: 'sum', label: '求和' },
  { value: 'avg', label: '平均' },
  { value: 'count', label: '计数' },
  { value: 'max', label: '最大值' },
];

const CHART_TYPE_OPTIONS: { value: ChartType; label: string }[] = [
  { value: 'bar', label: '柱状图' },
  { value: 'line', label: '折线图' },
  { value: 'pie', label: '饼图' },
];

export function ChartBuilder({ open, onClose, onConfirm, editingCard }: ChartBuilderProps) {
  const [dataSourceId, setDataSourceId] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [groupByField, setGroupByField] = useState('');
  const [aggregation, setAggregation] = useState<Aggregation>('none');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (editingCard && open) {
      setDataSourceId(editingCard.dataSourceId);
      setSelectedFields([editingCard.groupByField, ...editingCard.valueFields]);
      setGroupByField(editingCard.groupByField);
      setAggregation(editingCard.aggregation);
      setChartType(editingCard.chartType);
      setTitle(editingCard.title);
    }
  }, [editingCard, open]);

  const resetState = () => {
    setDataSourceId('');
    setSelectedFields([]);
    setGroupByField('');
    setAggregation('none');
    setChartType('bar');
    setTitle('');
  };

  const handleClose = () => {
    onClose();
    resetState();
  };

  const currentSource = useMemo(() => DATA_SOURCES.find((ds) => ds.id === dataSourceId), [dataSourceId]);
  const stringFields = useMemo(() => currentSource?.fields.filter((f) => f.type === 'string') ?? [], [currentSource]);
  const numberFields = useMemo(() => currentSource?.fields.filter((f) => f.type === 'number') ?? [], [currentSource]);
  const selectedStringFields = useMemo(() => stringFields.filter((f) => selectedFields.includes(f.key)), [stringFields, selectedFields]);
  const valueFields = useMemo(() => numberFields.filter((f) => selectedFields.includes(f.key)).map((f) => f.key), [numberFields, selectedFields]);

  const { data: rawData } = useRequest(() => dataSourceId ? getDataSourceData(dataSourceId) : Promise.resolve([]), [dataSourceId]);

  const previewData = useMemo(() => {
    if (!rawData || !groupByField || valueFields.length === 0) return [];
    return aggregate({ data: rawData, groupByField, valueFields, aggregation });
  }, [rawData, groupByField, valueFields, aggregation]);

  const autoTitle = useMemo(() => {
    if (!groupByField || valueFields.length === 0) return '';
    const gl = currentSource?.fields.find((f) => f.key === groupByField)?.label ?? groupByField;
    const vls = valueFields.map((vf) => currentSource?.fields.find((f) => f.key === vf)?.label ?? vf);
    return `按${gl}的${vls.join('/')}`;
  }, [groupByField, valueFields, currentSource]);

  const canConfirm = !!dataSourceId && !!groupByField && valueFields.length > 0;

  const handleConfirm = () => {
    const config: CardConfig = {
      id: editingCard?.id || Date.now().toString(),
      title: title || autoTitle,
      dataSourceId, chartType, groupByField, valueFields, aggregation,
    };
    onConfirm(config);
    handleClose();
  };

  const toggleField = (key: string) => {
    setSelectedFields((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);
  };

  const renderPreview = () => {
    if (previewData.length === 0) {
      return <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">选择数据源和字段后预览</div>;
    }
    const tickStyle = { fontSize: 11, fill: '#86909C' };
    if (chartType === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={previewData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={groupByField} tick={tickStyle} />
            <YAxis tick={tickStyle} />
            <Tooltip />
            <Legend />
            {valueFields.map((vf, i) => <Bar key={vf} dataKey={vf} fill={COLORS[i % COLORS.length]} radius={[2, 2, 0, 0]} />)}
          </BarChart>
        </ResponsiveContainer>
      );
    }
    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={previewData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={groupByField} tick={tickStyle} />
            <YAxis tick={tickStyle} />
            <Tooltip />
            <Legend />
            {valueFields.map((vf, i) => <Line key={vf} type="monotone" dataKey={vf} stroke={COLORS[i % COLORS.length]} strokeWidth={2} />)}
          </LineChart>
        </ResponsiveContainer>
      );
    }
    if (chartType === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={previewData} dataKey={valueFields[0]} nameKey={groupByField} cx="50%" cy="50%" outerRadius={70}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
              {previewData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip /><Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }
    return null;
  };

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <SheetContent side="right" className="sm:max-w-none w-[520px] flex flex-col overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{editingCard ? '编辑图表' : '新建图表'}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 space-y-5 px-1 pb-4">
          {/* 数据源 */}
          <div>
            <Label className="mb-2 block text-sm font-medium">数据源</Label>
            <div className="grid grid-cols-3 gap-2">
              {DATA_SOURCES.map((ds) => (
                <button key={ds.id} type="button"
                  className={`flex flex-col items-center gap-0.5 rounded-lg border p-2 text-center transition-colors hover:bg-muted/50 ${dataSourceId === ds.id ? 'border-primary bg-primary/5' : 'border-border'}`}
                  onClick={() => { if (ds.id !== dataSourceId) { setDataSourceId(ds.id); setSelectedFields([]); setGroupByField(''); } }}>
                  <span className="text-lg">{ds.icon}</span>
                  <span className="text-xs font-medium">{ds.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 字段选择 + 配置 */}
          {currentSource && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">文本字段</Label>
                  <div className="space-y-1.5">
                    {stringFields.map((f) => (
                      <div key={f.key} className="flex items-center gap-2">
                        <Checkbox id={`f-${f.key}`} checked={selectedFields.includes(f.key)} onCheckedChange={() => toggleField(f.key)} />
                        <Label htmlFor={`f-${f.key}`} className="text-xs cursor-pointer">{f.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">数值字段</Label>
                  <div className="space-y-1.5">
                    {numberFields.map((f) => (
                      <div key={f.key} className="flex items-center gap-2">
                        <Checkbox id={`f-${f.key}`} checked={selectedFields.includes(f.key)} onCheckedChange={() => toggleField(f.key)} />
                        <Label htmlFor={`f-${f.key}`} className="text-xs cursor-pointer">{f.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="mb-1 block text-xs font-medium">分组维度</Label>
                  <select className="w-full rounded-md border border-input bg-transparent px-2 py-1.5 text-xs" value={groupByField} onChange={(e) => setGroupByField(e.target.value)}>
                    <option value="">请选择</option>
                    {selectedStringFields.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="mb-1 block text-xs font-medium">聚合方式</Label>
                  <select className="w-full rounded-md border border-input bg-transparent px-2 py-1.5 text-xs" value={aggregation} onChange={(e) => setAggregation(e.target.value as Aggregation)}>
                    {AGGREGATION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="mb-1 block text-xs font-medium">图表类型</Label>
                  <div className="flex gap-1">
                    {CHART_TYPE_OPTIONS.map((o) => (
                      <Button key={o.value} size="xs" variant={chartType === o.value ? 'default' : 'outline'} onClick={() => setChartType(o.value)}>{o.label}</Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="mb-1 block text-xs font-medium">标题</Label>
                  <Input className="h-7 text-xs" placeholder={autoTitle || '自动生成'} value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* 预览 */}
          {currentSource && (
            <div className="rounded-lg border p-3">
              <div className="mb-1 text-xs font-medium text-muted-foreground">预览</div>
              {renderPreview()}
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-end gap-2 border-t pt-3 px-1">
          <Button variant="ghost" size="sm" onClick={handleClose}>取消</Button>
          <Button size="sm" disabled={!canConfirm} onClick={handleConfirm}>{editingCard ? '更新' : '添加到看板'}</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
