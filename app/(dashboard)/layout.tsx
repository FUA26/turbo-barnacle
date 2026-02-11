import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { auth } from "@/lib/auth/config";
import { PermissionProvider } from "@/lib/rbac-client/provider";
import { loadUserPermissions } from "@/lib/rbac-server/loader";
import { redirect } from "next/navigation";
// Import NextAuth type extensions
import "@/lib/auth/types";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Load permissions on server-side to avoid client-side fetching
  const permissions = await loadUserPermissions(session.user.id);

  return (
    <PermissionProvider initialPermissions={permissions}>
      <DashboardLayout user={session.user}>{children}</DashboardLayout>
    </PermissionProvider>
  );
}
