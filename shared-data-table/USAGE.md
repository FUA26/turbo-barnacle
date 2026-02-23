# Contoh Penggunaan Shared Data Table

## Basic Table

Contoh penggunaan dasar DataTable dengan data sederhana:

```typescript
"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";

// Tipe data
type User = {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive";
};

// Kolom definition
const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
];

// Data sample
const data: User[] = [
  { id: "1", name: "John Doe", email: "john@example.com", status: "active" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", status: "inactive" },
];

export default function BasicTable() {
  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
```

## Table dengan Sorting Column Header

Menggunakan `DataTableColumnHeader` untuk header dengan sorting:

```typescript
"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { DataTableColumnHeader } from "@/components/data-table";

type User = {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive";
};

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
  },
];

export default function SortableTable() {
  const data: User[] = [
    { id: "1", name: "John Doe", email: "john@example.com", status: "active" },
    { id: "2", name: "Jane Smith", email: "jane@example.com", status: "inactive" },
  ];

  return <DataTable columns={columns} data={data} />;
}
```

## Table dengan Toolbar (Filter & View Options)

```typescript
"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { DataTableColumnHeader } from "@/components/data-table";
import { DataTableFacetedFilter, type FacetedFilterOption } from "@/components/data-table";
import { DataTableViewOptions } from "@/components/data-table";
import { Input } from "@/components/ui/input";
import { IconSearch } from "@tabler/icons-react";

type User = {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive";
  role: "admin" | "user" | "guest";
};

const statusOptions: FacetedFilterOption[] = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const roleOptions: FacetedFilterOption[] = [
  { label: "Admin", value: "admin" },
  { label: "User", value: "user" },
  { label: "Guest", value: "guest" },
];

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => <span>{row.getValue("name")}</span>,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
  },
];

export default function FilterableTable() {
  const [data] = React.useState<User[]>([
    { id: "1", name: "John Doe", email: "john@example.com", status: "active", role: "admin" },
    { id: "2", name: "Jane Smith", email: "jane@example.com", status: "inactive", role: "user" },
  ]);

  return (
    <DataTable
      columns={columns}
      data={data}
      toolbar={(table) => (
        <div className="flex items-center justify-between">
          <div className="flex flex-1 items-center space-x-2">
            <Input
              placeholder="Filter users..."
              value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className="h-8 w-[150px] lg:w-[250px]"
            />
            {table.getColumn("status") && (
              <DataTableFacetedFilter
                column={table.getColumn("status")}
                title="Status"
                options={statusOptions}
              />
            )}
            {table.getColumn("role") && (
              <DataTableFacetedFilter
                column={table.getColumn("role")}
                title="Role"
                options={roleOptions}
              />
            )}
          </div>
          <DataTableViewOptions table={table} />
        </div>
      )}
    />
  );
}
```

## Table dengan Date Filter

```typescript
"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { DataTableColumnHeader } from "@/components/data-table";
import { DataTableDateFilter } from "@/components/data-table";

type Transaction = {
  id: string;
  description: string;
  amount: number;
  date: Date;
};

const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(amount);
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"));
      return date.toLocaleDateString("id-ID");
    },
  },
];

export default function DateFilterTable() {
  const data: Transaction[] = [
    { id: "1", description: "Payment", amount: 100000, date: new Date("2024-01-15") },
    { id: "2", description: "Refund", amount: -50000, date: new Date("2024-01-20") },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      toolbar={(table) => (
        <div className="flex items-center space-x-2">
          {table.getColumn("date") && (
            <DataTableDateFilter
              column={table.getColumn("date")}
              title="Tanggal"
            />
          )}
        </div>
      )}
    />
  );
}
```

## Table dengan Row Selection dan Action Bar

```typescript
"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { DataTableColumnHeader } from "@/components/data-table";
import { DataTableActionBar } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { IconTrash } from "@tabler/icons-react";

type User = {
  id: string;
  name: string;
  email: string;
};

const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllPageRowsSelected()}
        onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={(e) => row.toggleSelected(!!e.target.checked)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
  },
];

export default function SelectableTable() {
  const [data, setData] = React.useState<User[]>([
    { id: "1", name: "John Doe", email: "john@example.com" },
    { id: "2", name: "Jane Smith", email: "jane@example.com" },
    { id: "3", name: "Bob Johnson", email: "bob@example.com" },
  ]);

  const handleDeleteSelected = (selectedUsers: User[], resetSelection: () => void) => {
    const selectedIds = selectedUsers.map((u) => u.id);
    setData((prev) => prev.filter((u) => !selectedIds.includes(u.id)));
    resetSelection();
  };

  return (
    <DataTable
      columns={columns}
      data={data}
      enableRowSelection
      actionBar={(table) => (
        <DataTableActionBar table={table}>
          {(selectedRows, resetSelection) => (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteSelected(selectedRows, resetSelection)}
            >
              <IconTrash className="mr-2 h-4 w-4" />
              Delete {selectedRows.length}
            </Button>
          )}
        </DataTableActionBar>
      )}
    />
  );
}
```

## Complete Example dengan Semua Fitur

