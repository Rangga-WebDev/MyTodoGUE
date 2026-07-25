import Link from "next/link";
import { ListTodo, Orbit, Plus, Sun } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

const NAV = [
  { key: "hari-ini", href: "/", label: "Hari Ini", icon: Sun },
  { key: "semua", href: "/semua", label: "Semua Tugas", icon: ListTodo },
] as const;

function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface">
        <Orbit className="h-4 w-4 text-lime" aria-hidden />
      </span>
      <span className="font-display text-lg font-bold tracking-wide">
        Orbitask
      </span>
    </span>
  );
}

export default function AppShell({
  active,
  email,
  children,
}: {
  active: (typeof NAV)[number]["key"];
  email?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl">
      {/* ===== Sidebar (desktop) ===== */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-6 border-r border-line p-5 md:flex">
        <Link href="/" aria-label="Beranda Orbitask">
          <Logo />
        </Link>

        <Link
          href="/#tambah"
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-lime px-4 py-2.5 text-sm font-semibold text-obsidian transition hover:-translate-y-0.5 hover:brightness-110"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Tugas baru
        </Link>

        <nav aria-label="Navigasi utama" className="flex flex-col gap-1">
          {NAV.map(({ key, href, label, icon: Icon }) => (
            <Link
              key={key}
              href={href}
              aria-current={active === key ? "page" : undefined}
              className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                active === key
                  ? "bg-moss text-ivory"
                  : "text-ash hover:bg-moss/60 hover:text-ivory"
              }`}
            >
              {active === key && (
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-lime"
                />
              )}
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-line pt-4">
          <p className="min-w-0 truncate text-xs text-ash" title={email ?? ""}>
            {email}
          </p>
          <LogoutButton />
        </div>
      </aside>

      {/* ===== Konten + header mobile ===== */}
      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-line px-4 py-3 md:hidden">
          <Link href="/" aria-label="Beranda Orbitask">
            <Logo />
          </Link>
          <LogoutButton />
        </header>

        <div className="pb-28 md:pb-8">{children}</div>
      </div>

      {/* ===== Bottom navigation (mobile) ===== */}
      <nav
        aria-label="Navigasi bawah"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur md:hidden"
      >
        <div className="mx-auto flex max-w-md items-center justify-around px-6 py-2">
          <Link
            href="/"
            aria-current={active === "hari-ini" ? "page" : undefined}
            className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-xl px-3 text-[11px] ${
              active === "hari-ini" ? "text-lime" : "text-ash"
            }`}
          >
            <Sun className="h-5 w-5" aria-hidden />
            Hari Ini
          </Link>

          <Link
            href="/#tambah"
            aria-label="Tambah tugas"
            className="-mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-lime text-obsidian shadow-lg shadow-black/40 transition hover:brightness-110"
          >
            <Plus className="h-6 w-6" aria-hidden />
          </Link>

          <Link
            href="/semua"
            aria-current={active === "semua" ? "page" : undefined}
            className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-xl px-3 text-[11px] ${
              active === "semua" ? "text-lime" : "text-ash"
            }`}
          >
            <ListTodo className="h-5 w-5" aria-hidden />
            Semua
          </Link>
        </div>
      </nav>
    </div>
  );
}
