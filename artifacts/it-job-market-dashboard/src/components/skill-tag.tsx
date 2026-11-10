export function SkillTag({ name }: { name: string }) {
  return (
    <span
      data-testid={`skill-${name}`}
      className="inline-flex items-center rounded-md border border-primary/20 bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary"
    >
      {name}
    </span>
  );
}
