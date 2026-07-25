import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { daysAgoWIB, todayWIB } from "@/lib/date";

export const dynamic = "force-dynamic";

const LIMA_JAM_MS = 5 * 60 * 60 * 1000;

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function GET(request: Request) {
  // Pengaman yang sama dengan digest pagi
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  // Kandidat: punya jam, belum pernah diingatkan, deadline hari ini ATAU besok.
  // Besok ikut dicek karena jendela 5 jam bisa melewati tengah malam
  // (deadline besok 02.00 → pengingatnya malam ini 21.00).
  const { data, error } = await supabase
    .from("tasks")
    .select("id, title, due_date, due_time")
    .eq("is_done", false)
    .eq("reminded_h5", false)
    .not("due_time", "is", null)
    .in("due_date", [todayWIB(), daysAgoWIB(-1)]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const now = Date.now();
  const masukJendela: { id: number; title: string; jam: string; sisaJam: number }[] = [];
  const sudahLewat: number[] = [];

  for (const t of data ?? []) {
    // Gabungkan tanggal + jam sebagai waktu WIB, lalu bandingkan dengan sekarang
    const due = new Date(`${t.due_date}T${t.due_time}+07:00`).getTime();
    const sisa = due - now;

    if (sisa <= 0) {
      // Deadline sudah lewat — hentikan pemantauan H-5 (digest pagi yang menagih)
      sudahLewat.push(t.id);
    } else if (sisa <= LIMA_JAM_MS) {
      masukJendela.push({
        id: t.id,
        title: t.title,
        jam: (t.due_time as string).slice(0, 5),
        sisaJam: Math.round((sisa / 3600000) * 10) / 10,
      });
    }
    // sisa > 5 jam → biarkan, akan tertangkap cron berikutnya
  }

  // Tandai yang sudah lewat agar tidak diperiksa terus
  if (sudahLewat.length > 0) {
    await supabase.from("tasks").update({ reminded_h5: true }).in("id", sudahLewat);
  }

  if (masukJendela.length === 0) {
    return NextResponse.json({ ok: true, dikirim: 0 });
  }

  // Satu pesan gabungan untuk semua yang masuk jendela
  const lines = ["⏰ <b>Deadline mendekat, MasBro!</b>", ""];
  for (const t of masukJendela) {
    lines.push(`🔔 ${escapeHtml(t.title)} — ±${t.sisaJam} jam lagi (jam ${t.jam})`);
  }

  const res = await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: lines.join("\n"),
        parse_mode: "HTML",
      }),
    }
  );
  const tg = await res.json();
  if (!tg.ok) {
    // Pengiriman gagal → JANGAN tandai, biar dicoba lagi 15 menit berikutnya
    return NextResponse.json({ error: `Telegram: ${tg.description}` }, { status: 502 });
  }

  // Terkirim → baru tandai, agar tidak dobel
  await supabase
    .from("tasks")
    .update({ reminded_h5: true })
    .in("id", masukJendela.map((t) => t.id));

  return NextResponse.json({ ok: true, dikirim: masukJendela.length });
}