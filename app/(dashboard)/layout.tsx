import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return <DashboardLayout user={session.user}>{children}</DashboardLayout>;
}
