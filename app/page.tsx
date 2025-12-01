"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [checking, setChecking] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        // User is authenticated, go to dashboard
        console.log("[HomePage] Authenticated, redirecting to dashboard");
        window.location.href = "/dashboard";
      } else {
        // User is not authenticated, go to login
        console.log("[HomePage] Not authenticated, redirecting to login");
        window.location.href = "/login";
      }
    };

    checkAuthAndRedirect();
  }, [supabase]);

  // Show loading spinner while checking
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
