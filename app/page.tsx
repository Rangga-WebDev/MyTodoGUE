import { createClient } from "@/lib/supabase/server";
import { dateWIB, daysAgoWIB, jamWIB, todayLabel, todayWIB } from "@/lib/date";
import AppShell from "@/components/AppShell";
import AddTaskForm from "@/components/AddTaskForm";
import ProgressRing from "@/components/ProgressRing";
import WeekBars, { type DayBar } from "@/components/WeekBars";
import TaskItem, { type Task } from "@/components/TaskItem";
import { Orbit } from "lucide-react";

function sapaan(): string {
  const jam = jamWIB();
  if (jam < 11) return "Selamat pagi MasBro";
  if (jam < 15) return "Selamat siang MasBro";
  if (jam < 19) return "Selamat sore MasBro";
  return "Selamat malam MasBro";
}

function SectionHeading({
  children,
  tone = "text-ash",
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  return (
    <h2
      className={`font-display text-xs font-bold uppercase tracking-[0.25em] ${tone}`}
    >
      {children}
    </h2>
  );
}

function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <ul className="divide-y divide-line/60 rounded-card border border-line bg-surface px-1.5 py-1">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  );
}

export default async function Home() {
  const supabase = createClient();
  const today = todayWIB();

  const [userRes, pendingRes, doneRes, activeRes] = await Promise.all([
    supabase.auth.getUser(),
    // Tugas "Hari Ini": belum selesai DAN (due <= hari ini ATAU tanpa tanggal)
    supabase
      .from("tasks")
      .select("*")
      .eq("is_done", false)
      .or(`due_date.lte.${today},due_date.is.null`)
      .order("priority", { ascending: true })
      .order("created_at", { ascending: true }),
    // Tugas selesai 7 hari terakhir — untuk bar chart & statistik
    supabase
      .from("tasks")
      .select("completed_at")
      .eq("is_done", true)
      .gte("completed_at", `${daysAgoWIB(6)}T00:00:00+07:00`),
    // Total seluruh tugas aktif (termasuk yang due-nya masih jauh)
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("is_done", false),
  ]);

  const user = userRes.data.user;
  const nama = user?.email?.split("@")[0] ?? "kamu";
  const pending = (pendingRes.data ?? []) as Task[];
  const activeCount = activeRes.count ?? 0;

  // ----- Agregasi bar 7 hari (dihitung dalam WIB) -----
  const days: (DayBar & { date: string })[] = Array.from(
    { length: 7 },
    (_, i) => {
      const date = daysAgoWIB(6 - i);
      return {
        date,
        label: new Intl.DateTimeFormat("id-ID", {
          weekday: "short",
          timeZone: "Asia/Jakarta",
        }).format(new Date(`${date}T12:00:00+07:00`)),
        value: 0,
        isToday: date === today,
      };
    }
  );
  for (const row of doneRes.data ?? []) {
    if (!row.completed_at) continue;
    const d = dateWIB(new Date(row.completed_at));
    const hit = days.find((x) => x.date === d);
    if (hit) hit.value++;
  }

  const doneToday = days.find((d) => d.isToday)?.value ?? 0;
  const doneWeek = days.reduce((sum, d) => sum + d.value, 0);
  const totalToday = doneToday + pending.length;
  const ringValue = totalToday === 0 ? 0 : (doneToday / totalToday) * 100;

  // Kategori dengan tugas aktif terbanyak — untuk insight card
  const catCount = new Map<string, number>();
  for (const t of pending) {
    const c = t.category ?? "umum";
    catCount.set(c, (catCount.get(c) ?? 0) + 1);
  }
  const topCat = Array.from(catCount.entries()).sort((a, b) => b[1] - a[1])[0];

  // ----- Pengelompokan daftar -----
  const overdue = pending.filter((t) => t.due_date && t.due_date < today);
  const dueToday = pending.filter((t) => t.due_date === today);
  const noDate = pending.filter((t) => !t.due_date);

  return (
    <AppShell active="hari-ini" email={user?.email}>
      <div className="animate-rise space-y-6 px-4 py-6 md:px-8">
        {/* ===== Hero asimetris ===== */}
        <section className="relative overflow-hidden rounded-card border border-line bg-surface p-6 md:p-8">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -right-20 -top-20 h-64 w-64 animate-orbit rounded-full border border-line">
              <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lavender/70" />
            </div>
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full border border-line/50" />
          </div>

          <div className="relative flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="font-display text-3xl font-bold leading-tight md:text-4xl">
                {sapaan()}, {nama}.
              </h1>
              <p className="mt-1 text-sm capitalize text-ash">{todayLabel()}</p>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-ash">
                Satu tugas yang selesai lebih berharga daripada sepuluh
                rencana.
              </p>
              <p className="mt-5 font-display text-6xl font-bold leading-none md:text-7xl">
                <span className="text-lime">
                  {String(pending.length).padStart(2, "0")}
                </span>{" "}
                <span className="text-xl tracking-[0.2em] text-ash">TUGAS</span>
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <ProgressRing
                value={ringValue}
                size={112}
                stroke={9}
                label={`Progres hari ini ${doneToday} dari ${totalToday} tugas`}
              />
              <p className="text-xs text-ash">
                {doneToday}/{totalToday} selesai hari ini
              </p>
            </div>
          </div>
        </section>

        {/* ===== Statistik bento (ukuran sengaja tidak seragam) ===== */}
        <section aria-label="Statistik" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-card border border-line bg-surface p-5 transition hover:bg-moss/40">
            <p className="font-display text-4xl font-bold">{doneWeek}</p>
            <p className="mt-1 text-xs leading-relaxed text-ash">
              selesai dalam 7 hari terakhir
            </p>
          </div>

          <div className="rounded-card border border-line bg-surface p-5 transition hover:bg-moss/40 lg:col-span-2">
            <div className="mb-3 flex items-baseline justify-between">
              <p className="text-xs text-ash">Aktivitas mingguan</p>
              <p className="font-display text-sm font-bold text-lime">
                {doneToday} hari ini
              </p>
            </div>
            <WeekBars data={days} />
          </div>

          {/* Insight card — lavender, teks gelap */}
          <div className="rounded-card border border-lavender/30 bg-lavender p-5 text-obsidian">
            <p className="font-display text-4xl font-bold">{activeCount}</p>
            <p className="mt-1 text-xs font-medium leading-relaxed">
              tugas aktif
              {topCat
                ? ` — terbanyak di "${topCat[0]}" (${topCat[1]})`
                : " — belum ada fokus tertentu"}
            </p>
          </div>
        </section>

        {/* ===== Input cepat ===== */}
        <AddTaskForm />

        {/* ===== Daftar tugas ===== */}
        {pending.length === 0 ? (
          <section className="rounded-card border border-line bg-surface p-10 text-center">
            <span
              aria-hidden
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-line bg-moss"
            >
              <Orbit className="h-6 w-6 text-lime" />
            </span>
            <p className="mt-4 font-display text-lg font-bold">Semua beres.</p>
            <p className="mx-auto mt-1 max-w-xs text-sm leading-relaxed text-ash">
              Tidak ada tugas untuk hari ini. Tambahkan satu di atas, atau
              nikmati ruang kosongmu.
            </p>
          </section>
        ) : (
          <div className="space-y-5">
            {overdue.length > 0 && (
              <section className="space-y-2">
                <SectionHeading tone="text-coral">
                  Terlambat — {overdue.length}
                </SectionHeading>
                <TaskList tasks={overdue} />
              </section>
            )}
            {dueToday.length > 0 && (
              <section className="space-y-2">
                <SectionHeading>Hari Ini — {dueToday.length}</SectionHeading>
                <TaskList tasks={dueToday} />
              </section>
            )}
            {noDate.length > 0 && (
              <section className="space-y-2">
                <SectionHeading>
                  Tanpa Tanggal — {noDate.length}
                </SectionHeading>
                <TaskList tasks={noDate} />
              </section>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}