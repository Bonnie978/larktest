import { useEffect, useMemo, useState } from 'react';
import type { AggregationType, ChartConfig, ChartType, DataSourceType } from '@/types/dashboard';
import { dataSourceMeta } from '@/config/dataSources';
import { useDataSource } from '@/hooks/useDataSource';
import { validateChartConfig } from '@/utils/storage';
import ChartPreview from './ChartPreview';

const CHART_TYPES: { value: ChartType; label: string }[] = [
  { value: 'bar', label: '柱状图' },
  { value: 'line', label: '折线图' },
  { value: 'pie', label: '饼图' },
  { value: 'area', label: '面积图' },
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
  editingConfig?: ChartConfig;
  onConfirm: (config: ChartConfig) => void;
  onCancel: () => void;
}

function createDraft(base?: ChartConfig): ChartConfig {
  if (base) return base;

  return {
    id: `chart-${Date.now()}`,
    title: '',
    dataSource: 'line-production',
    dimension: dataSourceMeta['line-production'].dimensions[0].field,
    metrics: [dataSourceMeta['line-production'].metrics[0].field],
    aggregation: 'sum',
    chartType: 'bar',
    layout: { x: 0, y: Infinity, w: 4, h: 3 },
  };
}

export default function ChartBuilder({ open, editingConfig, onConfirm, onCancel }: ChartBuilderProps) {
  const [draft, setDraft] = useState<ChartConfig>(() => createDraft(editingConfig));

  useEffect(() => {
    if (!open) return;
    setDraft(createDraft(editingConfig));
  }, [open, editingConfig]);

  const currentMeta = dataSourceMeta[draft.dataSource as DataSourceType];
  const rawData = useDataSource(draft.dataSource);

  const fieldLabels = useMemo(() => {
    const labels: Record<string, string> = {};
    currentMeta.dimensions.forEach(item => {
      labels[item.field] = item.label;
    });
    currentMeta.metrics.forEach(item => {
      labels[item.field] = item.label;
    });
    return labels;
  }, [currentMeta]);

  const previewTitle = useMemo(() => {
    if (draft.title.trim()) return draft.title.trim();
    const dimensionLabel = fieldLabels[draft.dimension] ?? draft.dimension;
    const metricLabel = draft.metrics.map(metric => fieldLabels[metric] ?? metric).join(' / ');
    return `按${dimensionLabel}查看${metricLabel}`;
  }, [draft.title, draft.dimension, draft.metrics, fieldLabels]);

  const validationMessage = useMemo(() => {
    if (!currentMeta.dimensions.some(item => item.field === draft.dimension)) {
      return '请选择有效的维度字段';
    }
    if (!draft.metrics.length) {
      return '请至少选择一个指标字段';
    }
    if (!draft.metrics.every(metric => currentMeta.metrics.some(item => item.field === metric))) {
      return '当前指标字段与所选数据源不匹配，请重新选择';
    }
    if (!validateChartConfig({ ...draft, title: previewTitle })) {
      return '当前配置无效，无法保存';
    }
    return '';
  }, [currentMeta, draft, previewTitle]);

  const toggleMetric = (field: string) => {
    setDraft(prev => ({
      ...prev,
      metrics: prev.metrics.includes(field)
        ? prev.metrics.filter(item => item !== field)
        : [...prev.metrics, field],
    }));
  };

  const handleSourceChange = (dataSource: DataSourceType) => {
    const meta = dataSourceMeta[dataSource];
    setDraft(prev => ({
      ...prev,
      dataSource,
      dimension: meta.dimensions[0]?.field ?? '',
      metrics: meta.metrics[0] ? [meta.metrics[0].field] : [],
    }));
  };

  const handleConfirm = () => {
    if (validationMessage) return;
    onConfirm({ ...draft, title: previewTitle });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-[90vw] h-[85vh] max-w-[1200px] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">{editingConfig ? '编辑图表' : '新建图表'}</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-[400px] border-r overflow-y-auto p-5 space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">数据源</label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(dataSourceMeta) as DataSourceType[]).map(ds => (
                  <button
                    key={ds}
                    onClick={() => handleSourceChange(ds)}
                    className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                      draft.dataSource === ds
                        ? 'bg-[#1664FF] text-white border-[#1664FF]'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-[#1664FF]'
                    }`}
                  >
                    {dataSourceMeta[ds].label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">维度字段（X 轴）</label>
              <div className="space-y-1.5">
                {currentMeta.dimensions.map(field => (
                  <label key={field.field} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="radio"
                      name="dimension"
                      checked={draft.dimension === field.field}
                      onChange={() => setDraft(prev => ({ ...prev, dimension: field.field }))}
                      className="accent-[#1664FF]"
                    />
                    {field.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">指标字段（Y 轴）</label>
              <div className="space-y-1.5">
                {currentMeta.metrics.map(field => (
                  <label key={field.field} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={draft.metrics.includes(field.field)}
                      onChange={() => toggleMetric(field.field)}
                      className="accent-[#1664FF]"
                    />
                    {field.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">图表类型</label>
              <div className="flex gap-2 flex-wrap">
                {CHART_TYPES.map(type => (
                  <button
                    key={type.value}
                    onClick={() => setDraft(prev => ({ ...prev, chartType: type.value }))}
                    className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                      draft.chartType === type.value
                        ? 'bg-[#1664FF] text-white border-[#1664FF]'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-[#1664FF]'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">聚合方式</label>
              <div className="flex flex-wrap gap-2">
                {AGGREGATION_TYPES.map(type => (
                  <button
                    key={type.value}
                    onClick={() => setDraft(prev => ({ ...prev, aggregation: type.value }))}
                    className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                      draft.aggregation === type.value
                        ? 'bg-[#1664FF] text-white border-[#1664FF]'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-[#1664FF]'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">图表标题</label>
              <input
                type="text"
                value={draft.title}
                onChange={e => setDraft(prev => ({ ...prev, title: e.target.value }))}
                placeholder={previewTitle}
                className="w-full border rounded-md px-3 py-2 text-sm"
              />
            </div>

            {validationMessage && (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                {validationMessage}
              </div>
            )}
          </div>

          <div className="flex-1 p-5 bg-gray-50">
            <div className="text-sm font-medium text-gray-700 mb-3">预览</div>
            <div className="bg-white rounded-lg border h-[calc(100%-32px)] p-2">
              {!validationMessage ? (
                <ChartPreview
                  rawData={rawData}
                  groupByField={draft.dimension}
                  valueFields={draft.metrics}
                  fieldLabels={fieldLabels}
                  chartType={draft.chartType}
                  aggregation={draft.aggregation}
                  title={previewTitle}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  当前配置无效，暂不展示预览
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t">
          <button onClick={onCancel} className="px-4 py-2 text-sm border rounded-md text-gray-700 hover:bg-gray-50">取消</button>
          <button
            onClick={handleConfirm}
            disabled={!!validationMessage}
            className="px-4 py-2 text-sm bg-[#1664FF] text-white rounded-md hover:bg-[#1250D4] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  );
}
