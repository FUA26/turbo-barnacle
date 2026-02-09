import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <nav className="flex items-center justify-between border-b p-4">
        <h1 className="text-xl font-bold">Naiera</h1>
        <div className="flex gap-4">
          <Button variant="ghost" asChild>
            <Link href="/features">Features</Link>
          </Button>
          <Button asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </nav>
      {children}
    </div>
  );
}
