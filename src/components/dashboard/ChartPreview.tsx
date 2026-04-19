import { useMemo } from 'react';
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
import type { ChartType } from '@/types/dashboard';
import { aggregateData } from '@/utils/aggregation';
import type { AggregationType } from '@/types/dashboard';

const COLOR_PALETTE = [
  '#1664FF', '#14C9C9', '#78D3F8', '#9FDB1D',
  '#F7BA1E', '#722ED1', '#F53F3F', '#FF7D00',
];

interface ChartPreviewProps {
  rawData: Record<string, any>[];
  groupByField: string;
  valueFields: string[];
  fieldLabels: Record<string, string>;
  chartType: ChartType;
  aggregation: AggregationType;
  title?: string;
}

export default function ChartPreview({
  rawData,
  groupByField,
  valueFields,
  fieldLabels,
  chartType,
  aggregation,
  title,
}: ChartPreviewProps) {
  const data = useMemo(() => {
    return aggregateData(rawData, groupByField, valueFields, aggregation);
  }, [rawData, groupByField, valueFields, aggregation]);

  if (chartType === 'pie') {
    const pieData = data.map(d => ({
      name: String(d[groupByField]),
      value: Number(d[valueFields[0]] ?? 0),
    }));

    return (
      <div className="w-full h-full min-h-[300px] flex flex-col">
        {title && (
          <div className="text-center text-sm font-medium py-2">{title}</div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius="40%"
              outerRadius="70%"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {pieData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLOR_PALETTE[index % COLOR_PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => value.toFixed(2)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (chartType === 'line') {
    return (
      <div className="w-full h-full min-h-[300px] flex flex-col">
        {title && (
          <div className="text-center text-sm font-medium py-2">{title}</div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={groupByField} angle={-15} textAnchor="end" height={60} />
            <YAxis />
            <Tooltip />
            <Legend />
            {valueFields.map((field, index) => (
              <Line
                key={field}
                type="monotone"
                dataKey={field}
                name={fieldLabels[field] || field}
                stroke={COLOR_PALETTE[index % COLOR_PALETTE.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Bar chart
  return (
    <div className="w-full h-full min-h-[300px] flex flex-col">
      {title && (
        <div className="text-center text-sm font-medium py-2">{title}</div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={groupByField} angle={-15} textAnchor="end" height={60} />
          <YAxis />
          <Tooltip />
          <Legend />
          {valueFields.map((field, index) => (
            <Bar
              key={field}
              dataKey={field}
              name={fieldLabels[field] || field}
              fill={COLOR_PALETTE[index % COLOR_PALETTE.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
