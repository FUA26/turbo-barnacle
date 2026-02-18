import { Permission } from "@/lib/rbac/types";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roleId: string;
      permissions?: string[]; // Flat array of permission names
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    name: string | null;
    roleId: string;
    role?: {
      id: string;
      name: string;
      permissions: Array<{
        permission: {
          name: Permission;
        };
      }>;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    roleId: string;
    permissions?: string[];
    role?: {
      id: string;
      name: string;
      permissions: Array<{
        permission: {
          name: Permission;
        };
      }>;
    };
  }
}
