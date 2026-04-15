import { useState, useEffect, useMemo, useCallback } from 'react';
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

const AGG_OPTIONS: { value: Aggregation; label: string }[] = [
  { value: 'none', label: '无聚合' },
  { value: 'sum', label: '求和' },
  { value: 'avg', label: '平均' },
  { value: 'count', label: '计数' },
  { value: 'max', label: '最大值' },
];

const CHART_TYPES: { value: ChartType; label: string; icon: string }[] = [
  { value: 'bar', label: '柱状图', icon: '📊' },
  { value: 'line', label: '折线图', icon: '📈' },
  { value: 'pie', label: '饼图', icon: '🍩' },
];

export function ChartBuilder({ open, onClose, onConfirm, editingCard }: ChartBuilderProps) {
  const [dataSourceId, setDataSourceId] = useState(DATA_SOURCES[0]?.id ?? '');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [groupByField, setGroupByField] = useState('');
  const [aggregation, setAggregation] = useState<Aggregation>('none');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [title, setTitle] = useState('');

  // 编辑模式
  useEffect(() => {
    if (editingCard && open) {
      setDataSourceId(editingCard.dataSourceId);
      setSelectedFields([editingCard.groupByField, ...editingCard.valueFields]);
      setGroupByField(editingCard.groupByField);
      setAggregation(editingCard.aggregation);
      setChartType(editingCard.chartType);
      setTitle(editingCard.title);
    } else if (open && !editingCard) {
      // 新建时默认选第一个数据源，自动选前几个字段
      const ds = DATA_SOURCES[0];
      if (ds) {
        setDataSourceId(ds.id);
        const firstString = ds.fields.find(f => f.type === 'string');
        const firstNumbers = ds.fields.filter(f => f.type === 'number').slice(0, 2);
        const autoFields = [firstString?.key, ...firstNumbers.map(f => f.key)].filter(Boolean) as string[];
        setSelectedFields(autoFields);
        setGroupByField(firstString?.key ?? '');
      }
    }
  }, [editingCard, open]);

  const resetAndClose = () => {
    setSelectedFields([]);
    setGroupByField('');
    setAggregation('none');
    setChartType('bar');
    setTitle('');
    onClose();
  };

  const currentSource = useMemo(() => DATA_SOURCES.find(ds => ds.id === dataSourceId), [dataSourceId]);
  const stringFields = useMemo(() => currentSource?.fields.filter(f => f.type === 'string') ?? [], [currentSource]);
  const numberFields = useMemo(() => currentSource?.fields.filter(f => f.type === 'number') ?? [], [currentSource]);
  const selectedStrings = useMemo(() => stringFields.filter(f => selectedFields.includes(f.key)), [stringFields, selectedFields]);
  const valueFields = useMemo(() => numberFields.filter(f => selectedFields.includes(f.key)).map(f => f.key), [numberFields, selectedFields]);

  const fetcher = useCallback(() => dataSourceId ? getDataSourceData(dataSourceId) : Promise.resolve([]), [dataSourceId]);
  const { data: rawData } = useRequest(fetcher, [dataSourceId]);

  const previewData = useMemo(() => {
    if (!rawData || !groupByField || valueFields.length === 0) return [];
    return aggregate({ data: rawData, groupByField, valueFields, aggregation });
  }, [rawData, groupByField, valueFields, aggregation]);

  const autoTitle = useMemo(() => {
    if (!groupByField || valueFields.length === 0) return '';
    const gl = currentSource?.fields.find(f => f.key === groupByField)?.label ?? groupByField;
    const vls = valueFields.map(vf => currentSource?.fields.find(f => f.key === vf)?.label ?? vf);
    return `按${gl}的${vls.join('/')}`;
  }, [groupByField, valueFields, currentSource]);

  const canConfirm = !!dataSourceId && !!groupByField && valueFields.length > 0;

  const handleConfirm = () => {
    onConfirm({
      id: editingCard?.id || Date.now().toString(),
      title: title || autoTitle,
      dataSourceId, chartType, groupByField, valueFields, aggregation,
    });
    resetAndClose();
  };

  const toggleField = (key: string) => {
    setSelectedFields(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const switchDataSource = (id: string) => {
    if (id === dataSourceId) return;
    setDataSourceId(id);
    const ds = DATA_SOURCES.find(d => d.id === id);
    if (ds) {
      const firstString = ds.fields.find(f => f.type === 'string');
      const firstNumbers = ds.fields.filter(f => f.type === 'number').slice(0, 2);
      const autoFields = [firstString?.key, ...firstNumbers.map(f => f.key)].filter(Boolean) as string[];
      setSelectedFields(autoFields);
      setGroupByField(firstString?.key ?? '');
    }
  };

  // ====== 预览图表渲染 ======
  const tickStyle = { fontSize: 11, fill: '#86909C' };
  const tooltipStyle = { backgroundColor: '#fff', border: '1px solid #E5E6EB', borderRadius: 6, fontSize: 12 };

  const renderPreview = () => {
    if (previewData.length === 0) {
      return (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          <div className="text-center">
            <div className="text-3xl mb-2 opacity-30">📊</div>
            <div>勾选左侧字段后实时预览</div>
          </div>
        </div>
      );
    }

    const h = 320;
    if (chartType === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={h}>
          <BarChart data={previewData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F2F3F5" />
            <XAxis dataKey={groupByField} tick={tickStyle} axisLine={{ stroke: '#E5E6EB' }} />
            <YAxis tick={tickStyle} axisLine={{ stroke: '#E5E6EB' }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            {valueFields.map((vf, i) => (
              <Bar key={vf} dataKey={vf} name={currentSource?.fields.find(f => f.key === vf)?.label ?? vf}
                fill={COLORS[i % COLORS.length]} radius={[3, 3, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );
    }
    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={h}>
          <LineChart data={previewData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F2F3F5" />
            <XAxis dataKey={groupByField} tick={tickStyle} axisLine={{ stroke: '#E5E6EB' }} />
            <YAxis tick={tickStyle} axisLine={{ stroke: '#E5E6EB' }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            {valueFields.map((vf, i) => (
              <Line key={vf} type="monotone" dataKey={vf} name={currentSource?.fields.find(f => f.key === vf)?.label ?? vf}
                stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    }
    if (chartType === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={h}>
          <PieChart>
            <Pie data={previewData} dataKey={valueFields[0]} nameKey={groupByField}
              cx="50%" cy="50%" outerRadius={110} innerRadius={50}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: '#C9CDD4' }}>
              {previewData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }
    return null;
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/40" onClick={resetAndClose} />

      {/* 主面板 */}
      <div className="relative bg-card rounded-xl shadow-2xl border border-border flex flex-col"
        style={{ width: '900px', maxWidth: '90vw', height: '640px', maxHeight: '85vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="text-base font-semibold">{editingCard ? '编辑图表' : '新建图表'}</h2>
          <button onClick={resetAndClose} className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none">✕</button>
        </div>

        {/* 数据源 Tab */}
        <div className="flex gap-1 px-6 pt-3 pb-2 border-b border-border shrink-0 overflow-x-auto">
          {DATA_SOURCES.map(ds => (
            <button key={ds.id}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                dataSourceId === ds.id
                  ? 'bg-primary text-white'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => switchDataSource(ds.id)}>
              {ds.icon} {ds.name}
            </button>
          ))}
        </div>

        {/* 主体：左配置 + 右预览 */}
        <div className="flex flex-1 min-h-0">
          {/* 左侧配置区 */}
          <div className="w-[280px] shrink-0 border-r border-border overflow-y-auto p-4 space-y-4">
            {/* 维度（X轴） */}
            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">维度（X 轴）</div>
              <div className="space-y-1">
                {stringFields.map(f => (
                  <label key={f.key}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                      groupByField === f.key ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                    }`}
                    onClick={() => {
                      if (!selectedFields.includes(f.key)) toggleField(f.key);
                      setGroupByField(f.key);
                    }}>
                    <div className={`w-1.5 h-1.5 rounded-full ${groupByField === f.key ? 'bg-primary' : 'bg-border'}`} />
                    <span className="text-sm">{f.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 指标（Y轴） */}
            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">指标（Y 轴）</div>
              <div className="space-y-1">
                {numberFields.map(f => (
                  <label key={f.key}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                      selectedFields.includes(f.key) ? 'bg-primary/10' : 'hover:bg-muted'
                    }`}>
                    <Checkbox id={`cb-${f.key}`} checked={selectedFields.includes(f.key)} onCheckedChange={() => toggleField(f.key)} />
                    <span className="text-sm">{f.label}</span>
                    {f.description && <span className="text-[10px] text-muted-foreground">({f.description})</span>}
                  </label>
                ))}
              </div>
            </div>

            {/* 聚合 */}
            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">聚合方式</div>
              <select className="w-full rounded-md border border-input bg-card px-2.5 py-1.5 text-sm"
                value={aggregation} onChange={e => setAggregation(e.target.value as Aggregation)}>
                {AGG_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* 右侧预览区 */}
          <div className="flex-1 flex flex-col min-w-0 p-4">
            {/* 图表类型 + 标题 */}
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex gap-1">
                {CHART_TYPES.map(ct => (
                  <button key={ct.value}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      chartType === ct.value
                        ? 'bg-primary text-white'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => setChartType(ct.value)}>
                    {ct.icon} {ct.label}
                  </button>
                ))}
              </div>
              <Input className="w-[200px] h-7 text-xs" placeholder={autoTitle || '图表标题'}
                value={title} onChange={e => setTitle(e.target.value)} />
            </div>

            {/* 预览画布 */}
            <div className="flex-1 rounded-lg border border-border bg-white flex items-center justify-center min-h-0 overflow-hidden">
              {renderPreview()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-border shrink-0">
          <Button variant="ghost" size="sm" onClick={resetAndClose}>取消</Button>
          <Button size="sm" disabled={!canConfirm} onClick={handleConfirm}>
            {editingCard ? '更新图表' : '添加到看板'}
          </Button>
        </div>
      </div>
    </div>
  );
}
