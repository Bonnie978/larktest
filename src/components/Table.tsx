import React, { useState, useCallback } from "react";
import {
  Table as ShadcnTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  title: string;
  width?: string;
  align?: "left" | "center" | "right";
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

const alignClass = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

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
    [rowKey]
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
    <ShadcnTable>
      <TableHeader>
        <TableRow className="bg-muted/50 hover:bg-muted/50">
          {columns.map((col) => (
            <TableHead
              key={col.key}
              className={cn(
                "text-xs font-medium text-muted-foreground h-10",
                alignClass[col.align || "left"]
              )}
              style={{ width: col.width }}
            >
              {col.title}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((record, index) => {
          const key = getRowKey(record);
          const expanded = expandable && expandedKeys.has(key);
          return (
            <React.Fragment key={key}>
              <TableRow
                className={clickable ? "hover:bg-accent cursor-pointer" : undefined}
                onClick={() => handleRowClick(record)}
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    className={cn("py-3", alignClass[col.align || "left"])}
                  >
                    {col.render
                      ? col.render(record[col.key], record, index)
                      : record[col.key]}
                  </TableCell>
                ))}
              </TableRow>
              {expanded && (
                <TableRow className="bg-muted hover:bg-muted">
                  <TableCell colSpan={columns.length} className="px-4 py-4">
                    {expandable!.expandedRowRender(record)}
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          );
        })}
        {data.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={columns.length}
              className="text-center py-12 text-muted-foreground"
            >
              暂无数据
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </ShadcnTable>
  );
}

export default Table;
export type { TableProps };
