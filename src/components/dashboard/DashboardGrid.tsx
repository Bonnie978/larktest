import { ResponsiveGridLayout } from 'react-grid-layout';
import type { Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import type { DashboardCard } from '@/utils/storage';
import ChartCard from './ChartCard';

interface DashboardGridProps {
  cards: DashboardCard[];
  layouts: Layout[];
  editing: boolean;
  onLayoutChange: (layout: Layout[]) => void;
  onRemoveCard?: (id: string) => void;
  onEditCard?: (id: string) => void;
  onChartTypeChange?: (id: string, type: 'bar' | 'line' | 'pie') => void;
  dataMap: Record<string, any[]>;
}

export default function DashboardGrid({
  cards,
  layouts,
  editing,
  onLayoutChange,
  onRemoveCard,
  onEditCard,
  onChartTypeChange,
  dataMap,
}: DashboardGridProps) {
  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={{ lg: layouts }}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 12, md: 12, sm: 6, xs: 4, xxs: 2 }}
      rowHeight={60}
      isDraggable={editing}
      isResizable={editing}
      onLayoutChange={(layout) => onLayoutChange(layout)}
      draggableHandle=".drag-handle"
    >
      {cards.map((card) => (
        <div key={card.i}>
          <ChartCard
            config={card.config}
            data={dataMap[card.config.dataSourceId] || []}
            isEditing={editing}
            onEdit={onEditCard ? () => onEditCard(card.i) : undefined}
            onDelete={onRemoveCard ? () => onRemoveCard(card.i) : undefined}
            onChartTypeChange={onChartTypeChange ? (type) => onChartTypeChange(card.i, type) : undefined}
          />
        </div>
      ))}
    </ResponsiveGridLayout>
  );
}
