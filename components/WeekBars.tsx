// Mini bar chart 7 hari — tanpa library, mengikuti warna tema.
export type DayBar = {
  label: string; // "Sen", "Sel", ...
  value: number;
  isToday?: boolean;
};

export default function WeekBars({ data }: { data: DayBar[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div
      className="flex items-end gap-1.5"
      role="img"
      aria-label={`Tugas selesai 7 hari terakhir: ${data
        .map((d) => `${d.label} ${d.value}`)
        .join(", ")}`}
    >
      {data.map((d) => (
        <div
          key={d.label}
          className="flex flex-1 flex-col items-center gap-1.5"
          title={`${d.label}: ${d.value} tugas selesai`}
        >
          <div className="flex h-16 w-full items-end">
            <div
              style={{ height: `${Math.max((d.value / max) * 100, 4)}%` }}
              className={`w-full rounded-t-md transition-all ${
                d.isToday ? "bg-lime" : "bg-moss"
              }`}
            />
          </div>
          <span
            className={`text-[10px] ${
              d.isToday ? "font-semibold text-lime" : "text-ash"
            }`}
          >
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}