```typescript
"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable, type DensityState } from "@/components/data-table";
import { DataTableColumnHeader } from "@/components/data-table";
import { DataTableFacetedFilter, type FacetedFilterOption } from "@/components/data-table";
import { DataTableDateFilter } from "@/components/data-table";
import { DataTableViewOptions } from "@/components/data-table";
import { DataTableActionBar } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { IconSearch, IconTrash, IconDownload } from "@tabler/icons-react";

type User = {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive" | "suspended";
  role: "admin" | "editor" | "viewer";
  createdAt: Date;
};

const statusOptions: FacetedFilterOption[] = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Suspended", value: "suspended" },
];

const roleOptions: FacetedFilterOption[] = [
  { label: "Admin", value: "admin" },
  { label: "Editor", value: "editor" },
  { label: "Viewer", value: "viewer" },
];

const columns: ColumnDef<User>[] = [
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
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return (
        <Badge variant="outline" className="capitalize">
          {role}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variant = {
        active: "default",
        inactive: "secondary",
        suspended: "destructive",
      }[status] as "default" | "secondary" | "destructive";
      return (
        <Badge variant={variant} className="capitalize">
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return date.toLocaleDateString("id-ID");
    },
  },
];

export default function CompleteTable() {
  const [data] = React.useState<User[]>([
    { id: "1", name: "John Doe", email: "john@example.com", status: "active", role: "admin", createdAt: new Date("2024-01-15") },
    { id: "2", name: "Jane Smith", email: "jane@example.com", status: "inactive", role: "editor", createdAt: new Date("2024-02-20") },
    { id: "3", name: "Bob Wilson", email: "bob@example.com", status: "active", role: "viewer", createdAt: new Date("2024-03-10") },
    { id: "4", name: "Alice Brown", email: "alice@example.com", status: "suspended", role: "editor", createdAt: new Date("2024-01-05") },
    { id: "5", name: "Charlie Davis", email: "charlie@example.com", status: "active", role: "viewer", createdAt: new Date("2024-03-25") },
  ]);

  return (
    <div className="container mx-auto py-10">
      <DataTable
        columns={columns}
        data={data}
        enableRowSelection
        defaultDensity="medium"
        toolbar={(table, density, onDensityChange) => (
          <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
              <Input
                placeholder="Filter users..."
                value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn("name")?.setFilterValue(event.target.value)
                }
                className="h-8 w-[150px] lg:w-[250px]"
              />
              <IconSearch className="text-muted-foreground h-4 w-4" />
              {table.getColumn("status") && (
                <DataTableFacetedFilter
                  column={table.getColumn("status")}
                  title="Status"
                  options={statusOptions}
                />
              )}
              {table.getColumn("role") && (
                <DataTableFacetedFilter
                  column={table.getColumn("role")}
                  title="Role"
                  options={roleOptions}
                />
              )}
              {table.getColumn("createdAt") && (
                <DataTableDateFilter
                  column={table.getColumn("createdAt")}
                  title="Created Date"
                />
              )}
            </div>
            <div className="flex items-center space-x-2">
              <DataTableViewOptions table={table} />
            </div>
          </div>
        )}
        actionBar={(table) => (
          <DataTableActionBar table={table}>
            {(selectedRows, resetSelection) => (
              <>
                <Button variant="outline" size="sm">
                  <IconDownload className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button variant="destructive" size="sm">
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
```

## Props Reference

### DataTable

| Prop                 | Type                                             | Default     | Deskripsi                  |
| -------------------- | ------------------------------------------------ | ----------- | -------------------------- |
| `columns`            | `ColumnDef<TData, TValue>[]`                     | _required_  | Definisi kolom table       |
| `data`               | `TData[]`                                        | _required_  | Data yang akan ditampilkan |
| `toolbar`            | `(table, density, onDensityChange) => ReactNode` | `undefined` | Toolbar di atas table      |
| `actionBar`          | `(table) => ReactNode`                           | `undefined` | Action bar melayang        |
| `enableRowSelection` | `boolean`                                        | `true`      | Enable checkbox selection  |
| `enablePagination`   | `boolean`                                        | `true`      | Enable pagination          |
| `defaultDensity`     | `"short" \| "medium" \| "tall" \| "extra-tall"`  | `"medium"`  | Tinggi default baris       |

### DataTablePagination

| Prop              | Type           | Default                | Deskripsi               |
| ----------------- | -------------- | ---------------------- | ----------------------- |
| `table`           | `Table<TData>` | _required_             | Instance TanStack Table |
| `pageSizeOptions` | `number[]`     | `[10, 20, 30, 40, 50]` | Pilihan ukuran page     |

### DataTableFacetedFilter

| Prop      | Type                    | Default    | Deskripsi                |
| --------- | ----------------------- | ---------- | ------------------------ |
| `column`  | `Column<TData, TValue>` | _optional_ | Kolom yang akan difilter |
| `title`   | `string`                | `"Filter"` | Judul tombol filter      |
| `options` | `FacetedFilterOption[]` | _required_ | Pilihan filter           |

### DataTableDateFilter

| Prop     | Type                    | Default     | Deskripsi                        |
| -------- | ----------------------- | ----------- | -------------------------------- |
| `column` | `Column<TData, TValue>` | _optional_  | Kolom tanggal yang akan difilter |
| `title`  | `string`                | `"Tanggal"` | Judul tombol filter              |

### DataTableActionBar

| Prop       | Type                                          | Default    | Deskripsi               |
| ---------- | --------------------------------------------- | ---------- | ----------------------- |
| `table`    | `Table<TData>`                                | _required_ | Instance TanStack Table |
| `children` | `(selectedRows, resetSelection) => ReactNode` | _required_ | Action buttons          |
