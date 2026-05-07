"use client";

import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, Home, ChevronRight, AlertTriangle } from "lucide-react";
import { motion, useScroll, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";
import { InactivityProvider } from "@/components/providers/inactivity-provider";
import { GlobalNotifications } from "@/components/features/notifications/global-notifications";
import { useAuth } from "@/components/providers/auth-provider";

function useBoundedScroll(threshold: number) {
  const { scrollY } = useScroll();
  const scrollYBounded = useMotionValue(0);
  const scrollYBoundedProgress = useTransform(
    scrollYBounded,
    [0, threshold],
    [0, 1],
  );

  useEffect(() => {
    return scrollY.on("change", (current) => {
      const previous = scrollY.getPrevious() || 0;
      const diff = current - previous;
      const newScrollYBounded = scrollYBounded.get() + diff;
      scrollYBounded.set(Math.min(Math.max(newScrollYBounded, 0), threshold));
    });
  }, [threshold, scrollY, scrollYBounded]);

  return { scrollYBoundedProgress };
}

function getBreadcrumb(pathname: string): string | null {
  if (pathname === "/dashboard") return null;
  if (pathname.includes("/storage")) return "Storage Dashboard";
  if (pathname.includes("/units")) return "Units";
  if (pathname.includes("/bookings")) return "Bookings";
  if (pathname.includes("/analytics")) return "Analytics";
  if (pathname.includes("/waitlist")) return "Waitlist";
  if (pathname.includes("/callback-requests")) return "Callback Requests";
  if (pathname.includes("/penny-storage-outbound")) return "Penny Storage Outbound";
  if (pathname.includes("/penny-outbound-history")) return "Referee Call History";
  if (pathname.includes("/penny-outbound")) return "Penny Referee Check";
  if (pathname.includes("/knowledge")) return "Knowledge Base";
  if (pathname.includes("/expense-approvals")) return "Expense History";
  if (pathname.includes("/expense-approval")) return "Expense Approval";
  if (pathname.includes("/admin/settings")) return "Platform Settings";
  if (pathname.includes("/settings")) return "Settings";
  if (pathname.includes("/users")) return "Users";
  return null;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const { scrollYBoundedProgress } = useBoundedScroll(100);
  const { initError, retryInit } = useAuth();
  const buildId = process.env.NEXT_PUBLIC_BUILD_ID;

  const headerY = useTransform(scrollYBoundedProgress, [0, 1], [0, -80]);
  const headerOpacity = useTransform(scrollYBoundedProgress, [0, 1], [1, 0]);

  const breadcrumb = getBreadcrumb(pathname);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <InactivityProvider>
        <GlobalNotifications />

        {/* Floating Navigation Bar */}
        <motion.header
          style={{
            y: headerY,
            opacity: headerOpacity,
          }}
          className="fixed top-4 left-4 right-4 z-50"
        >
          <div className="max-w-7xl mx-auto">
            <nav className="bg-white rounded-2xl shadow-lg shadow-slate-900/5 border border-slate-100 px-4 sm:px-6 py-3">
              <div className="flex justify-between items-center">
                {/* Left: Logo + Breadcrumb */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <Link
                    href="/dashboard"
                    className="group flex items-center gap-3 hover:opacity-90 transition-opacity"
                  >
                    <div className="relative w-28 sm:w-32 h-8">
                      <Image
                        src="https://resources.cloudhi.io/images/logo/harcourts-international-logo.svg"
                        alt="Harcourts"
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>
                    <div className="hidden sm:flex items-center">
                      <div className="w-px h-6 bg-slate-200 mx-3" />
                      <span className="text-[#00ADEF] font-semibold text-sm tracking-tight">
                        PM App
                      </span>
                    </div>
                  </Link>

                  {/* Breadcrumb */}
                  {breadcrumb && (
                    <div className="hidden md:flex items-center gap-2 text-sm text-slate-400 ml-2">
                      <ChevronRight className="w-4 h-4" />
                      <span className="font-medium text-slate-600">
                        {breadcrumb}
                      </span>
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1 sm:gap-2">
                  <Link
                    href="/dashboard"
                    className={`p-2.5 rounded-xl transition-all duration-200 ${
                      pathname === "/dashboard"
                        ? "bg-sky-50 text-[#00ADEF]"
                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                    }`}
                    title="Dashboard Home"
                    aria-label="Go to Dashboard Home"
                  >
                    <Home className="w-5 h-5" />
                  </Link>

                  <div className="hidden sm:block w-px h-6 bg-slate-200 mx-1" />

                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 px-3 py-2 rounded-xl transition-all duration-200 text-sm font-medium group"
                    aria-label="Sign out"
                  >
                    <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                </div>
              </div>
            </nav>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
          {initError ? (
            <div className="mx-auto mt-12 max-w-md rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-500" />
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    We couldn&apos;t finish loading your session
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    This usually clears up with a retry or a reload —
                    especially right after a release.
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={retryInit}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Try again
                    </button>
                    <button
                      onClick={() => window.location.reload()}
                      className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
                    >
                      Reload app
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            children
          )}
        </main>

        {/* Minimal Footer */}
        <footer className="py-6 text-center">
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} Harcourts Ulverstone &amp; Penguin
            {buildId && (
              <span className="ml-2 text-slate-300">· v{buildId.slice(0, 8)}</span>
            )}
          </p>
        </footer>
      </InactivityProvider>
    </div>
  );
}
