/**
 * Advanced Table Example
 *
 * Contoh DataTable dengan semua fitur: sorting, filtering, date filter,
 * view options, row selection, dan action bar.
 */

"use client";

import { IconDownload, IconRefresh, IconSearch, IconTrash } from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import * as React from "react";
import {
  DataTable,
  DataTableActionBar,
  DataTableColumnHeader,
  DataTableDateFilter,
  DataTableFacetedFilter,
  DataTableViewOptions,
  type FacetedFilterOption,
} from "../components/data-table";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

// ==================== Tipe Data ====================
type User = {
  id: string;
  name: string;
  email: string;
  department: string;
  status: "active" | "inactive" | "on-leave";
  role: "admin" | "manager" | "staff" | "intern";
  joinedAt: Date;
};

// ==================== Filter Options ====================
const statusOptions: FacetedFilterOption[] = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "On Leave", value: "on-leave" },
];

const roleOptions: FacetedFilterOption[] = [
  { label: "Admin", value: "admin" },
  { label: "Manager", value: "manager" },
  { label: "Staff", value: "staff" },
  { label: "Intern", value: "intern" },
];

const departmentOptions: FacetedFilterOption[] = [
  { label: "Engineering", value: "engineering" },
  { label: "Design", value: "design" },
  { label: "Marketing", value: "marketing" },
  { label: "Sales", value: "sales" },
  { label: "HR", value: "hr" },
];

