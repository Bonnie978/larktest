import { useMemo, useRef } from 'react';
import { useContainerWidth, useResponsiveLayout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import ChartCard from '@/components/ChartCard';
import type { CardItem, ChartType, LayoutItem } from '@/types/dashboard';

interface DashboardGridProps {
  cards: CardItem[];
  isEditing: boolean;
  onLayoutChange: (layout: LayoutItem[]) => void;
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
  const containerRef = useRef<HTMLDivElement>(null);
  const width = useContainerWidth(containerRef);

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

  const handleLayoutChange = (newLayout: ReactGridLayout.Layout[]) => {
    onLayoutChange(
      newLayout.map((l) => ({ i: l.i, x: l.x, y: l.y, w: l.w, h: l.h }))
    );
  };

  const { gridProps, gridItemProps } = useResponsiveLayout({
    width,
    breakpoints: { lg: 996, md: 768, sm: 480 },
    cols: { lg: 12, md: 12, sm: 6 },
    layouts: { lg: layout },
    rowHeight: 80,
    margin: [12, 12],
    isDraggable: isEditing,
    isResizable: isEditing,
    onLayoutChange: handleLayoutChange,
  });

  return (
    <div ref={containerRef} className="w-full">
      <div {...gridProps}>
        {cards.map((card, idx) => (
          <div key={card.config.id} {...gridItemProps(idx)}>
            <ChartCard
              config={card.config}
              isEditing={isEditing}
              onEdit={() => onEditCard(card.config.id)}
              onDelete={() => onDeleteCard(card.config.id)}
              onChartTypeChange={(ct) => onChartTypeChange(card.config.id, ct)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
