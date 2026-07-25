// Semua perhitungan tanggal memakai zona WIB, tidak peduli server
// jalan di zona waktu mana (Vercel = UTC).
// Locale "en-CA" dipakai karena formatnya persis YYYY-MM-DD.
export function dateWIB(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
  }).format(d);
}

export function todayWIB(): string {
  return dateWIB(new Date());
}

// Tanggal n hari yang lalu (YYYY-MM-DD) menurut WIB
export function daysAgoWIB(n: number): string {
  return dateWIB(new Date(Date.now() - n * 86400000));
}

// Jam saat ini (0-23) menurut WIB — untuk sapaan pagi/siang/sore/malam
export function jamWIB(): number {
  return Number(
    new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      hour12: false,
      timeZone: "Asia/Jakarta",
    }).format(new Date())
  );
}

// Format tampilan singkat, misal "26 Jul"
export function formatTanggal(dateStr: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
  }).format(new Date(dateStr + "T00:00:00"));
}

// Label panjang untuk header, misal "Minggu, 26 Juli 2026"
export function todayLabel(): string {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date());
}
