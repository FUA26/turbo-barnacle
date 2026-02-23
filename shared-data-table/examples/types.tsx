/**
 * Common Types for Data Table Examples
 *
 * Tipe data yang umum digunakan dalam contoh-contoh DataTable.
 */

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../components/data-table";

// ==================== Base Types ====================

/**
 * Tipe dasar untuk user
 */
export type User = {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive" | "suspended" | "on-leave";
  role?: string;
  department?: string;
  joinedAt?: Date | string;
  lastLogin?: Date | string;
  avatar?: string;
};

/**
 * Tipe untuk transaksi
 */
export type Transaction = {
  id: string;
  description: string;
  amount: number;
  status: "pending" | "completed" | "failed" | "refunded";
  date: Date | string;
  category?: string;
};

/**
 * Tipe untuk product
 */
export type Product = {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  status: "in-stock" | "low-stock" | "out-of-stock" | "discontinued";
};

// ==================== Filter Option Type ====================

/**
 * Opsi filter untuk DataTableFacetedFilter
 */
export interface FacetedFilterOption {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}

// ==================== Column Helpers ====================

/**
 * Helper untuk membuat kolom dengan sortable header
 */
export function createSortableColumn<TData, TValue>(
  accessorKey: string,
  title: string
): ColumnDef<TData, TValue> {
  return {
    accessorKey: accessorKey as keyof TData,
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title={title} />;
    },
  };
}

/**
 * Helper untuk format currency IDR
 */
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Helper untuk format tanggal Indonesia
 */
export function formatDateID(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Helper untuk format tanggal lengkap Indonesia
 */
export function formatFullDateID(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
