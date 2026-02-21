/**
 * Data Table Pagination Component
 *
 * Enhanced pagination with row count display and page size selector
 */

"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface DataTablePaginationProps {
  table: any;
  totalRows?: number;
  pageSizeOptions?: number[];
}

export function DataTablePaginationSkeleton() {
  return (
    <div className="flex items-center justify-between px-2 py-4">
      <Skeleton className="h-5 w-[150px]" />
      <div className="flex gap-2">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-9" />
        <Skeleton className="h-9 w-9" />
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  );
}

export function DataTablePagination({
  table,
  totalRows,
  pageSizeOptions = [10, 20, 30, 50, 100],
}: DataTablePaginationProps) {
  const pagination = table.getState().pagination;
  const rowCount = totalRows ?? table.getFilteredRowModel().rows.length;
  const pageSize = pagination.pageSize;
  const currentPage = pagination.pageIndex + 1;
  const totalPages = table.getPageCount();

  const startRow = rowCount === 0 ? 0 : pagination.pageIndex * pageSize + 1;
  const endRow = Math.min((pagination.pageIndex + 1) * pageSize, rowCount);

  return (
    <div className="flex items-center justify-between px-2 py-4">
      {/* Row Count Display */}
      <div className="flex-1 text-sm text-muted-foreground">
        {rowCount === 0 ? (
          "No rows found"
        ) : (
          <>
            Showing {startRow} to {endRow} of {rowCount} row(s)
          </>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-6 lg:gap-8">
        {/* Page Size Selector */}
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page Navigation */}
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.setPageIndex(0)}
              disabled={currentPage === 1}
            >
              {"<<"}
              <span className="sr-only">First page</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {"<"}
              <span className="sr-only">Previous page</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              {">"}
              <span className="sr-only">Next page</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.setPageIndex(totalPages - 1)}
              disabled={currentPage === totalPages}
            >
              {">>"}
              <span className="sr-only">Last page</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
