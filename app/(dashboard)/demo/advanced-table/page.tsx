/**
 * Advanced Data Table Demo Page
 *
 * Demonstration of the new advanced data table features
 */

import { AdvancedDataTable } from "@/components/admin/data-table/advanced-data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy01Icon, Delete01Icon, Edit01Icon, MoreVerticalIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ColumnDef } from "@tanstack/react-table";

// Mock data for demonstration
interface Role {
  id: string;
  name: string;
  permissions: string[];
  users: number;
  createdAt: string;
}

const mockRoles: Role[] = [
  {
    id: "1",
    name: "Administrator",
    permissions: ["USER_READ_ANY", "USER_UPDATE_ANY", "USER_DELETE_ANY", "ROLE_MANAGE"],
    users: 3,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Editor",
    permissions: ["POST_CREATE", "POST_UPDATE_OWN", "POST_DELETE_OWN"],
    users: 12,
    createdAt: "2024-01-20",
  },
  {
    id: "3",
    name: "Viewer",
    permissions: ["POST_READ_ANY"],
    users: 45,
    createdAt: "2024-02-01",
  },
  {
    id: "4",
    name: "Moderator",
    permissions: ["POST_READ_ANY", "POST_UPDATE_ANY", "COMMENT_DELETE_ANY"],
    users: 8,
    createdAt: "2024-02-10",
  },
  {
    id: "5",
    name: "Developer",
    permissions: ["API_ACCESS", "DEBUG_MODE"],
    users: 5,
    createdAt: "2024-02-15",
  },
  {
    id: "6",
    name: "Content Manager",
    permissions: ["POST_CREATE", "POST_UPDATE_ANY", "MEDIA_UPLOAD"],
    users: 7,
    createdAt: "2024-02-18",
  },
  {
    id: "7",
    name: "Support Agent",
    permissions: ["USER_READ_ANY", "TICKET_CREATE", "TICKET_UPDATE_OWN"],
    users: 15,
    createdAt: "2024-02-20",
  },
  {
    id: "8",
    name: "Billing Manager",
    permissions: ["INVOICE_READ_ANY", "INVOICE_CREATE", "PAYMENT_PROCESS"],
    users: 2,
    createdAt: "2024-02-22",
  },
  {
    id: "9",
    name: "Analyst",
    permissions: ["ANALYTICS_VIEW", "REPORT_EXPORT"],
    users: 6,
    createdAt: "2024-02-25",
  },
  {
    id: "10",
    name: "Guest",
    permissions: ["POST_READ_ANY"],
    users: 120,
    createdAt: "2024-02-28",
  },
  {
    id: "11",
    name: "Contributor",
    permissions: ["POST_CREATE", "POST_UPDATE_OWN"],
    users: 25,
    createdAt: "2024-03-01",
  },
  {
    id: "12",
    name: "Premium User",
    permissions: ["POST_CREATE", "POST_UPDATE_OWN", "MEDIA_UPLOAD"],
    users: 18,
    createdAt: "2024-03-05",
  },
];

// Column definitions
const columns: ColumnDef<Role>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Role Name",
    cell: ({ row }) => <Badge variant="outline">{row.getValue("name")}</Badge>,
  },
  {
    accessorKey: "permissions",
    header: "Permissions",
    cell: ({ row }) => {
      const permissions = row.original.permissions || [];
      return (
        <div className="flex flex-wrap gap-1">
          {permissions.slice(0, 2).map((permission) => (
            <Badge key={permission} variant="secondary" className="text-xs">
              {permission}
            </Badge>
          ))}
          {permissions.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{permissions.length - 2} more
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "users",
    header: "Users",
    cell: ({ row }) => {
      const userCount = row.original.users || 0;
      return (
        <div className="text-center">
          <Badge variant={userCount > 10 ? "default" : "secondary"} className="font-mono">
            {userCount}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <span className="text-sm">{date.toLocaleDateString()}</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const role = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Actions">
              <HugeiconsIcon icon={MoreVerticalIcon} className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <HugeiconsIcon icon={Edit01Icon} className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem>
              <HugeiconsIcon icon={Copy01Icon} className="mr-2 h-4 w-4" />
              Clone
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" disabled={role.users > 0}>
              <HugeiconsIcon icon={Delete01Icon} className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function AdvancedTableDemoPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Advanced Data Table Demo</h1>
        <p className="text-muted-foreground">
          Demonstrating URL state management, keyboard shortcuts, and advanced filtering
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4 space-y-2">
          <h3 className="font-semibold">🔗 URL State</h3>
          <p className="text-sm text-muted-foreground">
            Try sorting, filtering, or paging - the URL updates automatically. Bookmark or share the
            URL to preserve table state.
          </p>
          <Badge variant="outline" className="text-xs">
            nuqs powered
          </Badge>
        </div>

        <div className="rounded-lg border p-4 space-y-2">
          <h3 className="font-semibold">⌨️ Keyboard Shortcuts</h3>
          <p className="text-sm text-muted-foreground">
            <strong>Ctrl+Shift+F</strong> to focus search
            <br />
            <strong>Ctrl+Shift+D</strong> to clear filters
          </p>
        </div>

        <div className="rounded-lg border p-4 space-y-2">
          <h3 className="font-semibold">🎯 Advanced Features</h3>
          <p className="text-sm text-muted-foreground">
            Multi-column sorting (click headers), column visibility toggle, row selection with bulk
            actions.
          </p>
        </div>
      </div>

      {/* The Advanced Table */}
      <div className="rounded-lg border p-6 bg-card">
        <h2 className="text-xl font-semibold mb-4">Roles Table</h2>
        <AdvancedDataTable
          data={mockRoles}
          columns={columns}
          searchPlaceholder="Search roles..."
          searchableColumns={["name"]}
        />
      </div>

      {/* Current URL Display */}
      <div className="rounded-lg border p-4 bg-muted/50">
        <h3 className="font-semibold text-sm mb-2">Current URL State:</h3>
        <code className="text-xs break-all block">
          {typeof window !== "undefined" ? window.location.search : ""}
        </code>
      </div>
    </div>
  );
}
