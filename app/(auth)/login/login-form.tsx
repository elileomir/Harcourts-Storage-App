"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Loader2, ArrowRight, AlertCircle, Clock, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ShinyText from "@/components/ShinyText";
import "@/components/ShinyText.css";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const supabase = useMemo(() => createClient(), []);
  const searchParams = useSearchParams();
  const timeoutMessage = searchParams.get("reason") === "timeout";

  // Derive SSO/signup error from URL search params (no effect needed)
  const urlParamError = useMemo(() => {
    const urlError = searchParams.get("error");
    const urlErrorCode = searchParams.get("error_code");
    const urlErrorDescription = searchParams.get("error_description");

    if (urlError && urlErrorDescription) {
      if (
        urlErrorCode === "signup_disabled" ||
        urlErrorDescription.includes("Signups not allowed")
      ) {
        return "Access denied: You must be invited to access this application. Please contact an administrator.";
      }
      return decodeURIComponent(urlErrorDescription);
    }

    // Fallback: check URL hash fragments (Supabase sometimes redirects with #error=...)
    if (typeof window !== "undefined" && window.location.hash) {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const hashError = params.get("error");
      const hashErrorDescription = params.get("error_description");
      const hashErrorCode = params.get("error_code");

      if (hashError && hashErrorDescription) {
        if (
          hashErrorCode === "signup_disabled" ||
          hashErrorDescription.includes("Signups not allowed")
        ) {
          return "Access denied: You must be invited to access this application. Please contact an administrator.";
        }
        return decodeURIComponent(hashErrorDescription);
      }
    }

    return null;
  }, [searchParams]);

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

  const handleMicrosoftLogin = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: {
        scopes: "email openid profile offline_access",
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#001F49]">
      {/* Background Pattern - Subtle geometric */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Gradient Orbs */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#00ADEF]/20 rounded-full blur-[150px] translate-x-1/4 translate-y-1/4" />
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#002d6a]/30 rounded-full blur-[120px] -translate-x-1/4 -translate-y-1/4" />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-xl mx-4"
      >
        <div className="bg-white rounded-3xl shadow-2xl p-10 sm:p-14">
          {/* Logo — Full Harcourts wordmark (same as Sales App) */}
          <div className="flex justify-center mb-10">
            <div className="relative w-52 h-12">
              <Image
                src="https://resources.cloudhi.io/images/logo/harcourts-international-logo.svg"
                alt="Harcourts"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Title with ShinyText */}
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl font-bold text-[#001F49] tracking-tight mb-3 flex items-center justify-center gap-1">
              <ShinyText
                text="PM"
                speed={3}
                color="#001F49"
                shineColor="#00ADEF"
                spread={100}
                className="font-display text-3xl font-bold"
              />
              <span> App</span>
            </h1>
            <p className="text-slate-500 text-lg">
              Your All-in-One Property Management Toolkit
            </p>
          </div>

          {/* Timeout Banner */}
          {timeoutMessage && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-100 p-3 text-sm text-amber-700 mb-6">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>
                Your session has expired due to inactivity. Please sign in
                again.
              </span>
            </div>
          )}

          {/* Error Banner */}
          {(urlParamError || error) && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-600 mb-6">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{urlParamError || error}</span>
            </div>
          )}

          {/* Primary: Microsoft SSO Button (matches Sales App exactly) */}
          <button
            type="button"
            onClick={handleMicrosoftLogin}
            disabled={loading}
            className="group w-full py-4 px-6 bg-[#001F49] hover:bg-[#002a60] text-white font-semibold rounded-xl transition-all duration-200 ease-out shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30 active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading && !showEmailLogin ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg
                className="w-5 h-5"
                viewBox="0 0 23 23"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path fill="#f35325" d="M1 1h10v10H1z" />
                <path fill="#81bc06" d="M12 1h10v10H12z" />
                <path fill="#05a6f0" d="M1 12h10v10H1z" />
                <path fill="#ffba08" d="M12 12h10v10H12z" />
              </svg>
            )}
            <span>Sign in with Microsoft</span>
            {!loading && (
              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
            )}
          </button>

          {/* Collapsible Email/Password Section */}
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowEmailLogin(!showEmailLogin)}
              className="w-full flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-slate-600 transition-colors cursor-pointer py-2"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>
                {showEmailLogin
                  ? "Hide email sign in"
                  : "Or sign in with email"}
              </span>
            </button>

            <AnimatePresence>
              {showEmailLogin && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 mt-2 border-t border-slate-100">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-slate-700 mb-1.5"
                        >
                          Email
                        </label>
                        <input
                          id="email"
                          type="email"
                          placeholder="admin@harcourts.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={loading}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm focus:bg-white focus:border-[#00ADEF] focus:ring-1 focus:ring-[#00ADEF]/30 transition-all outline-none disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="password"
                          className="block text-sm font-medium text-slate-700 mb-1.5"
                        >
                          Password
                        </label>
                        <input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={loading}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm focus:bg-white focus:border-[#00ADEF] focus:ring-1 focus:ring-[#00ADEF]/30 transition-all outline-none disabled:opacity-50"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="group w-full py-3.5 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <span>Sign In</span>
                            <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                          </>
                        )}
                      </button>

                      <div className="text-center">
                        <Link
                          href="/forgot-password"
                          className="text-sm text-slate-400 hover:text-[#00ADEF] transition-colors"
                        >
                          Forgot your password?
                        </Link>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="mt-10 pt-8 border-t border-slate-100">
            <p className="text-center text-sm text-slate-400">
              Protected by Enterprise Single Sign-On
            </p>
            <p className="text-center text-xs text-slate-300 mt-2">
              Harcourts Ulverstone &amp; Penguin
            </p>
          </div>
        </div>

        {/* Bottom Accent */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-[#00ADEF] to-transparent rounded-full opacity-60" />
      </motion.div>
    </div>
  );
}
