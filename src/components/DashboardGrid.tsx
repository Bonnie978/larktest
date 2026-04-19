import { useMemo } from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import ChartCard from '@/components/ChartCard';
import type { CardItem, ChartType } from '@/types/dashboard';

const { Responsive, WidthProvider } = GridLayout as any;
const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardGridProps {
  cards: CardItem[];
  isEditing: boolean;
  onLayoutChange: (layout: any[]) => void;
  onEditCard: (id: string) => void;
  onDeleteCard: (id: string) => void;
  onChartTypeChange: (id: string, chartType: ChartType) => void;
}

export default function DashboardGrid({
  cards,
  isEditing,
  onLayoutChange,
  onEditCard,
  onDeleteCard,
  onChartTypeChange,
}: DashboardGridProps) {
  const layout = useMemo(
    () =>
      cards.map((card) => ({
        i: card.config.id,
        x: card.grid.x,
        y: card.grid.y,
        w: card.grid.w,
        h: card.grid.h,
        minW: 4,
        minH: 3,
      })),
    [cards]
  );

  return (
    <ResponsiveGridLayout
      className="dashboard-grid"
      layouts={{ lg: layout }}
      breakpoints={{ lg: 1200, md: 996, sm: 768 }}
      cols={{ lg: 12, md: 12, sm: 6 }}
      rowHeight={80}
      margin={[12, 12] as [number, number]}
      isDraggable={isEditing}
      isResizable={isEditing}
      onLayoutChange={(currentLayout: any[]) => {
        onLayoutChange(currentLayout);
      }}
      draggableHandle=".drag-handle"
    >
      {cards.map((card) => (
        <div key={card.config.id} className={isEditing ? 'drag-handle' : ''}>
          <ChartCard
            config={card.config}
            isEditing={isEditing}
            onEdit={() => onEditCard(card.config.id)}
            onDelete={() => onDeleteCard(card.config.id)}
            onChartTypeChange={(ct: ChartType) => onChartTypeChange(card.config.id, ct)}
          />
        </div>
      ))}
    </ResponsiveGridLayout>
  );
}
