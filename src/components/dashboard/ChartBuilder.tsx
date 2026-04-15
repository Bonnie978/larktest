import { useState, useEffect, useMemo, useCallback } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { BarChart3, TrendingUp, PieChart as PieChartIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BarChart, LineChart, PieChart } from '@/components/charts';
import { useRequest } from '@/hooks/useRequest';
import { getDatasourceData } from '@/api';
import { aggregate } from '@/utils/aggregation';
import {
  AGGREGATION_OPTIONS,
  CHART_COLORS,
  DATASOURCE_ICONS,
} from '@/constants/dashboard';
import type {
  BuilderMode,
  CardConfig,
  ChartType,
  AggregationType,
  DataSourceMeta,
} from '@/types/dashboard';

interface ChartBuilderProps {
  open: boolean;
  mode: BuilderMode;
  editingConfig?: CardConfig;
  dataSources: DataSourceMeta[];
  onConfirm: (config: CardConfig) => void;
  onClose: () => void;
}

const chartTypeIcons = [
  { type: 'bar' as const, Icon: BarChart3, label: '柱状图' },
  { type: 'line' as const, Icon: TrendingUp, label: '折线图' },
  { type: 'pie' as const, Icon: PieChartIcon, label: '饼图' },
];

export default function ChartBuilder({
  open,
  mode,
  editingConfig,
  dataSources,
  onConfirm,
  onClose,
}: ChartBuilderProps) {
  const [selectedDsId, setSelectedDsId] = useState('');
  const [groupByField, setGroupByField] = useState('');
  const [valueFields, setValueFields] = useState<string[]>([]);
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [aggregation, setAggregation] = useState<AggregationType>('none');
  const [title, setTitle] = useState('');

  const currentDs = dataSources.find((d) => d.id === selectedDsId);
  const stringFields = currentDs?.fields.filter((f) => f.type === 'string') ?? [];
  const numberFields = currentDs?.fields.filter((f) => f.type === 'number') ?? [];

  // 自动选择默认字段
  const autoSelectFields = useCallback(
    (dsId: string) => {
      const ds = dataSources.find((d) => d.id === dsId);
      if (!ds) return;
      const strings = ds.fields.filter((f) => f.type === 'string');
      const numbers = ds.fields.filter((f) => f.type === 'number');
      setGroupByField(strings[0]?.key ?? '');
      setValueFields(numbers.slice(0, 2).map((f) => f.key));
    },
    [dataSources]
  );

  // 打开时初始化
  useEffect(() => {
    if (!open || dataSources.length === 0) return;

    if (mode === 'edit' && editingConfig) {
      setSelectedDsId(editingConfig.dataSourceId);
      setGroupByField(editingConfig.groupByField);
      setValueFields(editingConfig.valueFields);
      setChartType(editingConfig.chartType);
      setAggregation(editingConfig.aggregation);
      setTitle(editingConfig.title);
    } else {
      const firstDs = dataSources[0];
      setSelectedDsId(firstDs.id);
      autoSelectFields(firstDs.id);
      setChartType('bar');
      setAggregation('none');
      setTitle('');
    }
  }, [open, mode, editingConfig, dataSources, autoSelectFields]);

  // 切换数据源
  const handleDsChange = (dsId: string) => {
    setSelectedDsId(dsId);
    autoSelectFields(dsId);
    setAggregation('none');
    setTitle('');
  };

  // 指标勾选
  const handleValueToggle = (key: string) => {
    setValueFields((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // 预览数据
  const fetchPreview = useCallback(
    () => (selectedDsId ? getDatasourceData(selectedDsId) : Promise.resolve([])),
    [selectedDsId]
  );
  const { data: rawData } = useRequest(fetchPreview, [selectedDsId]);

  const previewData = useMemo(() => {
    if (!rawData || !groupByField || valueFields.length === 0) return [];
    return aggregate(rawData, groupByField, valueFields, aggregation);
  }, [rawData, groupByField, valueFields, aggregation]);

  // fieldLabels
  const fieldLabels = useMemo(() => {
    const labels: Record<string, string> = {};
    currentDs?.fields.forEach((f) => {
      labels[f.key] = f.label;
    });
    return labels;
  }, [currentDs]);

  // 自动标题
  const autoTitle = useMemo(() => {
    if (title) return title;
    const dimLabel = currentDs?.fields.find((f) => f.key === groupByField)?.label ?? '';
    const valLabels = valueFields
      .map((k) => currentDs?.fields.find((f) => f.key === k)?.label ?? k)
      .join('/');
    if (!dimLabel || !valLabels) return '';
    return `按${dimLabel}的${valLabels}`;
  }, [title, currentDs, groupByField, valueFields]);

  // 确认
  const handleConfirm = () => {
    const config: CardConfig = {
      id: mode === 'edit' && editingConfig ? editingConfig.id : Date.now().toString(),
      title: title || autoTitle,
      dataSourceId: selectedDsId,
      chartType,
      groupByField,
      valueFields,
      aggregation,
    };
    onConfirm(config);
    onClose();
  };

  const canConfirm = groupByField && valueFields.length > 0;

  const PreviewChart =
    chartType === 'line' ? LineChart : chartType === 'pie' ? PieChart : BarChart;

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/30" />
        <Dialog.Popup className="chart-builder-dialog fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
          {/* 头部 */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E6EB]">
            <Dialog.Title className="text-base font-medium">
              {mode === 'edit' ? '编辑图表' : '新建图表'}
            </Dialog.Title>
            <Dialog.Close
              className="w-8 h-8 flex items-center justify-center rounded-md text-[#86909C] hover:bg-[#F2F3F5] hover:text-[#4E5969] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>

          {/* 数据源 Tab */}
          <div className="flex items-center gap-1 px-6 py-3 border-b border-[#E5E6EB] bg-[#F7F8FA]">
            {dataSources.map((ds) => (
              <button
                key={ds.id}
                onClick={() => handleDsChange(ds.id)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors cursor-pointer ${
                  selectedDsId === ds.id
                    ? 'bg-white text-[#1664FF] font-medium shadow-sm'
                    : 'text-[#4E5969] hover:bg-white/60'
                }`}
              >
                {DATASOURCE_ICONS[ds.id] ?? ''} {ds.name}
              </button>
            ))}
          </div>

          {/* 主体 */}
          <div className="flex flex-1 min-h-0">
            {/* 左侧面板 */}
            <div className="w-[240px] border-r border-[#E5E6EB] p-4 overflow-y-auto shrink-0">
              {/* 维度 */}
              <div className="mb-5">
                <div className="text-xs font-medium text-[#86909C] mb-2">维度（X 轴）</div>
                <div className="space-y-1">
                  {stringFields.map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setGroupByField(f.key)}
                      className={`w-full text-left px-3 py-1.5 rounded text-sm flex items-center gap-2 transition-colors cursor-pointer ${
                        groupByField === f.key
                          ? 'bg-[#E8F0FF] text-[#1664FF]'
                          : 'text-[#1D2129] hover:bg-[#F2F3F5]'
                      }`}
                    >
                      <span
                        className={`w-3 h-3 rounded-full border-2 shrink-0 ${
                          groupByField === f.key
                            ? 'border-[#1664FF] bg-[#1664FF]'
                            : 'border-[#C9CDD4]'
                        }`}
                        style={
                          groupByField === f.key
                            ? { boxShadow: 'inset 0 0 0 2px white' }
                            : undefined
                        }
                      />
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 指标 */}
              <div className="mb-5">
                <div className="text-xs font-medium text-[#86909C] mb-2">指标（Y 轴）</div>
                <div className="space-y-1">
                  {numberFields.map((f) => (
                    <label
                      key={f.key}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded text-sm cursor-pointer transition-colors ${
                        valueFields.includes(f.key)
                          ? 'bg-[#E8F0FF] text-[#1664FF]'
                          : 'text-[#1D2129] hover:bg-[#F2F3F5]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={valueFields.includes(f.key)}
                        onChange={() => handleValueToggle(f.key)}
                        className="accent-[#1664FF]"
                      />
                      {f.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* 聚合方式 */}
              <div>
                <div className="text-xs font-medium text-[#86909C] mb-2">聚合方式</div>
                <select
                  value={aggregation}
                  onChange={(e) => setAggregation(e.target.value as AggregationType)}
                  className="w-full h-8 px-2 text-sm border border-[#E5E6EB] rounded-md bg-white text-[#1D2129]"
                >
                  {AGGREGATION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 右侧预览 */}
            <div className="flex-1 p-4 flex flex-col min-w-0">
              {/* 图表类型 + 标题 */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-1">
                  {chartTypeIcons.map(({ type, Icon, label }) => (
                    <button
                      key={type}
                      onClick={() => setChartType(type)}
                      title={label}
                      className={`w-8 h-8 flex items-center justify-center rounded transition-colors cursor-pointer ${
                        chartType === type
                          ? 'text-[#1664FF] bg-[#E8F0FF]'
                          : 'text-[#86909C] hover:text-[#4E5969] hover:bg-[#F2F3F5]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={autoTitle || '输入图表标题'}
                  className="flex-1 h-8 px-3 text-sm border border-[#E5E6EB] rounded-md bg-white placeholder:text-[#C9CDD4]"
                />
              </div>

              {/* 预览区域 */}
              <div className="flex-1 min-h-0 flex items-center justify-center border border-[#E5E6EB] rounded-lg bg-[#FAFBFC]">
                {previewData.length > 0 ? (
                  <div className="w-full h-full p-2">
                    <PreviewChart
                      data={previewData}
                      groupByField={groupByField}
                      valueFields={valueFields}
                      fieldLabels={fieldLabels}
                      height={320}
                    />
                  </div>
                ) : (
                  <span className="text-sm text-[#86909C]">请选择维度和指标以预览图表</span>
                )}
              </div>
            </div>
          </div>

          {/* 底部 */}
          <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-[#E5E6EB]">
            <Button variant="ghost" size="sm" onClick={onClose}>
              取消
            </Button>
            <Button size="sm" disabled={!canConfirm} onClick={handleConfirm}>
              {mode === 'edit' ? '更新' : '添加到看板'}
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
