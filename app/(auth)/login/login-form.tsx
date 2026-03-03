"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);
  const searchParams = useSearchParams();

  // Check for error in URL params (e.g., from SSO access denial)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Helper to get param from either searchParams or hash
    const getParam = (name: string) => {
      // 1. Try searchParams (query string)
      const queryVal = searchParams.get(name);
      if (queryVal) return queryVal;

      // 2. Try hash parameters
      if (typeof window !== "undefined" && window.location.hash) {
        const hash = window.location.hash.substring(1); // remove '#'
        const params = new URLSearchParams(hash);
        return params.get(name);
      }
      return null;
    };

    const urlError = getParam("error");
    const urlErrorCode = getParam("error_code");
    const urlErrorDescription = getParam("error_description");

    if (urlError && urlErrorDescription) {
      // Handle "Signups not allowed" specifically
      if (
        urlErrorCode === "signup_disabled" ||
        urlErrorDescription.includes("Signups not allowed")
      ) {
        setError(
          "Access denied: You must be invited to access this application. Please contact an administrator."
        );
      } else {
        setError(decodeURIComponent(urlErrorDescription));
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      }
    } catch {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="relative h-12 w-48">
              <Image
                src="/harcourts-logo.svg"
                alt="Harcourts"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>
              Enter your credentials to access the dashboard
            </CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-[4px] bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@harcourts.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-4">
            <Button
              type="submit"
              className="w-full bg-[#003366] hover:bg-[#002244]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Microsoft SSO Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                setError(null);
                const { error } = await supabase.auth.signInWithOAuth({
                  provider: "azure",
                  options: {
                    scopes: "email",
                    redirectTo: `${window.location.origin}/auth/callback`,
                  },
                });
                if (error) {
                  setError(error.message);
                  setLoading(false);
                }
              }}
            >
              <svg
                className="mr-2 h-4 w-4"
                viewBox="0 0 21 21"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
              </svg>
              Sign in with Microsoft
            </Button>

            <div className="text-center">
              <Link
                href="/forgot-password"
                className="text-sm text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
