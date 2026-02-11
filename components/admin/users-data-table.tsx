"use client";

/**
 * Users Data Table Component
 *
 * Enhanced table with bulk selection, actions dropdown, and pagination
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCan } from "@/lib/rbac-client/hooks";
import { Delete01Icon, Edit01Icon, MoreVerticalIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { BulkActionsDialog } from "./bulk-actions-dialog";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { UserDialog } from "./user-dialog";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: { id: string; name: string };
  createdAt: Date;
}

interface UsersDataTableProps {
  users: User[];
  onRefresh?: () => void;
}

export function UsersDataTable({ users, onRefresh }: UsersDataTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editDialog, setEditDialog] = useState<{ open: boolean; userId: string }>({
    open: false,
    userId: "",
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; userId: string }>({
    open: false,
    userId: "",
  });
  const [bulkDialog, setBulkDialog] = useState(false);

  const canUpdateAny = useCan(["USER_UPDATE_ANY"]);
  const canDeleteAny = useCan(["USER_DELETE_ANY"]);

  function handleSelectAll(checked: boolean) {
    setSelectedIds(checked ? users.map((u) => u.id) : []);
  }

  function handleSelectOne(userId: string, checked: boolean) {
    setSelectedIds((prev) => (checked ? [...prev, userId] : prev.filter((id) => id !== userId)));
  }

  const isAllSelected = users.length > 0 && selectedIds.length === users.length;
  const isSomeSelected = selectedIds.length > 0 && selectedIds.length < users.length;

  return (
    <>
      <div className="rounded-lg border">
        {/* Bulk Actions Toolbar */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between border-b p-4 bg-muted/50">
            <span className="text-sm font-medium">
              {selectedIds.length} user{selectedIds.length > 1 ? "s" : ""} selected
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setSelectedIds([])}>
                Clear Selection
              </Button>
              <Button size="sm" onClick={() => setBulkDialog(true)}>
                Bulk Actions
              </Button>
            </div>
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all users"
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(user.id)}
                    onCheckedChange={(checked) => handleSelectOne(user.id, checked as boolean)}
                    aria-label={`Select ${user.name || user.email}`}
                  />
                </TableCell>
                <TableCell>{user.name || "—"}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant="outline">{user.role.name}</Badge>
                </TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Actions">
                        <HugeiconsIcon icon={MoreVerticalIcon} className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {canUpdateAny && (
                        <DropdownMenuItem
                          onClick={() => setEditDialog({ open: true, userId: user.id })}
                        >
                          <HugeiconsIcon icon={Edit01Icon} className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {canDeleteAny && (
                        <DropdownMenuItem
                          onClick={() => setDeleteDialog({ open: true, userId: user.id })}
                          className="text-destructive focus:text-destructive"
                        >
                          <HugeiconsIcon icon={Delete01Icon} className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {users.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">No users found</p>
            <p className="text-sm text-muted-foreground">Create your first user to get started</p>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <UserDialog
        open={editDialog.open}
        onOpenChange={(open) => setEditDialog({ open, userId: "" })}
        mode="edit"
        userId={editDialog.userId}
        onSuccess={onRefresh}
      />

      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, userId: "" })}
        userId={deleteDialog.userId}
        userName={users.find((u) => u.id === deleteDialog.userId)?.name || ""}
        onSuccess={onRefresh}
      />

      <BulkActionsDialog
        open={bulkDialog}
        onOpenChange={setBulkDialog}
        userIds={selectedIds}
        onSuccess={() => {
          setSelectedIds([]);
          onRefresh?.();
        }}
      />
    </>
  );
}
