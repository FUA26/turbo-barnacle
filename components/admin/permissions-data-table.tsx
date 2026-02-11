"use client";

/**
 * Permissions Data Table Component
 *
 * Advanced data table for displaying and managing permissions
 * with sorting, filtering, and pagination
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Add01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  Delete01Icon,
  Edit01Icon,
  MoreVerticalIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { toast } from "sonner";
import { PermissionDialog } from "./permission-dialog";

interface PermissionRecord {
  id: string;
  name: string;
  category: string;
  description: string | null;
  _count?: {
    rolePermissions: number;
  };
}

interface PermissionsDataTableProps {
  data: PermissionRecord[];
  onRefresh: () => void;
}

export function PermissionsDataTable({ data, onRefresh }: PermissionsDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<PermissionRecord | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [permissionToDelete, setPermissionToDelete] = useState<PermissionRecord | null>(null);

  const columns: ColumnDef<PermissionRecord>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            Name
            <HugeiconsIcon
              icon={column.getIsSorted() === "asc" ? ArrowUp01Icon : ArrowDown01Icon}
              className="ml-2 h-4 w-4"
            />
          </Button>
        );
      },
      cell: ({ row }) => (
        <code className="text-sm bg-muted px-2 py-1 rounded font-mono">{row.getValue("name")}</code>
      ),
    },
    {
      accessorKey: "category",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            Category
            <HugeiconsIcon
              icon={column.getIsSorted() === "asc" ? ArrowUp01Icon : ArrowDown01Icon}
              className="ml-2 h-4 w-4"
            />
          </Button>
        );
      },
      cell: ({ row }) => <Badge variant="outline">{row.getValue("category")}</Badge>,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.getValue("description") || "-"}</span>
      ),
    },
    {
      accessorKey: "usage",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            Usage
            <HugeiconsIcon
              icon={column.getIsSorted() === "asc" ? ArrowUp01Icon : ArrowDown01Icon}
              className="ml-2 h-4 w-4"
            />
          </Button>
        );
      },
      cell: ({ row }) => {
        const usageCount = row.original._count?.rolePermissions || 0;
        return (
          <div className="text-center">
            <Badge variant={usageCount > 0 ? "default" : "secondary"} className="font-mono">
              {usageCount}
            </Badge>
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const permission = row.original;
        const usageCount = permission._count?.rolePermissions || 0;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <HugeiconsIcon icon={MoreVerticalIcon} className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setEditingPermission(permission);
                  setDialogOpen(true);
                }}
              >
                <HugeiconsIcon icon={Edit01Icon} className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setPermissionToDelete(permission);
                  setDeleteDialogOpen(true);
                }}
                className="text-destructive"
                disabled={usageCount > 0}
              >
                <HugeiconsIcon icon={Delete01Icon} className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  // Handle save
  const handleSave = async (data: { name: string; category: string; description?: string }) => {
    try {
      const url = editingPermission
        ? `/api/permissions/${editingPermission.id}`
        : "/api/permissions";
      const method = editingPermission ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save permission");
      }

      toast.success(
        editingPermission ? "Permission updated successfully" : "Permission created successfully"
      );
      setDialogOpen(false);
      setEditingPermission(null);
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to save permission");
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!permissionToDelete) return;

    try {
      const response = await fetch(`/api/permissions/${permissionToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete permission");
      }

      toast.success("Permission deleted successfully");
      setDeleteDialogOpen(false);
      setPermissionToDelete(null);
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete permission");
    }
  };

  return (
    <>
      {/* Header with search and create button */}
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Filter permissions..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => setCreateDialogOpen(true)}>
          <HugeiconsIcon icon={Add01Icon} className="mr-2 h-4 w-4" />
          Create Permission
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
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
                  No permissions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <PermissionDialog
        open={createDialogOpen || dialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          setDialogOpen(open);
          if (!open) setEditingPermission(null);
        }}
        permission={editingPermission}
        onSave={handleSave}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Permission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the permission{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded">{permissionToDelete?.name}</code>?
              This action cannot be undone.
              {permissionToDelete && (permissionToDelete._count?.rolePermissions || 0) > 0 && (
                <span className="block mt-2 text-destructive">
                  This permission is assigned to {permissionToDelete._count?.rolePermissions}{" "}
                  role(s) and cannot be deleted. Remove it from roles first.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={
                permissionToDelete ? (permissionToDelete._count?.rolePermissions || 0) > 0 : false
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
