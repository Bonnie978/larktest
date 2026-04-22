import { useMemo } from 'react';
import type { AggregatedData, ChartType } from '@/types/dashboard';

interface SimpleChartProps {
  data: AggregatedData[];
  chartType: ChartType;
}

const COLORS = ['#1664FF', '#3CC9A3', '#FF7D00', '#F53F3F', '#6AA1FF', '#7BE188', '#FFB980', '#FF8F8F'];

function BarChart({ data }: { data: AggregatedData[] }) {
  if (!data.length || !data[0].data.length) {
    return <EmptyState />;
  }

  const series = data[0];
  const maxVal = Math.max(...series.data.map(d => d.value), 1);
  const barGap = 8;
  const labelHeight = 24;
  const chartHeight = 160;

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 flex items-end justify-around px-2" style={{ minHeight: chartHeight }}>
        {series.data.map((d, i) => {
          const h = (d.value / maxVal) * (chartHeight - labelHeight);
          return (
            <div key={i} className="flex flex-col items-center flex-1" style={{ gap: 4, maxWidth: 60 }}>
              <span className="text-[10px] text-muted-foreground">{Math.round(d.value)}</span>
              <div
                className="w-full rounded-t-sm transition-all duration-300"
                style={{
                  height: h,
                  minHeight: 2,
                  backgroundColor: COLORS[i % COLORS.length],
                  marginLeft: barGap / 2,
                  marginRight: barGap / 2,
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-around px-2 mt-1">
        {series.data.map((d, i) => (
          <div key={i} className="flex-1 text-center">
            <span className="text-[10px] text-muted-foreground truncate block" title={d.category}>
              {d.category.length > 6 ? d.category.slice(0, 6) + '…' : d.category}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LineChart({ data }: { data: AggregatedData[] }) {
  if (!data.length || !data[0].data.length) {
    return <EmptyState />;
  }

  const series = data[0];
  const maxVal = Math.max(...series.data.map(d => d.value), 1);
  const points = series.data.map((d, i) => ({
    x: (i / Math.max(series.data.length - 1, 1)) * 100,
    y: 100 - (d.value / maxVal) * 85,
    ...d,
  }));
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="w-full h-full flex flex-col">
      <svg className="flex-1" viewBox="-5 -5 110 110" preserveAspectRatio="none">
        <path d={pathD} fill="none" stroke="#1664FF" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#1664FF" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <div className="flex justify-between px-2 mt-1">
        {series.data.map((d, i) => (
          <span key={i} className="text-[10px] text-muted-foreground truncate" title={d.category}>
            {d.category.length > 6 ? d.category.slice(0, 6) + '…' : d.category}
          </span>
        ))}
      </div>
    </div>
  );
}

function PieChart({ data }: { data: AggregatedData[] }) {
  if (!data.length || !data[0].data.length) {
    return <EmptyState />;
  }

  const series = data[0];
  const total = series.data.reduce((acc, d) => acc + d.value, 0);
  if (total === 0) return <EmptyState />;

  let currentAngle = -Math.PI / 2;
  const slices = series.data.map((d, i) => {
    const angle = (d.value / total) * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;
    
    const largeArc = angle > Math.PI ? 1 : 0;
    const x1 = 50 + 40 * Math.cos(startAngle);
    const y1 = 50 + 40 * Math.sin(startAngle);
    const x2 = 50 + 40 * Math.cos(endAngle);
    const y2 = 50 + 40 * Math.sin(endAngle);

    return {
      path: `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`,
      color: COLORS[i % COLORS.length],
      label: d.category,
      percent: Math.round((d.value / total) * 100),
    };
  });

  return (
    <div className="w-full h-full flex items-center gap-2">
      <svg className="w-1/2 aspect-square" viewBox="0 0 100 100">
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} stroke="white" strokeWidth="1" />
        ))}
      </svg>
      <div className="flex-1 flex flex-col gap-1 overflow-hidden">
        {slices.slice(0, 5).map((s, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[10px]">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
            <span className="truncate text-muted-foreground">{s.label}</span>
            <span className="ml-auto font-medium">{s.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
      暂无数据
    </div>
  );
}

export default function SimpleChart({ data, chartType }: SimpleChartProps) {
  const chart = useMemo(() => {
    switch (chartType) {
      case 'bar':
        return <BarChart data={data} />;
      case 'line':
      case 'area':
        return <LineChart data={data} />;
      case 'pie':
        return <PieChart data={data} />;
      default:
        return <BarChart data={data} />;
    }
  }, [data, chartType]);

  return <div className="w-full h-full p-2">{chart}</div>;
}
