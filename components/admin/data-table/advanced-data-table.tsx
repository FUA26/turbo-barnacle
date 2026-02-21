/**
 * Advanced Data Table Component
 *
 * Main wrapper component with URL state management, keyboard shortcuts,
 * advanced filtering, multi-column sorting, and column visibility
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDataTableState } from "@/lib/table/use-data-table-state";
import { useKeyboardShortcuts } from "@/lib/table/use-keyboard-shortcuts";
import { cn } from "@/lib/utils";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";

interface AdvancedDataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  searchPlaceholder?: string;
  searchableColumns?: string[];
  // Initial column visibility (optional)
  initialColumnVisibility?: Record<string, boolean>;
}

export function AdvancedDataTable<TData>({
  data,
  columns,
  searchPlaceholder = "Search...",
  searchableColumns = ["name", "email", "title"],
  initialColumnVisibility = {},
}: AdvancedDataTableProps<TData>) {
  // URL state management
  const {
    sorting,
    pagination,
    columnVisibility: urlColumnVisibility,
    setSorting,
    setPagination,
    setColumnVisibility,
  } = useDataTableState();

  // Local filter state (can be moved to URL in future)
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Row selection state
  const [rowSelection, setRowSelection] = useState({});

  // Merge URL and initial column visibility
  const mergedColumnVisibility = useMemo(
    () => ({
      ...initialColumnVisibility,
      ...urlColumnVisibility,
    }),
    [initialColumnVisibility, urlColumnVisibility]
  );

  // Create table instance
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
      columnVisibility: mergedColumnVisibility,
      rowSelection,
    },
  });

  // Keyboard shortcuts
  const searchInputRef = useEffect(() => {
    const handleFocusSearch = () => {
      const searchInput = document.querySelector(
        'input[placeholder*="Search"], input[placeholder*="Filter"]'
      ) as HTMLInputElement;
      searchInput?.focus();
    };

    useKeyboardShortcuts(
      {
        onFocusSearch: handleFocusSearch,
        onClearFilters: () => {
          setColumnFilters([]);
          setGlobalFilter("");
          setRowSelection({});
        },
      },
      true
    );
  }, []);

  // Calculate filter count
  const filterCount = columnFilters.length + (globalFilter ? 1 : 0);

  // Selected rows count
  const selectedCount = Object.keys(rowSelection).length;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <DataTableToolbar
        searchValue={globalFilter ?? ""}
        onSearchChange={setGlobalFilter}
        searchPlaceholder={searchPlaceholder}
        filterCount={filterCount}
        onClearFilters={() => {
          setColumnFilters([]);
          setGlobalFilter("");
          setRowSelection({});
        }}
        table={table}
      />

      {/* Bulk Actions Bar */}
      {selectedCount > 0 && (
        <div className="flex items-center justify-between border-b p-4 bg-muted/50 rounded-t-lg">
          <span className="text-sm font-medium">
            {selectedCount} row{selectedCount > 1 ? "s" : ""} selected
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setRowSelection({})}>
              Clear
            </Button>
            <Button size="sm">Bulk Actions</Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : (
                        <div
                          className={cn(
                            header.column.getCanSort() &&
                              "cursor-pointer select-none hover:underline flex items-center gap-2",
                            header.column.id === "select" && "w-[40px]"
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <Badge variant="outline" className="text-xs font-normal ml-2">
                              {header.column.getIsSorted() === "asc"
                                ? "↑"
                                : header.column.getIsSorted() === "desc"
                                  ? "↓"
                                  : "↕"}
                            </Badge>
                          )}
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground">No results found</p>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your search or filters
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <DataTablePagination table={table} />

      {/* Keyboard Shortcuts Hint */}
      <div className="text-xs text-muted-foreground">
        <span className="font-medium">Shortcuts:</span> Ctrl+Shift+F (Search)
        {" • "}
        Ctrl+Shift+D (Clear filters)
      </div>
    </div>
  );
}
