import React, { useState, useCallback } from "react";

export interface Column<T> {
  key: string;
  title: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, record: T, index: number) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: string | ((record: T) => string);
  onRowClick?: (record: T) => void;
  expandable?: {
    expandedRowRender: (record: T) => React.ReactNode;
  };
}

function Table<T extends Record<string, any>>({
  columns,
  data,
  rowKey,
  onRowClick,
  expandable,
}: TableProps<T>) {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  const getRowKey = useCallback(
    (record: T) => {
      if (typeof rowKey === "function") return rowKey(record);
      return String(record[rowKey]);
    },
    [rowKey],
  );

  const handleRowClick = (record: T) => {
    if (expandable) {
      const key = getRowKey(record);
      setExpandedKeys((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
    }
    onRowClick?.(record);
  };

  const clickable = !!(onRowClick || expandable);

  return (
    <div className="w-full overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#F7F8FA] border-b border-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 text-${col.align || 'left'} text-text-tertiary text-xs font-medium uppercase tracking-wider`}
                style={{ height: 44, width: col.width }}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((record, index) => {
            const key = getRowKey(record);
            const expanded = expandable && expandedKeys.has(key);
            return (
              <React.Fragment key={key}>
                <tr
                  className={`border-b border-border/60 transition-colors ${
                    clickable ? "hover:bg-primary-bg/40 cursor-pointer" : "hover:bg-[#FAFAFA]"
                  } ${index % 2 === 0 ? "" : "bg-[#FAFBFC]"}`}
                  onClick={() => handleRowClick(record)}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 text-sm text-text-primary text-${col.align || 'left'}`}
                    >
                      {col.render
                        ? col.render(record[col.key], record, index)
                        : record[col.key]}
                    </td>
                  ))}
                </tr>
                {expanded && (
                  <tr className="bg-[#F7F8FA]">
                    <td colSpan={columns.length} className="px-4 py-4">
                      {expandable!.expandedRowRender(record)}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="text-center py-12 text-text-tertiary text-sm">
                暂无数据
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
export type { TableProps };
