import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { formatTanggal, todayWIB } from "@/lib/date";

// Dipanggil Vercel Cron tiap pagi — bukan lewat browser/middleware.
// Keamanan pakai CRON_SECRET, data pakai service role (melewati RLS secara sah).
export const dynamic = "force-dynamic";

const PRIORITY_ICON: Record<number, string> = { 1: "🔴", 2: "🟡", 3: "⚪" };

// Judul tugas = input bebas — wajib di-escape agar tidak merusak/menyuntik HTML
function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function GET(request: Request) {
  // 1. Verifikasi pemanggil — Vercel Cron otomatis mengirim
  //    "Authorization: Bearer <CRON_SECRET>" jika env var itu ada
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Client admin — service role key HANYA boleh hidup di server
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const today = todayWIB();
  const { data, error } = await supabase
    .from("tasks")
    .select("title, due_date, priority")
    .eq("is_done", false)
    .or(`due_date.lte.${today},due_date.is.null`)
    .order("priority", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const tasks = data ?? [];
  const appUrl = process.env.APP_URL ?? "";

  // 3. Susun pesan
  let text: string;
  if (tasks.length === 0) {
    text = `☀️ <b>Pagi MasBro!</b>\nTidak ada tugas untuk hari ini. Nikmati harimu 🎉`;
  } else {
    const overdue = tasks.filter((t) => t.due_date && t.due_date < today);
    const sisa = tasks.filter((t) => !(t.due_date && t.due_date < today));

    const lines = [`☀️ <b>Tugasmu hari ini (${formatTanggal(today)}):</b>`, ""];
    for (const t of overdue) {
      lines.push(
        `❗ <b>Terlambat:</b> ${escapeHtml(t.title)} (sejak ${formatTanggal(t.due_date!)})`
      );
    }
    for (const t of sisa) {
      lines.push(`${PRIORITY_ICON[t.priority] ?? "🟡"} ${escapeHtml(t.title)}`);
    }
    lines.push("", `Total ${tasks.length} tugas aktif hari ini.`);
    if (appUrl) lines.push(appUrl);
    text = lines.join("\n");
  }

  // 4. Kirim ke Telegram
  const res = await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    }
  );
  const tg = await res.json();
  if (!tg.ok) {
    return NextResponse.json({ error: `Telegram: ${tg.description}` }, { status: 502 });
  }

  return NextResponse.json({ ok: true, taskCount: tasks.length });
}