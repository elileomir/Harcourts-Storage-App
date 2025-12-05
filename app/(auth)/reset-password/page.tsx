"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
import Image from "next/image";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validSession, setValidSession] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Check if user has a valid session from the reset link
    const checkSession = async () => {
      console.log("[ResetPassword] Checking for session...");

      // First, check if this is a recovery with hash tokens (PKCE flow)
      const hash = window.location.hash;
      if (hash.includes("access_token")) {
        console.log(
          "[ResetPassword] Found hash tokens, setting session from URL..."
        );
        const hashParams = new URLSearchParams(hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error(
              "[ResetPassword] Error setting session from hash:",
              error
            );
            // Check if session exists anyway (cookies might have been set)
            const {
              data: { session },
            } = await supabase.auth.getSession();
            if (session) {
              console.log("[ResetPassword] Session exists despite error");
              setValidSession(true);
              return;
            } else {
              setError(
                "Invalid or expired reset link. Please request a new password reset."
              );
              setTimeout(() => router.push("/forgot-password"), 3000);
              return;
            }
          } else {
            console.log("[ResetPassword] Session established from hash tokens");
            setValidSession(true);
            return;
          }
        }
      }

      // No hash tokens, check for existing session (from server-side callback)
      // Retry logic: wait for session to be available (callback sets it server-side)
      let session = null;
      let retries = 3;

      while (retries > 0 && !session) {
        const { data } = await supabase.auth.getSession();
        session = data.session;

        if (!session) {
          console.log(
            `[ResetPassword] No session yet, retrying... (${retries} attempts left)`
          );
          await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 500ms
          retries--;
        } else {
          console.log("[ResetPassword] Session found!", {
            userId: session.user.id,
          });
        }
      }

      if (session) {
        console.log("[ResetPassword] Setting validSession to true");
        setValidSession(true);
      } else {
        console.error("[ResetPassword] No session found after retries");
        setError(
          "Invalid or expired reset link. Please request a new password reset."
        );
        setTimeout(() => router.push("/forgot-password"), 3000);
      }
    };

    checkSession();
  }, [router, supabase]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      console.log("[ResetPassword] Updating password...");

      // Update password - fire and forget, redirect immediately
      supabase.auth
        .updateUser({ password: password })
        .then(({ error: updateError }) => {
          if (updateError) {
            console.error(
              "[ResetPassword] Password update error:",
              updateError
            );
          }
        });

      // Redirect immediately without waiting
      console.log("[ResetPassword] Redirecting to login...");
      setTimeout(() => {
        window.location.replace("/login");
      }, 500);
    } catch (err) {
      console.error("[ResetPassword] Error in handleResetPassword:", err);
      setError(err instanceof Error ? err.message : "Failed to reset password");
      setLoading(false);
    }
  };

  if (!validSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-md space-y-8 rounded-lg bg-card p-8 shadow-md text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">
            Verifying reset link...
          </p>
        </div>
      </div>
    );
  }

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
            <CardTitle className="text-2xl">Set new password</CardTitle>
            <CardDescription>Enter your new password below</CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleResetPassword}>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-[4px] bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
                minLength={6}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                minLength={6}
                disabled={loading}
              />
            </div>
          </CardContent>
          <CardFooter className="pt-4">
            <Button
              type="submit"
              className="w-full bg-[#003366] hover:bg-[#002244]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
