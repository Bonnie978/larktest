import { useMemo } from 'react';
import { BarChart3, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { BarChart, LineChart, PieChart } from '@/components/charts';
import { useRequest } from '@/hooks/useRequest';
import { getDatasourceData, getDatasources } from '@/api';
import { aggregate } from '@/utils/aggregation';
import type { CardConfig, ChartType } from '@/types/dashboard';
import { CHART_COLORS } from '@/constants/dashboard';

interface ChartCardProps {
  config: CardConfig;
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onChartTypeChange: (type: ChartType) => void;
}

const chartTypeIcons = [
  { type: 'bar' as const, Icon: BarChart3 },
  { type: 'line' as const, Icon: TrendingUp },
  { type: 'pie' as const, Icon: PieChartIcon },
];

export default function ChartCard({
  config,
  isEditing,
  onEdit,
  onDelete,
  onChartTypeChange,
}: ChartCardProps) {
  const { data: rawData, loading } = useRequest(
    () => getDatasourceData(config.dataSourceId),
    [config.dataSourceId]
  );

  const { data: dataSources } = useRequest(getDatasources);

  const fieldLabels = useMemo(() => {
    const labels: Record<string, string> = {};
    const ds = dataSources?.find((d) => d.id === config.dataSourceId);
    ds?.fields.forEach((f) => {
      labels[f.key] = f.label;
    });
    return labels;
  }, [dataSources, config.dataSourceId]);

  const chartData = useMemo(() => {
    if (!rawData) return [];
    return aggregate(rawData, config.groupByField, config.valueFields, config.aggregation);
  }, [rawData, config.groupByField, config.valueFields, config.aggregation]);

  const ChartComponent =
    config.chartType === 'line' ? LineChart : config.chartType === 'pie' ? PieChart : BarChart;

  return (
    <Card className="h-full shadow-sm flex flex-col overflow-hidden">
      <CardHeader className="pb-0 pt-3 px-4 shrink-0">
        <div className="flex items-center justify-between drag-handle" style={{ cursor: isEditing ? 'move' : 'default' }}>
          <span className="text-sm font-medium truncate mr-2">{config.title}</span>
          <div className="flex items-center gap-1 shrink-0">
            {/* 图表类型切换 */}
            {chartTypeIcons.map(({ type, Icon }) => (
              <button
                key={type}
                onClick={(e) => {
                  e.stopPropagation();
                  onChartTypeChange(type);
                }}
                className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
                  config.chartType === type
                    ? 'text-[#1664FF] bg-[#E8F0FF]'
                    : 'text-[#86909C] hover:text-[#4E5969] hover:bg-[#F2F3F5]'
                }`}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
            {/* 编辑/删除按钮 */}
            {isEditing && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="w-6 h-6 flex items-center justify-center rounded-full bg-[#1664FF] text-white text-xs ml-1 hover:bg-[#1664FF]/80"
                  title="编辑"
                >
                  ✎
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="w-6 h-6 flex items-center justify-center rounded-full bg-[#F53F3F] text-white text-xs hover:bg-[#F53F3F]/80"
                  title="删除"
                >
                  ✕
                </button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 px-2 pb-2 pt-1">
        {loading ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            加载中...
          </div>
        ) : (
          <ChartComponent
            data={chartData}
            groupByField={config.groupByField}
            valueFields={config.valueFields}
            fieldLabels={fieldLabels}
          />
        )}
      </CardContent>
    </Card>
  );
}
