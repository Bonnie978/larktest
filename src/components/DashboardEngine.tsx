import React from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-grid-layout/css/react-resizable.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

export interface DashboardCard {
  id: string;
  indicatorId: string;
  chartType: string;
  layout: { x: number; y: number; w: number; h: number };
}

export interface DashboardEngineProps {
  cards: DashboardCard[];
  isEditing: boolean;
  onLayoutChange: (cards: DashboardCard[]) => void;
  onDeleteCard?: (cardId: string) => void;
  renderCard: (card: DashboardCard) => React.ReactNode;
}

const DashboardEngine: React.FC<DashboardEngineProps> = ({
  cards,
  isEditing,
  onLayoutChange,
  onDeleteCard,
  renderCard,
}) => {
  const layouts = {
    lg: cards.map((card) => ({
      i: card.id,
      x: card.layout.x,
      y: card.layout.y,
      w: card.layout.w,
      h: card.layout.h,
      minW: 4,
      minH: 3,
    })),
  };

  const handleLayoutChange = (currentLayout: Layout[]) => {
    const updatedCards = cards.map((card) => {
      const layoutItem = currentLayout.find((l) => l.i === card.id);
      if (layoutItem) {
        return {
          ...card,
          layout: {
            x: layoutItem.x,
            y: layoutItem.y,
            w: layoutItem.w,
            h: layoutItem.h,
          },
        };
      }
      return card;
    });
    onLayoutChange(updatedCards);
  };

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={layouts}
      breakpoints={{ lg: 1200, md: 996, sm: 768 }}
      cols={{ lg: 12, md: 12, sm: 6 }}
      rowHeight={100}
      isDraggable={isEditing}
      isResizable={isEditing}
      onLayoutChange={handleLayoutChange}
    >
      {cards.map((card) => (
        <div
          key={card.id}
          className={
            isEditing
              ? 'relative border-2 border-dashed border-primary/30 rounded-lg'
              : 'relative'
          }
        >
          {isEditing && onDeleteCard && (
            <button
              className="absolute top-1 right-1 z-10 w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs leading-none hover:bg-red-600 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteCard(card.id);
              }}
              aria-label={`删除卡片 ${card.id}`}
            >
              ✕
            </button>
          )}
          {renderCard(card)}
        </div>
      ))}
    </ResponsiveGridLayout>
  );
};

export default DashboardEngine;
