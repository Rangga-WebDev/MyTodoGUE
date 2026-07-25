"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      aria-label="Keluar"
      title="Keluar"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-ash transition hover:bg-moss hover:text-coral"
    >
      <LogOut className="h-4 w-4" aria-hidden />
    </button>
  );
}