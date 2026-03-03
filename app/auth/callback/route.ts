import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { EmailOtpType } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/** Create a Supabase server client with PKCE + reduced cookie options */
async function createCallbackClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'pkce',
      },
      cookieEncoding: 'raw',
      cookieOptions: {
        maxAge: 60 * 60, // 1 hour — reduces cookie header size
        sameSite: 'lax' as const,
        secure: process.env.NODE_ENV === 'production',
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  console.log("[Callback] Processing auth callback:", {
    type,
    hasTokenHash: !!token_hash,
    hasCode: !!code,
  });

  // Handle OAuth code exchange (for SSO providers like Azure)
  if (code) {
    const supabase = await createCallbackClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      console.log(
        "[Callback] OAuth code exchanged successfully, redirecting to:",
        next
      );
      return NextResponse.redirect(new URL(next, request.url));
    }

    console.error("[Callback] OAuth code exchange failed:", error.message);
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "oauth_failed");
    loginUrl.searchParams.set("error_description", error.message);
    return NextResponse.redirect(loginUrl);
  }

  if (token_hash && type) {
    // For invites, skip server-side verification and pass token to set-password page
    // This avoids consuming the one-time-use token before client can use it
    if (type === "invite") {
      console.log(
        "[Callback] Invite token detected, passing to set-password for client-side verification"
      );
      const setPasswordUrl = new URL("/set-password", request.url);
      setPasswordUrl.searchParams.set("token_hash", token_hash);
      setPasswordUrl.searchParams.set("type", type);
      return NextResponse.redirect(setPasswordUrl);
    }

    const supabase = await createCallbackClient();

    // Use verifyOtp for email-based auth (recovery, magic links, etc.)
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as EmailOtpType,
    });

    console.log("[Callback] OTP verification result:", {
      hasSession: !!data.session,
      hasUser: !!data.user,
      error: error?.message,
    });

    if (!error && data.session) {
      // Create response with redirect
      let redirectUrl: URL;

      // Check if this is a password reset
      if (type === "recovery") {
        console.log(
          "[Callback] Password reset verified, redirecting to reset-password"
        );
        redirectUrl = new URL("/reset-password", request.url);
      }
      // Regular auth flow (e.g., magic link, email confirmation)
      else {
        console.log("[Callback] Auth verified, redirecting to:", next);
        redirectUrl = new URL(next, request.url);
      }

      // Return redirect response - cookies are already set by createServerClient
      return NextResponse.redirect(redirectUrl);
    }

    // If verification failed
    console.error("[Callback] OTP verification failed:", error?.message);

    if (type === "recovery") {
      const resetPasswordUrl = new URL("/reset-password", request.url);
      resetPasswordUrl.searchParams.set("error", "verification_failed");
      resetPasswordUrl.searchParams.set(
        "error_description",
        error?.message || "Invalid or expired reset link"
      );
      return NextResponse.redirect(resetPasswordUrl);
    }
  }

  // Default: check if user is authenticated
  const supabase = await createCallbackClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log(
    "[Callback] No token_hash or verification failed, checking user:",
    { hasUser: !!user, type }
  );

  if (user) {
    if (type === "invite") {
      console.log(
        "[Callback] User already authenticated with invite type, redirecting to set-password"
      );
      return NextResponse.redirect(new URL("/set-password", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // No valid session, redirect to login
  const loginUrl = new URL("/login", request.url);
  if (type) {
    loginUrl.searchParams.set("type", type);
  }
  console.log("[Callback] No user, redirecting to login");
  return NextResponse.redirect(loginUrl);
}
