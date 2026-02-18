import { DefaultSession } from "next-auth";
import { Permission } from "@/lib/rbac/types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roleId: string;
      permissions?: Permission[];
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
