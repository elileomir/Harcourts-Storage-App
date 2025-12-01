"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error("Error signing out:", e);
      // Force redirect even if API fails
      window.location.href = "/login";
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
        <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-500" />
      </div>

      <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground">
        Something went wrong
      </h2>

      <p className="mb-8 max-w-md text-muted-foreground">
        We encountered an unexpected error. This might be a temporary connection
        issue or a glitch in the system.
      </p>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Button onClick={() => reset()} variant="default" size="lg">
          Try Again
        </Button>

        <Button onClick={handleSignOut} variant="outline" size="lg">
          Sign Out & Reset
        </Button>
      </div>

      {process.env.NODE_ENV === "development" && (
        <div className="mt-12 w-full max-w-2xl overflow-hidden rounded-lg border bg-muted/50 p-4 text-left font-mono text-sm">
          <p className="font-bold text-red-500">{error.message}</p>
          {error.digest && (
            <p className="mt-2 text-xs text-muted-foreground">
              Digest: {error.digest}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
