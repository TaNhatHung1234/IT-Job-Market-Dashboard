import type { LucideIcon } from 'lucide-react';

export function MetricCard({
  label,
  value,
  note,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  note: string;
  icon: LucideIcon;
  accent: string;
}) {
  return (
    <article
      data-testid={`metric-${label}`}
      className="rounded-2xl border border-card-border bg-card p-5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.12em] text-muted-foreground">
            {label}
          </p>
          <p
            className="mt-3 font-serif text-[1.7rem] font-extrabold leading-none tracking-tight"
            data-testid="metric-value"
          >
            {value}
          </p>
        </div>
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${accent}`}>
          <Icon size={18} aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{note}</p>
    </article>
  );
}
