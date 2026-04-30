"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import {
  PhoneOutgoing,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import type { CallWithReference } from "@/lib/penny-outbound/reference-types";

interface StatsBarProps {
  calls: CallWithReference[];
}

function AnimatedCounter({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    if (inView) {
      const controls = animate(count, value, {
        duration: 1,
        ease: "easeOut",
      });
      return controls.stop;
    }
  }, [inView, value, count]);

  useEffect(() => {
    const unsub = rounded.on("change", (v) => {
      if (ref.current) ref.current.textContent = String(v);
    });
    return unsub;
  }, [rounded]);

  return <span ref={ref}>0</span>;
}

interface StatCardProps {
  label: string;
  value: number;
  Icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  iconColor: string;
  delay: number;
}

function StatCard({ label, value, Icon, gradient, iconColor, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className={`relative overflow-hidden rounded-xl border border-white/60 p-4 md:p-5 ${gradient} backdrop-blur-sm shadow-sm`}
    >
      {/* Decorative glow */}
      <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/20 blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500/80 mb-1">
            {label}
          </p>
          <p className="text-2xl md:text-3xl font-bold text-[#001F49] font-display tabular-nums">
            <AnimatedCounter value={value} />
          </p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColor}`}>
          <Icon className="w-5 h-5" aria-hidden="true" />
        </div>
      </div>
    </motion.div>
  );
}

export function StatsBar({ calls }: StatsBarProps) {
  const total = calls.length;
  const completed = calls.filter(
    (c) => c.reference_check?.status === "complete"
  ).length;
  const deferred = calls.filter(
    (c) => c.reference_check?.status === "deferred"
  ).length;
  const failed = calls.filter(
    (c) =>
      c.retell_call_status === "failed" ||
      c.reference_check?.status === "declined" ||
      c.reference_check?.status === "no_answer"
  ).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
      <StatCard
        label="Total Calls"
        value={total}
        Icon={PhoneOutgoing}
        gradient="bg-gradient-to-br from-blue-50/80 to-cyan-50/60"
        iconColor="bg-blue-100 text-harcourts-blue"
        delay={0}
      />
      <StatCard
        label="Completed"
        value={completed}
        Icon={CheckCircle2}
        gradient="bg-gradient-to-br from-emerald-50/80 to-green-50/60"
        iconColor="bg-emerald-100 text-emerald-600"
        delay={0.05}
      />
      <StatCard
        label="Deferred"
        value={deferred}
        Icon={Clock}
        gradient="bg-gradient-to-br from-amber-50/80 to-yellow-50/60"
        iconColor="bg-amber-100 text-amber-600"
        delay={0.1}
      />
      <StatCard
        label="Failed"
        value={failed}
        Icon={XCircle}
        gradient="bg-gradient-to-br from-red-50/80 to-rose-50/60"
        iconColor="bg-red-100 text-red-500"
        delay={0.15}
      />
    </div>
  );
}
