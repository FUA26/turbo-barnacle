import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  roleId: z.string().min(1, "Role is required"),
});

export const updateUserSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    roleId: z.string().min(1, "Role is required"),
  })
  .partial();

export const bulkUpdateUsersSchema = z.object({
  userIds: z.array(z.string()).min(1, "Select at least one user"),
  action: z.enum(["changeRole", "delete"]),
  roleId: z.string().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type BulkUpdateUsersInput = z.infer<typeof bulkUpdateUsersSchema>;
