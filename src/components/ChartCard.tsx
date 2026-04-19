import { useEffect, useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { CardConfig, ChartType } from '@/types/dashboard';
import { aggregate } from '@/utils/aggregate';
import { buildChartOption } from '@/utils/chartOption';
import { request } from '@/api/request';

const CHART_TYPES: { value: ChartType; label: string }[] = [
  { value: 'bar', label: '柱状图' },
  { value: 'line', label: '折线图' },
  { value: 'pie', label: '饼图' },
];

// Map datasource ids to existing API paths
const DS_API_MAP: Record<string, string> = {
  'line-production': '/production/lines',
  'weekly-defects': '/production/defects',
  'quality': '/quality',
  'equipment': '/equipment',
  'orders': '/orders',
};

interface ChartCardProps {
  config: CardConfig;
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onChartTypeChange: (chartType: ChartType) => void;
}

export default function ChartCard({ config, isEditing, onEdit, onDelete, onChartTypeChange }: ChartCardProps) {
  const [rawData, setRawData] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    const apiPath = DS_API_MAP[config.dataSourceId];
    if (!apiPath) return;
    request<Record<string, unknown>[]>(apiPath)
      .then((data) => setRawData(data))
      .catch(() => setRawData([]));
  }, [config.dataSourceId]);

  const chartData = useMemo(
    () =>
      aggregate({
        data: rawData,
        groupByField: config.groupByField,
        valueFields: config.valueFields,
        aggregation: config.aggregation,
      }),
    [rawData, config.groupByField, config.valueFields, config.aggregation]
  );

  const option = useMemo(
    () => buildChartOption(config.chartType, chartData, config.groupByField, config.valueFields),
    [config.chartType, chartData, config.groupByField, config.valueFields]
  );

  return (
    <Card
      className={`h-full flex flex-col shadow-sm overflow-hidden ${
        isEditing ? 'border-dashed border-[#1664FF] bg-[#1664FF]/5' : ''
      }`}
    >
      <CardHeader className="flex flex-row items-center justify-between py-2 px-4 space-y-0">
        <span className="text-sm font-medium truncate">{config.title}</span>
        <div className="flex items-center gap-1 shrink-0">
          {CHART_TYPES.map((ct) => (
            <Button
              key={ct.value}
              variant={config.chartType === ct.value ? 'default' : 'ghost'}
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => onChartTypeChange(ct.value)}
            >
              {ct.label}
            </Button>
          ))}
          {isEditing && (
            <>
              <Button variant="ghost" size="sm" className="h-6 px-1 text-[#1664FF]" onClick={onEdit}>
                ✎
              </Button>
              <Button variant="ghost" size="sm" className="h-6 px-1 text-[#F53F3F]" onClick={onDelete}>
                ✕
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-2 pt-0 min-h-0">
        <ReactECharts
          option={option}
          style={{ width: '100%', height: '100%' }}
          opts={{ renderer: 'canvas' }}
          notMerge
        />
      </CardContent>
    </Card>
  );
}
