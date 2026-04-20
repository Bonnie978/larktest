import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DashboardGrid from '../DashboardGrid';
import type { ChartConfig } from '@/types/dashboard';

// Mock react-grid-layout
vi.mock('react-grid-layout', () => ({
  default: ({ children, ...props }: any) => (
    <div data-testid="grid-layout" data-draggable={String(props.dragConfig?.enabled)} data-resizable={String(props.resizeConfig?.enabled)}>
      {children}
    </div>
  ),
}));

// Mock ChartCard
vi.mock('@/components/dashboard/ChartCard', () => ({
  default: ({ config, editable, onRemove }: any) => (
    <div data-testid={`chart-card-${config.id}`} data-editable={String(editable)}>
      <span>{config.title}</span>
      {editable && onRemove && (
        <button data-testid={`delete-btn-${config.id}`} onClick={onRemove}>
          Delete
        </button>
      )}
    </div>
  ),
}));

// Mock CSS imports
vi.mock('react-grid-layout/css/styles.css', () => ({}));
vi.mock('@/grid-layout.css', () => ({}));

const mockCharts: ChartConfig[] = [
  {
    id: 'chart-1',
    title: '产线产量',
    dataSource: 'line-production',
    dimension: 'lineName',
    metrics: ['planned'],
    aggregation: 'sum',
    chartType: 'bar',
    layout: { x: 0, y: 0, w: 6, h: 4 },
  },
  {
    id: 'chart-2',
    title: '不良率趋势',
    dataSource: 'quality-defects',
    dimension: 'date',
    metrics: ['defectRate'],
    aggregation: 'sum',
    chartType: 'line',
    layout: { x: 6, y: 0, w: 6, h: 4 },
  },
];

const mockLayout = [
  { i: 'chart-1', x: 0, y: 0, w: 6, h: 4 },
  { i: 'chart-2', x: 6, y: 0, w: 6, h: 4 },
];

describe('DashboardGrid', () => {
  it('renders all chart cards', () => {
    render(
      <DashboardGrid
        charts={mockCharts}
        layout={mockLayout}
        isEditMode={false}
        onLayoutChange={vi.fn()}
        onDeleteChart={vi.fn()}
      />
    );

    expect(screen.getByTestId('chart-card-chart-1')).toBeDefined();
    expect(screen.getByTestId('chart-card-chart-2')).toBeDefined();
  });

  it('passes drag enabled=false in view mode', () => {
    render(
      <DashboardGrid
        charts={mockCharts}
        layout={mockLayout}
        isEditMode={false}
        onLayoutChange={vi.fn()}
        onDeleteChart={vi.fn()}
      />
    );

    const grid = screen.getByTestId('grid-layout');
    expect(grid.getAttribute('data-draggable')).toBe('false');
    expect(grid.getAttribute('data-resizable')).toBe('false');
  });

  it('passes drag enabled=true in edit mode', () => {
    render(
      <DashboardGrid
        charts={mockCharts}
        layout={mockLayout}
        isEditMode={true}
        onLayoutChange={vi.fn()}
        onDeleteChart={vi.fn()}
      />
    );

    const grid = screen.getByTestId('grid-layout');
    expect(grid.getAttribute('data-draggable')).toBe('true');
    expect(grid.getAttribute('data-resizable')).toBe('true');
  });

  it('shows drag handle in edit mode', () => {
    const { container } = render(
      <DashboardGrid
        charts={mockCharts}
        layout={mockLayout}
        isEditMode={true}
        onLayoutChange={vi.fn()}
        onDeleteChart={vi.fn()}
      />
    );

    const handles = container.querySelectorAll('.drag-handle');
    expect(handles.length).toBe(2);
  });

  it('hides drag handle in view mode', () => {
    const { container } = render(
      <DashboardGrid
        charts={mockCharts}
        layout={mockLayout}
        isEditMode={false}
        onLayoutChange={vi.fn()}
        onDeleteChart={vi.fn()}
      />
    );

    const handles = container.querySelectorAll('.drag-handle');
    expect(handles.length).toBe(0);
  });

  it('calls onDeleteChart when delete button clicked', () => {
    const onDeleteChart = vi.fn();

    render(
      <DashboardGrid
        charts={mockCharts}
        layout={mockLayout}
        isEditMode={true}
        onLayoutChange={vi.fn()}
        onDeleteChart={onDeleteChart}
      />
    );

    fireEvent.click(screen.getByTestId('delete-btn-chart-1'));
    expect(onDeleteChart).toHaveBeenCalledWith('chart-1');
  });

  it('renders empty grid when no charts', () => {
    render(
      <DashboardGrid
        charts={[]}
        layout={[]}
        isEditMode={false}
        onLayoutChange={vi.fn()}
        onDeleteChart={vi.fn()}
      />
    );

    const grid = screen.getByTestId('grid-layout');
    expect(grid).toBeDefined();
  });
});
