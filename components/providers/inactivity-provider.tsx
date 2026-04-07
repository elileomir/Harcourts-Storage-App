"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, LogOut } from "lucide-react";

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const WARNING_TIMEOUT = 14 * 60 * 1000; // 14 minutes (1 minute warning)

export function InactivityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isWarningVisible, setIsWarningVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // Seconds left during warning

  // eslint-disable-next-line react-hooks/purity
  const lastActivityRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const warningIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (isWarningVisible) {
      setIsWarningVisible(false);
      // Stop the countdown
      if (warningIntervalRef.current) {
        clearInterval(warningIntervalRef.current);
        warningIntervalRef.current = null;
      }
    }
  }, [isWarningVisible]);

  const handleLogout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login?reason=timeout");
  }, [router]);

  useEffect(() => {
    const events = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
    ];

    // Throttle the event listener to avoid performance issues
    let lastThrottled = 0;
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastThrottled > 1000) {
        resetTimer();
        lastThrottled = now;
      }
    };

    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Check for inactivity every second
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;

      if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
        // Time's up!
        handleLogout();
      } else if (timeSinceLastActivity >= WARNING_TIMEOUT) {
        // Show warning
        if (!isWarningVisible) {
          setIsWarningVisible(true);
          setTimeLeft(60);

          // Start countdown
          if (warningIntervalRef.current)
            clearInterval(warningIntervalRef.current);
          warningIntervalRef.current = setInterval(() => {
            setTimeLeft((prev) => {
              if (prev <= 1) {
                clearInterval(warningIntervalRef.current!);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
      }
    }, 1000);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (timerRef.current) clearInterval(timerRef.current);
      if (warningIntervalRef.current) clearInterval(warningIntervalRef.current);
    };
  }, [resetTimer, handleLogout, isWarningVisible]);

  return (
    <>
      {children}

      <AnimatePresence>
        {isWarningVisible && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-amber-500" />
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Are you still there?
                </h3>

                <p className="text-slate-500 mb-6">
                  For security, your session will time out in{" "}
                  <span className="font-bold text-amber-600">
                    {timeLeft} seconds
                  </span>{" "}
                  due to inactivity.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={handleLogout}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </button>
                  <button
                    onClick={resetTimer}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#001F49] text-white font-medium hover:bg-[#002a60] transition-colors shadow-lg shadow-blue-900/20"
                  >
                    Stay Logged In
                  </button>
                </div>
              </div>
              <div className="h-1 bg-slate-100 w-full">
                <motion.div
                  className="h-full bg-amber-500"
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 60, ease: "linear" }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
