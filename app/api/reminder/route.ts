import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { daysAgoWIB, formatTanggal, todayWIB } from "@/lib/date";

export const dynamic = "force-dynamic";

const PRIORITY_ICON: Record<number, string> = { 1: "🔴", 2: "🟡", 3: "⚪" };

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// "kumpul laporan (jam 14.00)" bila ada jam, tanpa embel-embel bila tidak
function judulDenganJam(title: string, due_time: string | null): string {
  const jam = due_time ? ` (jam ${String(due_time).slice(0, 5)})` : "";
  return `${escapeHtml(title)}${jam}`;
}

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const today = todayWIB();
  const besok = daysAgoWIB(-1);

  // Dua query paralel: (1) hari ini + terlambat + tanpa tanggal, (2) besok
  const [hariIniRes, besokRes] = await Promise.all([
    supabase
      .from("tasks")
      .select("title, due_date, due_time, priority")
      .eq("is_done", false)
      .or(`due_date.lte.${today},due_date.is.null`)
      .order("priority", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("tasks")
      .select("title, due_time")
      .eq("is_done", false)
      .eq("due_date", besok)
      .order("priority", { ascending: true }),
  ]);

  if (hariIniRes.error || besokRes.error) {
    return NextResponse.json(
      { error: (hariIniRes.error ?? besokRes.error)!.message },
      { status: 500 }
    );
  }

  const tasks = hariIniRes.data ?? [];
  const tugasBesok = besokRes.data ?? [];
  const appUrl = process.env.APP_URL ?? "";

  // ---- Susun pesan ----
  const lines: string[] = [];

  if (tasks.length === 0) {
    lines.push("☀️ <b>Pagi MasBro!</b>", "Tidak ada tugas untuk hari ini 🎉");
  } else {
    const overdue = tasks.filter((t) => t.due_date && t.due_date < today);
    const sisa = tasks.filter((t) => !(t.due_date && t.due_date < today));

    lines.push(`☀️ <b>Tugasmu hari ini (${formatTanggal(today)}):</b>`, "");
    for (const t of overdue) {
      lines.push(
        `❗ <b>Terlambat:</b> ${judulDenganJam(t.title, t.due_time)} (sejak ${formatTanggal(t.due_date!)})`
      );
    }
    for (const t of sisa) {
      lines.push(
        `${PRIORITY_ICON[t.priority] ?? "🟡"} ${judulDenganJam(t.title, t.due_time)}`
      );
    }
    lines.push("", `Total ${tasks.length} tugas aktif hari ini.`);
  }

  // Seksi D-1 — pemanasan untuk deadline besok
  if (tugasBesok.length > 0) {
    lines.push("", "⏰ <b>Besok deadline:</b>");
    for (const t of tugasBesok) {
      lines.push(`• ${judulDenganJam(t.title, t.due_time)}`);
    }
  }

  if (appUrl) lines.push("", appUrl);

  // ---- Kirim ----
  const res = await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: lines.join("\n"),
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    }
  );
  const tg = await res.json();
  if (!tg.ok) {
    return NextResponse.json({ error: `Telegram: ${tg.description}` }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    hariIni: tasks.length,
    besok: tugasBesok.length,
  });
}