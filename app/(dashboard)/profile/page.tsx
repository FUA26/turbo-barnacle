/**
 * Profile Page (Server Component)
 *
 * Displays user's profile information and allows editing
 * Only accessible to authenticated users
 */

import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { ProfileClient } from "./profile-client";

export default async function ProfilePage() {
  // Check authentication
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch current user's profile
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      bio: true,
      role: {
        select: {
          id: true,
          name: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return <ProfileClient user={user} />;
}
