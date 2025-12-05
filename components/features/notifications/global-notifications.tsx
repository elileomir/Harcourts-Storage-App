"use client";

import { useRealtimeChannel } from "@/lib/hooks/use-realtime-channel";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function GlobalNotifications() {
  const router = useRouter();

  useRealtimeChannel("global-notifications", [
    {
      event: "INSERT",
      schema: "public",
      table: "bookings",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      callback: ((payload: any) => {
        toast.success("New Booking Received!", {
          description: `Customer: ${payload.new.customer_name}`,
          action: {
            label: "View",
            onClick: () => router.push("/dashboard/bookings"),
          },
        });
      }) as unknown as () => void,
    },
    {
      event: "INSERT",
      schema: "public",
      table: "callback_requests",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      callback: ((payload: any) => {
        toast.info("New Callback Request", {
          description: `From: ${payload.new.full_name} (${payload.new.phone_number})`,
          action: {
            label: "View",
            onClick: () => router.push("/dashboard/callbacks"),
          },
        });
      }) as unknown as () => void,
    },
    {
      event: "INSERT",
      schema: "public",
      table: "waitlist_requests",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      callback: ((payload: any) => {
        toast.info("New Waitlist Request", {
          description: `Facility: ${payload.new.facility}`,
          action: {
            label: "View",
            onClick: () => router.push("/dashboard/waitlist"),
          },
        });
      }) as unknown as () => void,
    },
  ]);

  return null; // This component doesn't render anything visible
}
