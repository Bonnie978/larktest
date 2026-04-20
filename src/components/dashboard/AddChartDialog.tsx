import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dataSourceMeta } from '@/config/dataSources';
import type { ChartConfig, DataSourceType, AggregationType, ChartType } from '@/types/dashboard';

interface AddChartDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (config: ChartConfig) => void;
  editingConfig?: ChartConfig;
}

const chartTypes: { value: ChartType; label: string }[] = [
  { value: 'bar', label: '柱状图' },
  { value: 'line', label: '折线图' },
  { value: 'pie', label: '饼图' },
  { value: 'area', label: '面积图' },
];

const aggregationTypes: { value: AggregationType; label: string }[] = [
  { value: 'sum', label: '求和' },
  { value: 'avg', label: '平均值' },
  { value: 'count', label: '计数' },
  { value: 'max', label: '最大值' },
  { value: 'min', label: '最小值' },
];

export default function AddChartDialog({ open, onClose, onAdd, editingConfig }: AddChartDialogProps) {
  const dataSourceKeys = Object.keys(dataSourceMeta) as DataSourceType[];
  const [dataSource, setDataSource] = useState<DataSourceType>(dataSourceKeys[0]);
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [aggregation, setAggregation] = useState<AggregationType>('sum');
  const [title, setTitle] = useState('');

  const meta = dataSourceMeta[dataSource];
  const [dimension, setDimension] = useState(meta.dimensions[0]?.field ?? '');
  const [selectedMetric, setSelectedMetric] = useState(meta.metrics[0]?.field ?? '');

  // Pre-fill form when editingConfig changes or dialog opens
  useEffect(() => {
    if (!open) return;
    if (editingConfig) {
      setDataSource(editingConfig.dataSource);
      setChartType(editingConfig.chartType);
      setAggregation(editingConfig.aggregation);
      setTitle(editingConfig.title);
      setDimension(editingConfig.dimension);
      setSelectedMetric(editingConfig.metrics[0] ?? '');
    } else {
      setDataSource(dataSourceKeys[0]);
      const m = dataSourceMeta[dataSourceKeys[0]];
      setDimension(m.dimensions[0]?.field ?? '');
      setSelectedMetric(m.metrics[0]?.field ?? '');
      setChartType('bar');
      setAggregation('sum');
      setTitle('');
    }
  }, [open, editingConfig]);

  const handleDataSourceChange = (ds: DataSourceType) => {
    setDataSource(ds);
    const m = dataSourceMeta[ds];
    setDimension(m.dimensions[0]?.field ?? '');
    setSelectedMetric(m.metrics[0]?.field ?? '');
  };

  const handleSubmit = () => {
    const config: ChartConfig = {
      id: editingConfig?.id ?? `chart-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: title || `${meta.label} - ${chartTypes.find(c => c.value === chartType)?.label ?? chartType}`,
      dataSource,
      dimension,
      metrics: [selectedMetric],
      aggregation,
      chartType,
      layout: editingConfig?.layout ?? { x: 0, y: Infinity, w: 4, h: 3 },
    };
    onAdd(config);
    // Reset
    setTitle('');
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <Card className="w-[480px] max-h-[90vh] overflow-auto shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{editingConfig ? '编辑图表' : '添加图表'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">图表标题</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="可选，留空自动生成"
              className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Data Source */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">数据源</label>
            <div className="flex flex-wrap gap-2">
              {dataSourceKeys.map(ds => (
                <button
                  key={ds}
                  onClick={() => handleDataSourceChange(ds)}
                  className={`px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                    dataSource === ds
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {dataSourceMeta[ds].label}
                </button>
              ))}
            </div>
          </div>

          {/* Dimension */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">维度（X轴）</label>
            <div className="flex gap-2">
              {meta.dimensions.map(d => (
                <button
                  key={d.field}
                  onClick={() => setDimension(d.field)}
                  className={`px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                    dimension === d.field
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Metric */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">指标（Y轴）</label>
            <div className="flex flex-wrap gap-2">
              {meta.metrics.map(m => (
                <button
                  key={m.field}
                  onClick={() => setSelectedMetric(m.field)}
                  className={`px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                    selectedMetric === m.field
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Aggregation */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">聚合方式</label>
            <div className="flex gap-2">
              {aggregationTypes.map(a => (
                <button
                  key={a.value}
                  onClick={() => setAggregation(a.value)}
                  className={`px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                    aggregation === a.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Type */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">图表类型</label>
            <div className="flex gap-2">
              {chartTypes.map(c => (
                <button
                  key={c.value}
                  onClick={() => setChartType(c.value)}
                  className={`px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                    chartType === c.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              取消
            </Button>
            <Button size="sm" onClick={handleSubmit}>
              {editingConfig ? '确认' : '添加'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
