import { vi } from '@/i18n/vi';

export function LoadingSkeleton() {
  return (
    <main
      className="min-h-[100dvh] bg-background px-4 py-7 sm:px-8"
      aria-label={vi.loading}
      aria-busy="true"
    >
      <div className="mx-auto max-w-[1440px] animate-pulse space-y-7">
        <div className="h-8 w-48 rounded bg-muted" />
        <div className="h-48 max-w-3xl rounded-2xl bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-32 rounded-2xl bg-muted" />
          ))}
        </div>
        <div className="h-36 rounded-2xl bg-muted" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="h-64 rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
    </main>
  );
}
