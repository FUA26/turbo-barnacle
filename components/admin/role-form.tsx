"use client";

/**
 * Role Form Component
 *
 * Form for creating and editing roles with permission selection
 */

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Permission } from "@/lib/rbac/types";
import type { CreateRoleInput, UpdateRoleInput } from "@/lib/validations/role";
import { createRoleSchema, updateRoleSchema } from "@/lib/validations/role";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { PermissionMatrix } from "./permission-matrix";

interface RoleFormProps {
  mode: "create" | "edit" | "clone";
  initialData?: {
    name?: string;
    description?: string;
    permissions?: Permission[];
  };
  onSubmit: (data: CreateRoleInput | UpdateRoleInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function RoleForm({ mode, initialData, onSubmit, onCancel, isLoading }: RoleFormProps) {
  const schema = mode === "clone" ? createRoleSchema : updateRoleSchema;

  const form = useForm<CreateRoleInput | UpdateRoleInput>({
    resolver: zodResolver(schema),
    defaultValues: initialData || {
      name: "",
      description: "",
      permissions: [],
    },
  });

  // Reset form values when initialData changes (important for edit mode)
  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  const selectedPermissions = (form.watch("permissions") || []) as Permission[];

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Field>
        <FieldLabel htmlFor="name">Role Name</FieldLabel>
        <FieldContent>
          <Input
            id="name"
            placeholder="CONTENT_MANAGER"
            {...form.register("name")}
            disabled={isLoading}
          />
        </FieldContent>
        <FieldDescription>
          Use uppercase letters and underscores only (e.g., CONTENT_MANAGER)
        </FieldDescription>
        <FieldError
          errors={form.formState.errors.name ? [form.formState.errors.name] : undefined}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="description">Description</FieldLabel>
        <FieldContent>
          <Textarea
            id="description"
            placeholder="Brief description of this role..."
            {...form.register("description")}
            disabled={isLoading}
          />
        </FieldContent>
        <FieldError
          errors={
            form.formState.errors.description ? [form.formState.errors.description] : undefined
          }
        />
      </Field>

      <Field>
        <FieldLabel>Permissions</FieldLabel>
        <FieldContent>
          <PermissionMatrix
            selectedPermissions={selectedPermissions}
            onChange={(permissions) => form.setValue("permissions", permissions as any)}
            disabled={isLoading}
          />
        </FieldContent>
        <FieldError
          errors={
            form.formState.errors.permissions ? [form.formState.errors.permissions] : undefined
          }
        />
      </Field>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || selectedPermissions.length === 0}>
          {isLoading
            ? "Saving..."
            : mode === "create"
              ? "Create Role"
              : mode === "clone"
                ? "Clone Role"
                : "Update Role"}
        </Button>
      </div>
    </form>
  );
}
