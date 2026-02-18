"use client";

/**
 * Profile Client Component
 *
 * Client component that displays profile and password forms
 * Uses tabs to separate profile editing from password changing
 */

import { SimpleAvatarUpload } from "@/components/profile/avatar-upload-simple";
import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LockPasswordIcon, UserCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";

interface ProfileClientProps {
  user: {
    id: string;
    name?: string | null;
    email: string;
    bio?: string | null;
    role: {
      id: string;
      name: string;
    };
    createdAt: Date;
    updatedAt: Date;
    avatarId: string | null; // NEW
    avatarUrl: string | null; // NEW (proxy URL)
  };
}

export function ProfileClient({ user }: ProfileClientProps) {
  const router = useRouter();

  const handleProfileUpdateSuccess = () => {
    // Refresh the page to get updated data
    router.refresh();
  };

  // _file parameter is required by SimpleAvatarUpload interface but not used
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAvatarSelect = async (fileId: string, url: string, _file: File) => {
    try {
      const response = await fetch(`/api/users/${user.id}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          avatarId: fileId,
          avatarUrl: url, // Proxy URL
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Failed to update avatar:", error);
        // TODO: Show toast notification to user
        return;
      }

      handleProfileUpdateSuccess();
    } catch (error) {
      console.error("Error updating avatar:", error);
      // TODO: Show toast notification to user
    }
  };

  const handleAvatarRemove = async () => {
    try {
      const response = await fetch(`/api/users/${user.id}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          avatarId: "",
          avatarUrl: "",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Failed to remove avatar:", error);
        // TODO: Show toast notification to user
        return;
      }

      handleProfileUpdateSuccess();
    } catch (error) {
      console.error("Error removing avatar:", error);
      // TODO: Show toast notification to user
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      {/* Tabs for Profile and Password */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="profile" className="gap-2">
            <HugeiconsIcon icon={UserCircleIcon} className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="password" className="gap-2">
            <HugeiconsIcon icon={LockPasswordIcon} className="h-4 w-4" />
            Password
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Upload a photo to personalize your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleAvatarUpload
                currentAvatarUrl={user.avatarUrl ?? undefined}
                userName={user.name}
                onAvatarSelect={handleAvatarSelect}
                onAvatarRemove={handleAvatarRemove}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Password Tab */}
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure. Make sure to use a strong
                password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChangePasswordForm userId={user.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Account Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Details about your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Account ID</span>
            <code className="rounded bg-muted px-2 py-1 text-xs">{user.id}</code>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Role</span>
            <span className="text-sm font-medium">{user.role.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Member Since</span>
            <span className="text-sm">
              {new Date(user.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Last Updated</span>
            <span className="text-sm">
              {new Date(user.updatedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
