"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

interface HeaderProps {
  user: {
    email?: string | null;
  };
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <div className="ml-auto flex items-center gap-4">
        <span className="text-sm text-muted-foreground">{user.email}</span>
        <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </header>
  );
}