// ==================== Status Badge Helper ====================
function getStatusBadge(status: string) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    active: "default",
    inactive: "secondary",
    "on-leave": "outline",
  };

  const colors: Record<string, string> = {
    active: "bg-green-500",
    inactive: "bg-gray-500",
    "on-leave": "bg-yellow-500",
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${colors[status] || "bg-gray-500"}`} />
      <span className="capitalize">{status}</span>
    </div>
  );
}

// ==================== Kolom Definition ====================
const columns: ColumnDef<User>[] = [
  // Checkbox selection
  {
    id: "select",
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllPageRowsSelected()}
        onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={(e) => row.toggleSelected(!!e.target.checked)}
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  // Name column with sorting
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  // Email column
  {
    accessorKey: "email",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("email")}</div>,
  },
  // Department column
  {
    accessorKey: "department",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Department" />,
    cell: ({ row }) => {
      const department = row.getValue("department") as string;
      return (
        <Badge variant="outline" className="capitalize">
          {department}
        </Badge>
      );
    },
  },
  // Role column
  {
    accessorKey: "role",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return <span className="capitalize">{role}</span>;
    },
  },
  // Status column
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
        active: "default",
        inactive: "secondary",
        "on-leave": "outline",
      };
      return (
        <Badge variant={variants[status]} className="capitalize">
          {getStatusBadge(status)}
        </Badge>
      );
    },
  },
  // Joined date column
  {
    accessorKey: "joinedAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Joined" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue("joinedAt"));
      return (
        <span>
          {date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
        </span>
      );
    },
  },
];

// ==================== Sample Data ====================
const sampleData: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@company.com",
    department: "engineering",
    status: "active",
    role: "admin",
    joinedAt: new Date("2022-01-15"),
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@company.com",
    department: "design",
    status: "active",
    role: "manager",
    joinedAt: new Date("2022-03-20"),
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob.johnson@company.com",
    department: "engineering",
    status: "inactive",
    role: "staff",
    joinedAt: new Date("2023-05-10"),
  },
  {
    id: "4",
    name: "Alice Brown",
    email: "alice.brown@company.com",
    department: "marketing",
    status: "active",
    role: "staff",
    joinedAt: new Date("2023-06-01"),
  },
  {
    id: "5",
    name: "Charlie Davis",
    email: "charlie.davis@company.com",
    department: "sales",
    status: "on-leave",
    role: "staff",
    joinedAt: new Date("2022-11-15"),
  },
  {
    id: "6",
    name: "Diana Prince",
    email: "diana.prince@company.com",
    department: "hr",
    status: "active",
    role: "manager",
    joinedAt: new Date("2021-09-20"),
  },
  {
    id: "7",
    name: "Eve Wilson",
    email: "eve.wilson@company.com",
    department: "engineering",
    status: "active",
    role: "intern",
    joinedAt: new Date("2024-01-05"),
  },
  {
    id: "8",
    name: "Frank Miller",
    email: "frank.miller@company.com",
    department: "design",
    status: "active",
    role: "staff",
    joinedAt: new Date("2023-08-12"),
  },
  {
    id: "9",
    name: "Grace Lee",
    email: "grace.lee@company.com",
    department: "sales",
    status: "active",
    role: "manager",
    joinedAt: new Date("2022-04-18"),
  },
  {
    id: "10",
    name: "Henry Taylor",
    email: "henry.taylor@company.com",
    department: "engineering",
    status: "inactive",
    role: "staff",
    joinedAt: new Date("2023-02-28"),
  },
  {
    id: "11",
    name: "Ivy Chen",
    email: "ivy.chen@company.com",
    department: "marketing",
    status: "active",
    role: "staff",
    joinedAt: new Date("2023-10-15"),
  },
  {
    id: "12",
    name: "Jack White",
    email: "jack.white@company.com",
    department: "engineering",
    status: "on-leave",
    role: "staff",
    joinedAt: new Date("2021-12-05"),
  },
];

// ==================== Komponen Utama ====================
export default function AdvancedTableExample() {
  const [data, setData] = React.useState<User[]>(sampleData);

  // Handle delete selected rows
  const handleDeleteSelected = (selectedUsers: User[], resetSelection: () => void) => {
    const selectedIds = selectedUsers.map((u) => u.id);
    setData((prev) => prev.filter((u) => !selectedIds.includes(u.id)));
    resetSelection();
    console.log("Deleted users:", selectedUsers);
  };

  // Handle export
  const handleExport = (selectedUsers: User[]) => {
    console.log("Exporting users:", selectedUsers);
    // Implement export logic here
  };

  // Handle refresh
  const handleRefresh = () => {
    setData(sampleData);
  };

  return (
    <div className="container mx-auto py-10">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Advanced Table Example</h1>
          <p className="text-muted-foreground">
            DataTable dengan sorting, filtering, date filter, view options, dan row selection.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <IconRefresh className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border p-4">
          <div className="text-muted-foreground text-sm">Total Users</div>
          <div className="text-2xl font-bold">{data.length}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-muted-foreground text-sm">Active</div>
          <div className="text-2xl font-bold text-green-600">
            {data.filter((u) => u.status === "active").length}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-muted-foreground text-sm">Inactive</div>
          <div className="text-2xl font-bold text-gray-600">
            {data.filter((u) => u.status === "inactive").length}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-muted-foreground text-sm">On Leave</div>
          <div className="text-2xl font-bold text-yellow-600">
            {data.filter((u) => u.status === "on-leave").length}
          </div>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={data}
        enableRowSelection
        defaultDensity="medium"
        toolbar={(table) => (
          <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
              {/* Search Input */}
              <div className="relative">
                <IconSearch className="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                  onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
                  className="h-8 w-[200px] pl-8 lg:w-[300px]"
                />
              </div>

              {/* Status Filter */}
              {table.getColumn("status") && (
                <DataTableFacetedFilter
                  column={table.getColumn("status")}
                  title="Status"
                  options={statusOptions}
                />
              )}

              {/* Role Filter */}
              {table.getColumn("role") && (
                <DataTableFacetedFilter
                  column={table.getColumn("role")}
                  title="Role"
                  options={roleOptions}
                />
              )}

              {/* Department Filter */}
              {table.getColumn("department") && (
                <DataTableFacetedFilter
                  column={table.getColumn("department")}
                  title="Department"
                  options={departmentOptions}
                />
              )}

              {/* Date Filter */}
              {table.getColumn("joinedAt") && (
                <DataTableDateFilter column={table.getColumn("joinedAt")} title="Join Date" />
              )}
            </div>

            {/* View Options */}
            <DataTableViewOptions table={table} />
          </div>
        )}
        actionBar={(table) => (
          <DataTableActionBar table={table}>
            {(selectedRows, resetSelection) => (
              <>
                <Button variant="outline" size="sm" onClick={() => handleExport(selectedRows)}>
                  <IconDownload className="mr-2 h-4 w-4" />
                  Export {selectedRows.length}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteSelected(selectedRows, resetSelection)}
                >
                  <IconTrash className="mr-2 h-4 w-4" />
                  Delete {selectedRows.length}
                </Button>
              </>
            )}
          </DataTableActionBar>
        )}
      />
    </div>
  );
}
