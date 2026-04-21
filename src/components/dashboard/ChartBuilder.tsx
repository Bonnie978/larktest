import { useState, useEffect, useMemo } from 'react';
import type { CardConfig, AggregationType, DataSourceMeta } from '@/types/dashboard';
import { getDataSourceData } from '@/api';
import { useRequest } from '@/hooks/useRequest';
import ChartPreview from './ChartPreview';

type ChartType = 'bar' | 'line' | 'pie';

const CHART_TYPES: { value: ChartType; label: string }[] = [
  { value: 'bar', label: '柱状图' },
  { value: 'line', label: '折线图' },
  { value: 'pie', label: '饼图' },
];

const AGGREGATION_TYPES: { value: AggregationType; label: string }[] = [
  { value: 'none', label: '不聚合' },
  { value: 'sum', label: '求和' },
  { value: 'avg', label: '平均值' },
  { value: 'count', label: '计数' },
  { value: 'max', label: '最大值' },
  { value: 'min', label: '最小值' },
];

interface ChartBuilderProps {
  open: boolean;
  editingConfig?: CardConfig;
  dataSources: DataSourceMeta[];
  onConfirm: (config: CardConfig) => void;
  onCancel: () => void;
}

export default function ChartBuilder({
  open,
  editingConfig,
  dataSources,
  onConfirm,
  onCancel,
}: ChartBuilderProps) {
  const [selectedSource, setSelectedSource] = useState('');
  const [dimension, setDimension] = useState('');
  const [metrics, setMetrics] = useState<string[]>([]);
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [aggregation, setAggregation] = useState<AggregationType>('sum');
  const [title, setTitle] = useState('');

  const currentSource = dataSources.find(ds => ds.id === selectedSource);
  const stringFields = currentSource?.fields.filter(f => f.type === 'string') ?? [];
  const numberFields = currentSource?.fields.filter(f => f.type === 'number') ?? [];

  const fieldLabels = useMemo(() => {
    const map: Record<string, string> = {};
    currentSource?.fields.forEach(f => { map[f.name] = f.label; });
    return map;
  }, [currentSource]);

  const { data: rawData } = useRequest(
    () => selectedSource ? getDataSourceData(selectedSource) : Promise.resolve([]),
    [selectedSource]
  );

  useEffect(() => {
    if (!open) return;
    if (editingConfig) {
      setSelectedSource(editingConfig.dataSourceId);
      setDimension(editingConfig.groupByField);
      setMetrics(editingConfig.valueFields);
      setChartType(editingConfig.chartType);
      setAggregation(editingConfig.aggregation);
      setTitle(editingConfig.title);
    } else if (dataSources.length > 0) {
      initDefaults(dataSources[0].id);
    }
  }, [open, editingConfig, dataSources]);

  function initDefaults(sourceId: string) {
    setSelectedSource(sourceId);
    const ds = dataSources.find(d => d.id === sourceId);
    if (!ds) return;
    const strFields = ds.fields.filter(f => f.type === 'string');
    const numFields = ds.fields.filter(f => f.type === 'number');
    setDimension(strFields[0]?.name ?? '');
    setMetrics(numFields.slice(0, 2).map(f => f.name));
    setChartType('bar');
    setAggregation('sum');
    setTitle('');
  }

  function handleSourceChange(sourceId: string) {
    initDefaults(sourceId);
  }

  function toggleMetric(fieldName: string) {
    setMetrics(prev =>
      prev.includes(fieldName)
        ? prev.filter(f => f !== fieldName)
        : [...prev, fieldName]
    );
  }

  function getAutoTitle() {
    if (title) return title;
    const dimLabel = fieldLabels[dimension] || dimension;
    const metricLabels = metrics.map(m => fieldLabels[m] || m).join('/');
    return `按${dimLabel}的${metricLabels}`;
  }

  function handleConfirm() {
    if (!dimension || metrics.length === 0) return;
    onConfirm({
      id: editingConfig?.id ?? Date.now().toString(),
      title: getAutoTitle(),
      dataSourceId: selectedSource,
      chartType,
      groupByField: dimension,
      valueFields: metrics,
      aggregation,
    });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-[90vw] h-[85vh] max-w-[1200px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">
            {editingConfig ? '编辑图表' : '新建图表'}
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left panel - configuration */}
          <div className="w-[400px] border-r overflow-y-auto p-5 space-y-5">
            {/* Data source tabs */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">数据源</label>
              <div className="flex flex-wrap gap-2">
                {dataSources.map(ds => (
                  <button
                    key={ds.id}
                    onClick={() => handleSourceChange(ds.id)}
                    className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                      selectedSource === ds.id
                        ? 'bg-[#1664FF] text-white border-[#1664FF]'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-[#1664FF]'
                    }`}
                  >
                    {ds.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Dimension (string fields - radio) */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">维度字段（X 轴）</label>
              <div className="space-y-1.5">
                {stringFields.map(f => (
                  <label key={f.name} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="radio"
                      name="dimension"
                      checked={dimension === f.name}
                      onChange={() => setDimension(f.name)}
                      className="accent-[#1664FF]"
                    />
                    {f.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Metrics (number fields - checkbox) */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">指标字段（Y 轴）</label>
              <div className="space-y-1.5">
                {numberFields.map(f => (
                  <label key={f.name} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={metrics.includes(f.name)}
                      onChange={() => toggleMetric(f.name)}
                      className="accent-[#1664FF]"
                    />
                    {f.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Chart type */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">图表类型</label>
              <div className="flex gap-2">
                {CHART_TYPES.map(ct => (
                  <button
                    key={ct.value}
                    onClick={() => setChartType(ct.value)}
                    className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                      chartType === ct.value
                        ? 'bg-[#1664FF] text-white border-[#1664FF]'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-[#1664FF]'
                    }`}
                  >
                    {ct.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Aggregation */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">聚合方式</label>
              <div className="flex flex-wrap gap-2">
                {AGGREGATION_TYPES.map(ag => (
                  <button
                    key={ag.value}
                    onClick={() => setAggregation(ag.value)}
                    className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                      aggregation === ag.value
                        ? 'bg-[#1664FF] text-white border-[#1664FF]'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-[#1664FF]'
                    }`}
                  >
                    {ag.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">图表标题</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={dimension && metrics.length > 0 ? getAutoTitle() : '请输入标题'}
                className="w-full border rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Right panel - preview */}
          <div className="flex-1 p-5 bg-gray-50">
            <div className="text-sm font-medium text-gray-700 mb-3">预览</div>
            <div className="bg-white rounded-lg border h-[calc(100%-32px)]">
              {dimension && metrics.length > 0 && rawData ? (
                <ChartPreview
                  rawData={rawData}
                  groupByField={dimension}
                  valueFields={metrics}
                  fieldLabels={fieldLabels}
                  chartType={chartType}
                  aggregation={aggregation}
                  title={getAutoTitle()}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  请选择维度和指标字段
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm border rounded-md text-gray-700 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={!dimension || metrics.length === 0}
            className="px-4 py-2 text-sm bg-[#1664FF] text-white rounded-md hover:bg-[#1250D4] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  );
}
