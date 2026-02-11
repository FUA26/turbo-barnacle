"use client";

/**
 * Roles Data Table Component
 *
 * Table for managing roles with edit, delete, and clone actions
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  AddCircleIcon,
  Copy01Icon,
  Delete01Icon,
  Edit01Icon,
  MoreVerticalIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { DeleteRoleConfirmDialog } from "./delete-role-confirm-dialog";
import { RoleDialog } from "./role-dialog";

interface Role {
  id: string;
  name: string;
  permissions: string[];
  _count: { users: number };
}

interface RolesDataTableProps {
  roles: Role[];
  onRefresh?: () => void;
}

export function RolesDataTable({ roles, onRefresh }: RolesDataTableProps) {
  const [editDialog, setEditDialog] = useState<{ open: boolean; roleId: string }>({
    open: false,
    roleId: "",
  });
  const [cloneDialog, setCloneDialog] = useState<{ open: boolean; roleId: string }>({
    open: false,
    roleId: "",
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; roleId: string }>({
    open: false,
    roleId: "",
  });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const canManageRoles = useCan(["ADMIN_ROLES_MANAGE"]);

  return (
    <>
      <div className="rounded-lg border">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="font-semibold">Roles ({roles.length})</h2>
          {canManageRoles && (
            <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
              <HugeiconsIcon icon={AddCircleIcon} className="mr-2 h-4 w-4" />
              Add Role
            </Button>
          )}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role Name</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Users</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>
                  <Badge variant="outline">{role.name}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {(role.permissions || []).slice(0, 3).map((permission) => (
                      <Badge key={permission} variant="secondary" className="text-xs">
                        {permission}
                      </Badge>
                    ))}
                    {(role.permissions || []).length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{(role.permissions || []).length - 3} more
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{role._count.users}</span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Actions">
                        <HugeiconsIcon icon={MoreVerticalIcon} className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {canManageRoles && (
                        <>
                          <DropdownMenuItem
                            onClick={() => setEditDialog({ open: true, roleId: role.id })}
                          >
                            <HugeiconsIcon icon={Edit01Icon} className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setCloneDialog({ open: true, roleId: role.id })}
                          >
                            <HugeiconsIcon icon={Copy01Icon} className="mr-2 h-4 w-4" />
                            Clone
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteDialog({ open: true, roleId: role.id })}
                            className="text-destructive focus:text-destructive"
                            disabled={role._count.users > 0}
                          >
                            <HugeiconsIcon icon={Delete01Icon} className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {roles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">No roles found</p>
            <p className="text-sm text-muted-foreground">Create your first role to get started</p>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <RoleDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        mode="create"
        onSuccess={onRefresh}
      />

      <RoleDialog
        open={editDialog.open}
        onOpenChange={(open) => setEditDialog({ open, roleId: "" })}
        mode="edit"
        roleId={editDialog.roleId}
        onSuccess={onRefresh}
      />

      <RoleDialog
        open={cloneDialog.open}
        onOpenChange={(open) => setCloneDialog({ open, roleId: "" })}
        mode="clone"
        roleId={cloneDialog.roleId}
        onSuccess={onRefresh}
      />

      <DeleteRoleConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, roleId: "" })}
        roleId={deleteDialog.roleId}
        roleName={roles.find((r) => r.id === deleteDialog.roleId)?.name || ""}
        userCount={roles.find((r) => r.id === deleteDialog.roleId)?._count.users || 0}
        onSuccess={onRefresh}
      />
    </>
  );
}
