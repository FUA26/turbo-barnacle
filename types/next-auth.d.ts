import { Permission } from "@/lib/rbac/types";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      permissions?: Permission[];
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    name: string | null;
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
