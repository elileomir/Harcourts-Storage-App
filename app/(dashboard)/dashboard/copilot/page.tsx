import type { Metadata } from "next";
import { ChatPanel } from "@/components/features/copilot/chat-panel";

export const metadata: Metadata = {
  title: "PM Copilot",
  description: "Your leasing assistant — create, send, and track agreements.",
};

export default function CopilotPage() {
  return <ChatPanel />;
}
