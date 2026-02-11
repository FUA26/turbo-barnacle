import { prisma } from "@/lib/db/prisma";
import { Permission } from "@/lib/rbac/types";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: {
            role: {
              select: {
                id: true,
                name: true,
                permissions: {
                  select: {
                    permission: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(credentials.password as string, user.password);

        if (!isValid) return null;

        // Extract permission names from junction table
        const permissions = user.role?.permissions.map((rp) => rp.permission.name) as Permission[];

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          roleId: user.roleId,
          roleName: user.role?.name,
          permissions,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.roleId = user.roleId;
        token.roleName = user.roleName;
        token.permissions = user.permissions;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.roleId = token.roleId as string;
      session.user.roleName = token.roleName as string | undefined;
      session.user.permissions = token.permissions as Permission[] | undefined;
      return session;
    },
  },
});
