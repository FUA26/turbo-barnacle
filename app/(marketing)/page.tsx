import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="container flex flex-col items-center gap-6 py-24">
      <h1 className="text-5xl font-bold">Build Amazing Products</h1>
      <p className="text-xl text-muted-foreground max-w-2xl text-center">
        A production-ready boilerplate for Next.js with authentication, database, and beautiful UI
        components.
      </p>
      <div className="flex gap-4">
        <Button asChild size="lg">
          <Link href="/login">Get Started</Link>
        </Button>
      </div>
    </div>
  );
}
