/**
 * Basic Table Example
 *
 * Contoh penggunaan DataTable sederhana tanpa fitur tambahan.
 */

"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../components/data-table";

// ==================== Tipe Data ====================
type User = {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive";
};

// ==================== Kolom Definition ====================
const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <div className="inline-flex items-center">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
            }`}
          >
            {status}
          </span>
        </div>
      );
    },
  },
];

// ==================== Sample Data ====================
const sampleData: User[] = [
  { id: "1", name: "John Doe", email: "john@example.com", status: "active" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", status: "active" },
  { id: "3", name: "Bob Johnson", email: "bob@example.com", status: "inactive" },
  { id: "4", name: "Alice Brown", email: "alice@example.com", status: "active" },
  { id: "5", name: "Charlie Davis", email: "charlie@example.com", status: "inactive" },
  { id: "6", name: "Diana Prince", email: "diana@example.com", status: "active" },
  { id: "7", name: "Eve Wilson", email: "eve@example.com", status: "inactive" },
  { id: "8", name: "Frank Miller", email: "frank@example.com", status: "active" },
];

// ==================== Komponen ====================
export default function BasicTableExample() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Basic Table Example</h1>
        <p className="text-muted-foreground">
          Contoh DataTable sederhana dengan pagination default.
        </p>
      </div>
      <DataTable columns={columns} data={sampleData} />
    </div>
  );
}
