"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Box,
  ArrowRight,
  Sparkles,
  FileText,
  BarChart3,
  Settings,
  Users,
  Receipt,
  Clock,
  PhoneIncoming,
  BookOpen,
  LayoutDashboard,
} from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const item = {
  hidden: { y: 16, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
    },
  },
};

const storageSubLinks = [
  {
    name: "Overview",
    href: "/dashboard/storage",
    icon: LayoutDashboard,
    desc: "Full dashboard",
  },
  { name: "Units", href: "/dashboard/units", icon: Box, desc: "Manage units" },
  {
    name: "Bookings",
    href: "/dashboard/bookings",
    icon: Users,
    desc: "Reservations",
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    desc: "Performance",
  },
  {
    name: "Waitlist",
    href: "/dashboard/waitlist",
    icon: Clock,
    desc: "Queue",
  },
  {
    name: "Callbacks",
    href: "/dashboard/callback-requests",
    icon: PhoneIncoming,
    desc: "Requests",
  },
  {
    name: "Knowledge",
    href: "/dashboard/knowledge",
    icon: BookOpen,
    desc: "AI training",
  },
];

export default function DashboardHub() {
  const [userEmail, setUserEmail] = useState<string>("");
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email) setUserEmail(user.email);
    };
    getUser();
  }, [supabase]);

  return (
    <div className="space-y-8 pb-8 w-full">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-[#001F49] tracking-tight">
            Welcome back,{" "}
            <span className="text-[#00ADEF] capitalize">
              {userEmail ? userEmail.split("@")[0].split(".")[0] : "User"}
            </span>
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Your project management toolkit for storage &amp; operations.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100 self-start md:self-auto">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
            System Active
          </span>
        </div>
      </div>

      {/* Bento Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-5 auto-rows-[minmax(280px,auto)]"
      >
        {/* HERO: Storage Management - Featured Tool */}
        <motion.div variants={item} className="group relative">
          <div className="relative h-full bg-gradient-to-br from-[#00ADEF] to-[#0088bc] rounded-2xl p-8 text-white overflow-hidden shadow-xl shadow-sky-500/20 transition-all duration-300 hover:shadow-2xl hover:shadow-sky-500/30 flex flex-col justify-between border border-sky-400/20">
            {/* Content */}
            <div className="relative z-10 flex flex-col gap-5">
              <div className="inline-flex items-center gap-2 self-start bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Featured Tool
                </span>
              </div>

              <Link href="/dashboard/storage" className="space-y-2 group/title">
                <h2 className="font-display text-3xl font-bold tracking-tight group-hover/title:underline underline-offset-4 decoration-white/50">
                  Storage Management
                </h2>
                <p className="text-sky-100 text-base max-w-md leading-relaxed">
                  Manage storage units, track occupancy, handle bookings, and
                  monitor facility performance with AI-powered insights.
                </p>
              </Link>
            </div>

            {/* Sub-navigation buttons */}
            <div className="relative z-10 mt-6 pt-5 border-t border-white/15">
              <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
                {storageSubLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/25 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                  >
                    <link.icon className="w-4 h-4 text-white/90" />
                    <span className="text-[11px] font-semibold text-white/90">
                      {link.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Decorative Icon */}
            <div className="absolute -right-8 -bottom-8 opacity-10 transform rotate-12 group-hover:rotate-6 group-hover:scale-110 transition-all duration-500">
              <Box className="w-56 h-56" />
            </div>
          </div>
        </motion.div>

        {/* Expense Approval */}
        <motion.div variants={item} className="group relative">
          <Link href="/dashboard/expense-approval" className="block h-full">
            <div className="relative h-full bg-gradient-to-br from-teal-500/5 to-cyan-500/5 rounded-2xl p-8 overflow-hidden shadow-sm border border-teal-500/20 transition-all duration-300 hover:shadow-md hover:border-teal-500/30 hover:-translate-y-1 flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <FileText className="w-32 h-32 text-teal-600" />
              </div>

              {/* Content */}
              <div className="relative z-10 flex flex-col gap-5">
                <div className="inline-flex items-center gap-2 self-start bg-teal-50 px-3 py-1.5 rounded-full border border-teal-100">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                    New Feature
                  </span>
                </div>

                <div className="space-y-2">
                  <h2 className="font-display text-2xl font-bold tracking-tight text-[#001F49]">
                    Expense Approval
                  </h2>
                  <p className="text-slate-500 text-base max-w-md leading-relaxed">
                    Landlord expense approval for council rates, land tax, and
                    TasWater with DocuSign integration.
                  </p>
                </div>
              </div>

              <div className="relative z-10 mt-6 pt-5 border-t border-teal-100 flex items-center justify-between group-hover:border-teal-200 transition-colors">
                <span className="font-semibold text-base text-teal-700">
                  Create Approval
                </span>
                <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center group-hover:bg-teal-200 group-hover:text-teal-800 transition-all duration-300">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = "/dashboard/expense-approvals";
                }}
                className="relative z-20 mt-3 flex items-center gap-2 text-xs font-semibold text-teal-600 hover:text-teal-800 transition-colors cursor-pointer"
              >
                <Receipt className="w-3.5 h-3.5" />
                View Approvals History →
              </button>
            </div>
          </Link>
        </motion.div>

        {/* Quick Actions - Full Width */}
        <motion.div variants={item} className="md:col-span-2">
          <div className="h-full bg-[#001F49] rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#00ADEF]/15 rounded-full blur-[80px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#000F24]/60 to-transparent" />

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Settings className="w-4 h-4 text-sky-300" />
                </div>
                <h3 className="font-display text-lg font-bold">
                  Quick Actions
                </h3>
              </div>

              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Link
                  href="/dashboard/expense-approval"
                  className="flex flex-col p-5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all hover:-translate-y-0.5 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-teal-500/20 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <FileText className="w-4 h-4 text-teal-300" />
                  </div>
                  <span className="font-semibold text-sm text-white">
                    New Expense
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    Create approval
                  </span>
                </Link>

                <Link
                  href="/dashboard/expense-approvals"
                  className="flex flex-col p-5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all hover:-translate-y-0.5 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-sky-500/20 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Receipt className="w-4 h-4 text-sky-300" />
                  </div>
                  <span className="font-semibold text-sm text-white">
                    History
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    Past approvals
                  </span>
                </Link>

                <Link
                  href="/dashboard/settings"
                  className="flex flex-col p-5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all hover:-translate-y-0.5 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-sky-500/20 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Settings className="w-4 h-4 text-sky-300" />
                  </div>
                  <span className="font-semibold text-sm text-white">
                    Settings
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    Configuration
                  </span>
                </Link>

                <Link
                  href="/dashboard/users"
                  className="flex flex-col p-5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all hover:-translate-y-0.5 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-sky-500/20 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Users className="w-4 h-4 text-sky-300" />
                  </div>
                  <span className="font-semibold text-sm text-white">
                    Users
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    Manage access
                  </span>
                </Link>
              </div>

              <div className="mt-6 pt-5 border-t border-white/10 text-center">
                <p className="text-[11px] text-slate-500">
                  Harcourts PM App v1.0
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
