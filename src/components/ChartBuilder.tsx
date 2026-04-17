import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { DataAggregator } from './DataAggregator';

export interface CardConfig {
  id: string;
  title: string;
  dataSourceId: string;
  dimension: string;
  metrics: string[];
  aggregation: 'none' | 'sum' | 'avg' | 'count' | 'max' | 'min';
  chartType: 'bar' | 'line' | 'pie';
}

interface ChartBuilderProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialConfig?: CardConfig;
  onConfirm: (config: CardConfig) => void;
  onCancel: () => void;
}

interface FieldMeta {
  key: string;
  label: string;
  type: 'string' | 'number';
}

interface DataSourceMeta {
  id: string;
  name: string;
  icon: string;
  fields: FieldMeta[];
}

const COLORS = ['#1664FF', '#00B42A', '#FF7D00', '#F53F3F', '#722ED1', '#14C9C9'];

const ChartBuilder: React.FC<ChartBuilderProps> = ({
  open,
  mode,
  initialConfig,
  onConfirm,
  onCancel,
}) => {
  const [dataSourceId, setDataSourceId] = useState<string>('');
  const [dimension, setDimension] = useState<string>('');
  const [metrics, setMetrics] = useState<string[]>([]);
  const [aggregation, setAggregation] = useState<CardConfig['aggregation']>('none');
  const [chartType, setChartType] = useState<CardConfig['chartType']>('bar');
  const [title, setTitle] = useState<string>('');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [dataSources, setDataSources] = useState<DataSourceMeta[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);

  // Initialize from initialConfig in edit mode
  useEffect(() => {
    if (mode === 'edit' && initialConfig) {
      setDataSourceId(initialConfig.dataSourceId);
      setDimension(initialConfig.dimension);
      setMetrics(initialConfig.metrics);
      setAggregation(initialConfig.aggregation);
      setChartType(initialConfig.chartType);
      setTitle(initialConfig.title);
    } else {
      // Reset for create mode
      setDataSourceId('');
      setDimension('');
      setMetrics([]);
      setAggregation('none');
      setChartType('bar');
      setTitle('');
      setPreviewData([]);
      setRawData([]);
    }
  }, [mode, initialConfig, open]);

  // Fetch data sources metadata
  useEffect(() => {
    if (open) {
      fetch('http://localhost:3001/api/datasource')
        .then((res) => res.json())
        .then((json) => {
          if (json.code === 0) {
            setDataSources(json.data);
          }
        })
        .catch((err) => console.error('Failed to fetch data sources:', err));
    }
  }, [open]);

  // Fetch raw data when data source changes
  useEffect(() => {
    if (dataSourceId) {
      fetch(`http://localhost:3001/api/datasource/${dataSourceId}/data`)
        .then((res) => res.json())
        .then((json) => {
          if (json.code === 0) {
            setRawData(json.data);
            // Auto-select first string field as dimension and first number field as metric
            const currentSource = dataSources.find((ds) => ds.id === dataSourceId);
            if (currentSource && mode === 'create') {
              const stringField = currentSource.fields.find((f) => f.type === 'string');
              const numberField = currentSource.fields.find((f) => f.type === 'number');
              if (stringField) setDimension(stringField.key);
              if (numberField) setMetrics([numberField.key]);
            }
          }
        })
        .catch((err) => console.error('Failed to fetch data:', err));
    }
  }, [dataSourceId, dataSources, mode]);

  // Generate preview data when config changes
  useEffect(() => {
    if (rawData.length > 0 && dimension && metrics.length > 0) {
      const aggregated = DataAggregator.aggregate({
        data: rawData,
        dimension,
        metrics,
        aggregation,
      });
      setPreviewData(aggregated);
    } else {
      setPreviewData([]);
    }
  }, [rawData, dimension, metrics, aggregation]);

  const handleDataSourceChange = (value: string) => {
    setDataSourceId(value);
    setDimension('');
    setMetrics([]);
    setRawData([]);
    setPreviewData([]);
  };

  const handleMetricToggle = (field: string) => {
    if (metrics.includes(field)) {
      setMetrics(metrics.filter((m) => m !== field));
    } else {
      setMetrics([...metrics, field]);
    }
  };

  const handleConfirm = () => {
    const config: CardConfig = {
      id: initialConfig?.id || Date.now().toString(),
      title: title || `${chartType === 'bar' ? '柱状图' : chartType === 'line' ? '折线图' : '饼图'}`,
      dataSourceId,
      dimension,
      metrics,
      aggregation,
      chartType,
    };
    onConfirm(config);
  };

  const currentSource = dataSources.find((ds) => ds.id === dataSourceId);
  const dimensionFields = currentSource?.fields.filter((f) => f.type === 'string') || [];
  const metricFields = currentSource?.fields.filter((f) => f.type === 'number') || [];

  const renderChart = () => {
    if (previewData.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
          请选择数据源和字段以预览图表
        </div>
      );
    }

    const currentDimField = currentSource?.fields.find((f) => f.key === dimension);
    const dimLabel = currentDimField?.label || dimension;

    if (chartType === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={previewData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={dimension} />
            <YAxis />
            <Tooltip />
            <Legend />
            {metrics.map((m, idx) => {
              const field = currentSource?.fields.find((f) => f.key === m);
              return (
                <Bar key={m} dataKey={m} name={field?.label || m} fill={COLORS[idx % COLORS.length]} />
              );
            })}
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={previewData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={dimension} />
            <YAxis />
            <Tooltip />
            <Legend />
            {metrics.map((m, idx) => {
              const field = currentSource?.fields.find((f) => f.key === m);
              return (
                <Line
                  key={m}
                  type="monotone"
                  dataKey={m}
                  name={field?.label || m}
                  stroke={COLORS[idx % COLORS.length]}
                  strokeWidth={2}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'pie') {
      // For pie chart, use first metric only
      const metric = metrics[0];
      const field = currentSource?.fields.find((f) => f.key === metric);
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={previewData}
              dataKey={metric}
              nameKey={dimension}
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {previewData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    return null;
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <SheetContent side="right" className="sm:max-w-none w-[720px] flex flex-col">
        <SheetHeader>
          <SheetTitle>{mode === 'create' ? '创建图表' : '编辑图表'}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* Data Source Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">数据源</label>
            <ShadcnSelect value={dataSourceId} onValueChange={(val) => handleDataSourceChange(val || '')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择数据源" />
              </SelectTrigger>
              <SelectContent>
                {dataSources.map((ds) => (
                  <SelectItem key={ds.id} value={ds.id}>
                    <span className="mr-2">{ds.icon}</span>
                    {ds.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </ShadcnSelect>
          </div>

          {/* Dimension Selection */}
          {dataSourceId && (
            <div>
              <label className="text-sm font-medium mb-2 block">维度字段（X轴）</label>
              <ShadcnSelect value={dimension} onValueChange={(val) => setDimension(val || '')}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="选择维度字段" />
                </SelectTrigger>
                <SelectContent>
                  {dimensionFields.map((field) => (
                    <SelectItem key={field.key} value={field.key}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </ShadcnSelect>
            </div>
          )}

          {/* Metrics Selection */}
          {dataSourceId && (
            <div>
              <label className="text-sm font-medium mb-2 block">指标字段（Y轴，可多选）</label>
              <div className="space-y-2">
                {metricFields.map((field) => (
                  <label
                    key={field.key}
                    className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-muted"
                  >
                    <input
                      type="checkbox"
                      checked={metrics.includes(field.key)}
                      onChange={() => handleMetricToggle(field.key)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{field.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Aggregation Selection */}
          {dataSourceId && (
            <div>
              <label className="text-sm font-medium mb-2 block">聚合方式</label>
              <ShadcnSelect value={aggregation} onValueChange={(v) => setAggregation((v || 'none') as any)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">无聚合</SelectItem>
                  <SelectItem value="sum">求和</SelectItem>
                  <SelectItem value="avg">平均值</SelectItem>
                  <SelectItem value="count">计数</SelectItem>
                  <SelectItem value="max">最大值</SelectItem>
                  <SelectItem value="min">最小值</SelectItem>
                </SelectContent>
              </ShadcnSelect>
            </div>
          )}

          {/* Chart Type Selection */}
          {dataSourceId && (
            <div>
              <label className="text-sm font-medium mb-2 block">图表类型</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'bar', label: '柱状图', icon: '📊' },
                  { value: 'line', label: '折线图', icon: '📈' },
                  { value: 'pie', label: '饼图', icon: '🥧' },
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setChartType(type.value as any)}
                    className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                      chartType === type.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    <div className="text-2xl mb-1">{type.icon}</div>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Title Input */}
          {dataSourceId && (
            <div>
              <label className="text-sm font-medium mb-2 block">图表标题</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="输入自定义标题（可选）"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          {/* Preview */}
          {dataSourceId && (
            <div>
              <label className="text-sm font-medium mb-2 block">实时预览</label>
              <Card>
                <CardContent className="pt-4">{renderChart()}</CardContent>
              </Card>
            </div>
          )}
        </div>

        <SheetFooter className="border-t pt-4">
          <Button variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!dataSourceId || !dimension || metrics.length === 0}
          >
            确认
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ChartBuilder;
