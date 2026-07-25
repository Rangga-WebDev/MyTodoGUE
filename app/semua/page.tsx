import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import TaskItem, { type Task } from "@/components/TaskItem";
import { Search, SearchX, X } from "lucide-react";

type SearchParams = { status?: string; kategori?: string; q?: string };

// Filter disimpan di URL (bukan state) agar bisa di-bookmark,
// tombol back berfungsi, dan halaman tetap sepenuhnya server-rendered.
function filterUrl(current: SearchParams, next: Partial<SearchParams>): string {
  const merged = { ...current, ...next };
  const params = new URLSearchParams();
  if (merged.status && merged.status !== "aktif") {
    params.set("status", merged.status);
  }
  if (merged.kategori) params.set("kategori", merged.kategori);
  if (merged.q) params.set("q", merged.q);
  const qs = params.toString();
  return qs ? `/semua?${qs}` : "/semua";
}

function chipCls(active: boolean): string {
  return `inline-flex min-h-[36px] items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs transition ${
    active
      ? "border-lime/60 bg-moss text-ivory"
      : "border-line text-ash hover:border-ash hover:text-ivory"
  }`;
}

const STATUS_TABS = [
  { value: "aktif", label: "Aktif" },
  { value: "selesai", label: "Selesai" },
  { value: "semua", label: "Semua" },
];

export default async function SemuaPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = createClient();
  const status = searchParams.status ?? "aktif";
  const kategori = searchParams.kategori;
  const q = searchParams.q?.trim();

  // Query dibangun bertahap sesuai filter yang aktif
  let query = supabase.from("tasks").select("*");
  if (status === "aktif") query = query.eq("is_done", false);
  else if (status === "selesai") query = query.eq("is_done", true);
  if (kategori) query = query.eq("category", kategori);
  if (q) query = query.ilike("title", `%${q}%`);

  const [tasksRes, catRes, userRes] = await Promise.all([
    query
      .order("is_done", { ascending: true })
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("priority", { ascending: true }),
    supabase.from("tasks").select("category"),
    supabase.auth.getUser(),
  ]);

  const tasks = (tasksRes.data ?? []) as Task[];
  const categories = Array.from(
    new Set((catRes.data ?? []).map((r) => r.category ?? "umum"))
  ).sort();
  const adaFilter = status !== "aktif" || !!kategori || !!q;

  return (
    <AppShell active="semua" email={userRes.data.user?.email}>
      <div className="animate-rise space-y-5 px-4 py-6 md:px-8">
        <header className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="font-display text-3xl font-bold">Semua Tugas</h1>
          <p className="text-sm text-ash">{tasks.length} tugas ditampilkan</p>
        </header>

        {/* Pencarian — form GET biasa, bekerja tanpa JavaScript */}
        <form action="/semua" method="get" role="search" className="relative">
          {status !== "aktif" && (
            <input type="hidden" name="status" value={status} />
          )}
          {kategori && <input type="hidden" name="kategori" value={kategori} />}
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ash"
          />
          <label htmlFor="cari" className="sr-only">
            Cari tugas
          </label>
          <input
            id="cari"
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Cari tugas, tekan Enter..."
            className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-3.5 text-sm text-ivory placeholder:text-ash/60 transition focus:border-lime focus:outline-none focus:ring-2 focus:ring-lime/25"
          />
        </form>

        {/* Filter status */}
        <div className="flex flex-wrap gap-1.5" aria-label="Filter status">
          {STATUS_TABS.map((s) => (
            <Link
              key={s.value}
              href={filterUrl(searchParams, { status: s.value })}
              aria-current={status === s.value ? "true" : undefined}
              className={chipCls(status === s.value)}
            >
              {status === s.value && (
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-lime" />
              )}
              {s.label}
            </Link>
          ))}
        </div>

        {/* Filter kategori — chip aktif bisa dihapus satu per satu */}
        <div className="flex flex-wrap gap-1.5" aria-label="Filter kategori">
          {categories.map((c) =>
            kategori === c ? (
              <Link
                key={c}
                href={filterUrl(searchParams, { kategori: undefined })}
                title={`Hapus filter ${c}`}
                className={chipCls(true)}
              >
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-lime" />
                {c}
                <X className="h-3 w-3" aria-hidden />
              </Link>
            ) : (
              <Link
                key={c}
                href={filterUrl(searchParams, { kategori: c })}
                className={chipCls(false)}
              >
                {c}
              </Link>
            )
          )}
          {adaFilter && (
            <Link
              href="/semua"
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full px-3.5 py-1 text-xs text-coral transition hover:bg-coral/10"
            >
              <X className="h-3 w-3" aria-hidden />
              Hapus semua filter
            </Link>
          )}
        </div>

        {/* Daftar / empty state / no-result state */}
        {tasks.length === 0 ? (
          <section className="rounded-card border border-line bg-surface p-10 text-center">
            <span
              aria-hidden
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-line bg-moss"
            >
              <SearchX className="h-6 w-6 text-lavender" />
            </span>
            <p className="mt-4 font-display text-lg font-bold">
              {q ? `Tidak ada hasil untuk "${q}"` : "Tidak ada tugas di sini"}
            </p>
            <p className="mx-auto mt-1 max-w-xs text-sm leading-relaxed text-ash">
              {adaFilter
                ? "Coba ubah kata kunci atau hapus sebagian filter."
                : "Tambahkan tugas pertamamu dari halaman Hari Ini."}
            </p>
            {adaFilter && (
              <Link
                href="/semua"
                className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-line bg-moss px-4 py-2.5 text-sm text-ivory transition hover:brightness-125"
              >
                <X className="h-4 w-4" aria-hidden />
                Hapus semua filter
              </Link>
            )}
          </section>
        ) : (
          <ul className="divide-y divide-line/60 rounded-card border border-line bg-surface px-1.5 py-1">
            {tasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
