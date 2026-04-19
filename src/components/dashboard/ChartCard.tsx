import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { aggregate } from '@/utils/aggregation';
import type { AggregationType } from '@/utils/aggregation';

export interface CardConfig {
  id: string;
  title: string;
  dataSourceId: string;
  chartType: 'bar' | 'line' | 'pie';
  groupByField: string;
  valueFields: string[];
  aggregation: AggregationType;
}

interface ChartCardProps {
  config: CardConfig;
  data: any[];
  isEditing: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onChartTypeChange?: (type: 'bar' | 'line' | 'pie') => void;
}

const CHART_COLORS = [
  '#1664FF', '#14C9C9', '#78D3F8', '#9FDB1D',
  '#F7BA1E', '#722ED1', '#F53F3F', '#FF7D00'
];

export default function ChartCard({
  config,
  data,
  isEditing,
  onEdit,
  onDelete,
  onChartTypeChange,
}: ChartCardProps) {
  const chartOption = useMemo(() => {
    const aggregatedData = aggregate(
      data,
      config.groupByField,
      config.valueFields,
      config.aggregation
    );

    if (config.chartType === 'pie') {
      return {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          bottom: 10,
          left: 'center'
        },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 8,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 14,
                fontWeight: 'bold'
              }
            },
            data: aggregatedData.map((item, idx) => ({
              name: item[config.groupByField],
              value: item[config.valueFields[0]],
              itemStyle: { color: CHART_COLORS[idx % CHART_COLORS.length] }
            }))
          }
        ]
      };
    }

    const xAxisData = aggregatedData.map(item => item[config.groupByField]);
    const series = config.valueFields.map((field, idx) => ({
      name: field,
      type: config.chartType,
      data: aggregatedData.map(item => item[field]),
      itemStyle: { color: CHART_COLORS[idx % CHART_COLORS.length] },
      smooth: config.chartType === 'line'
    }));

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: config.chartType === 'line' ? 'cross' : 'shadow'
        }
      },
      legend: {
        data: config.valueFields,
        bottom: 10
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisLabel: {
          rotate: xAxisData.length > 6 ? 30 : 0
        }
      },
      yAxis: {
        type: 'value'
      },
      series
    };
  }, [data, config]);

  return (
    <Card className="h-full shadow-sm overflow-hidden">
      <CardHeader className="pb-2 pt-3 px-4 flex flex-row items-center justify-between">
        <CardTitle className={`text-[15px] font-medium ${isEditing ? 'drag-handle cursor-move' : ''}`}>
          {config.title}
        </CardTitle>
        <div className="flex items-center gap-2">
          {isEditing && onChartTypeChange && (
            <div className="flex gap-1">
              <button
                className={`px-2 py-1 text-xs rounded ${config.chartType === 'bar' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                onClick={() => onChartTypeChange('bar')}
                title="柱状图"
              >
                📊
              </button>
              <button
                className={`px-2 py-1 text-xs rounded ${config.chartType === 'line' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                onClick={() => onChartTypeChange('line')}
                title="折线图"
              >
                📈
              </button>
              <button
                className={`px-2 py-1 text-xs rounded ${config.chartType === 'pie' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                onClick={() => onChartTypeChange('pie')}
                title="饼图"
              >
                🥧
              </button>
            </div>
          )}
          {isEditing && onEdit && (
            <button
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
              onClick={onEdit}
              title="编辑"
            >
              ✏️
            </button>
          )}
          {isEditing && onDelete && (
            <button
              className="text-xs text-muted-foreground hover:text-red-500 transition-colors"
              onClick={onDelete}
              title="删除"
            >
              ✕
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-2 h-[calc(100%-50px)]">
        <ReactECharts
          option={chartOption}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'canvas' }}
        />
      </CardContent>
    </Card>
  );
}
