// Progress ring SVG — bebas dipakai di Server maupun Client Component.
export default function ProgressRing({
  value,
  size = 96,
  stroke = 8,
  label,
}: {
  value: number; // 0-100
  size?: number;
  stroke?: number;
  label?: string;
}) {
  const clamped = Math.min(Math.max(value, 0), 100);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - clamped / 100);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={label ?? `Progres ${Math.round(clamped)} persen`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--color-border)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="transition-[stroke-dashoffset] duration-700 ease-out"
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fill="var(--color-text-primary)"
        fontSize={size * 0.22}
        fontWeight={700}
        className="font-display"
      >
        {Math.round(clamped)}%
      </text>
    </svg>
  );
}
