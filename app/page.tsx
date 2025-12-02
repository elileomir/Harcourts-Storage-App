import { redirect } from "next/navigation";

export default function Home() {
  // Middleware will handle auth check
  // If user reaches here, redirect to login
  redirect("/login");
}
