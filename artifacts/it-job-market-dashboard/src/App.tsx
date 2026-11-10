import { lazy, Suspense, useMemo } from 'react';
import {
  BarChart3,
  BriefcaseBusiness,
  MapPin,
  Moon,
  Sun,
  TrendingUp,
  UsersRound,
} from 'lucide-react';
import { ErrorBoundary, type ErrorFallbackProps } from '@/components/error-boundary';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { MetricCard } from '@/components/metric-card';
import { FilterBar } from '@/features/filters/FilterBar';
import { JobsTable } from '@/features/table/JobsTable';
import { useFilteredJobs } from '@/hooks/use-filtered-jobs';
import { useJobFilters } from '@/hooks/use-job-filters';
import { useJobs } from '@/hooks/use-jobs';
import { useTheme } from '@/hooks/use-theme';
import { vi } from '@/i18n/vi';
import { averageSalary, mostRequestedSkill, topCity } from '@/utils/jobs';

const MarketCharts = lazy(() =>
  import('@/features/charts/MarketCharts').then((module) => ({
    default: module.MarketCharts,
  })),
);

function formatMoney(value: number) {
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(value);
}

function ErrorState({ message, retry }: { message: string; retry: () => void }) {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-background px-5">
      <div className="max-w-md rounded-2xl border border-card-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent/10 text-accent">
          <BarChart3 aria-hidden="true" />
        </div>
        <h1 className="mt-4 font-serif text-xl font-bold">{vi.loadingError}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <button
          type="button"
          data-testid="button-retry-data"
          onClick={retry}
          className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {vi.retry}
        </button>
      </div>
    </main>
  );
}

function DashboardError({ resetError }: ErrorFallbackProps) {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-background px-5">
      <div className="max-w-md rounded-2xl border border-card-border bg-card p-8 text-center shadow-sm">
        <h1 className="font-serif text-xl font-bold">{vi.unexpectedErrorTitle}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{vi.unexpectedErrorDescription}</p>
        <button
          type="button"
          onClick={resetError}
          className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {vi.retryView}
        </button>
      </div>
    </main>
  );
}

function Dashboard() {
  const { filters, setFilters } = useJobFilters();
  const { jobs, loading, error, retry } = useJobs();
  const { dark, toggle } = useTheme();
  const filteredJobs = useFilteredJobs(jobs, filters);
  const allSkills = useMemo(
    () => [...new Set(jobs.flatMap((job) => job.skills))].sort((a, b) => a.localeCompare(b, 'vi')),
    [jobs],
  );
  const metrics = useMemo(
    () => ({
      average: averageSalary(filteredJobs),
      skill: mostRequestedSkill(filteredJobs),
      city: topCity(filteredJobs),
    }),
    [filteredJobs],
  );

  if (loading) return <LoadingSkeleton />;
  if (error) {
    return <ErrorState message={error} retry={retry} />;
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="border-b border-border bg-card/80">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-4 sm:px-8">
          <a href="#tong-quan" className="flex items-center gap-3" data-testid="link-home">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <BarChart3 size={19} aria-hidden="true" />
            </span>
            <span className="font-serif text-sm font-extrabold tracking-tight">
              {vi.brand}
              <span className="ml-2 hidden rounded-full bg-accent/10 px-2 py-1 font-sans text-[9px] font-bold uppercase tracking-[.14em] text-accent sm:inline">
                {vi.regionStamp}
              </span>
            </span>
          </a>
          <nav
            className="hidden items-center gap-6 text-xs font-semibold text-muted-foreground md:flex"
            aria-label={vi.mainNavigation}
          >
            <a
              className="text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              href="#tong-quan"
              data-testid="link-overview"
            >
              {vi.overview}
            </a>
            <a
              className="hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              href="#phan-tich"
              data-testid="link-analysis"
            >
              {vi.analysis}
            </a>
            <a
              className="hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              href="#co-hoi"
              data-testid="link-opportunities"
            >
              {vi.opportunities}
            </a>
          </nav>
          <button
            type="button"
            onClick={toggle}
            aria-label={dark ? vi.themeLight : vi.themeDark}
            data-testid="theme-toggle"
            className="grid h-9 w-9 place-items-center rounded-xl border border-border text-muted-foreground hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {dark ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] space-y-8 px-4 pb-10 pt-7 sm:px-8 sm:pt-10">
        <section
          id="tong-quan"
          className="reveal relative overflow-hidden rounded-[1.6rem] bg-[#183a39] px-6 py-8 text-[#f2eee3] sm:px-10 sm:py-10"
        >
          <div
            className="pointer-events-none absolute -right-12 -top-28 h-72 w-72 rounded-full border border-white/10"
            aria-hidden="true"
          />
          <div className="relative max-w-3xl">
            <p className="font-mono text-[10px] font-medium tracking-[.2em] text-[#a8d8c4]">
              {vi.eyebrow}
            </p>
            <h1 className="mt-4 font-serif text-4xl font-extrabold leading-[1.05] tracking-[-.045em] sm:text-5xl lg:text-6xl">
              {vi.title}
              <br />
              <span className="text-[#a8d8c4]">{vi.titleAccent}</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-[#d5e1d7] sm:text-base">
              {vi.subtitle}
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 font-mono text-[10px] text-[#e1e8de]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f2a078]" aria-hidden="true" />
              {vi.updated}
            </div>
            <span className="ml-2 rounded-full bg-white/10 px-2 py-1 font-mono text-[9px] tracking-wider">
              {vi.sampleLabel}
            </span>
          </div>
        </section>

        <section
          aria-label={vi.selectionHeading}
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        >
          <MetricCard
            label={vi.jobCount}
            value={filteredJobs.length.toLocaleString('vi-VN')}
            note={vi.jobsUnit}
            icon={BriefcaseBusiness}
            accent="bg-primary/10 text-primary"
          />
          <MetricCard
            label={vi.avgSalary}
            value={`${formatMoney(metrics.average)} tr`}
            note={vi.salaryUnit}
            icon={TrendingUp}
            accent="bg-accent/10 text-accent"
          />
          <MetricCard
            label={vi.topSkill}
            value={metrics.skill}
            note={vi.skillFrequencyNote}
            icon={BarChart3}
            accent="bg-chart-3/15 text-[hsl(var(--chart-3))]"
          />
          <MetricCard
            label={vi.topCity}
            value={vi.cities[metrics.city as keyof typeof vi.cities] ?? metrics.city}
            note={vi.topCityNote}
            icon={MapPin}
            accent="bg-chart-4/15 text-[hsl(var(--chart-4))]"
          />
        </section>

        <FilterBar filters={filters} setFilters={setFilters} skills={allSkills} />

        <section id="phan-tich" className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] tracking-[.16em] text-primary">
                01 / {vi.signalLabel}
              </p>
              <h2 className="mt-1 font-serif text-2xl font-extrabold tracking-tight">
                {vi.chartsTitle}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">{vi.chartsCaption}</p>
          </div>
          <Suspense
            fallback={
              <div
                className="grid gap-4 md:grid-cols-2 xl:grid-cols-6"
                aria-label={vi.loadingCharts}
                aria-busy="true"
              >
                {Array.from({ length: 5 }, (_, index) => (
                  <div
                    key={index}
                    className="h-72 animate-pulse rounded-2xl bg-muted xl:col-span-2"
                  />
                ))}
              </div>
            }
          >
            <MarketCharts jobs={filteredJobs} />
          </Suspense>
        </section>

        <section id="co-hoi" className="space-y-4">
          <div className="flex items-end gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent/10 text-accent">
              <UsersRound size={17} aria-hidden="true" />
            </span>
            <div>
              <p className="font-mono text-[10px] tracking-[.16em] text-primary">
                02 / {vi.openingPositions}
              </p>
              <h2 className="mt-1 font-serif text-2xl font-extrabold tracking-tight">
                {vi.listings}
              </h2>
            </div>
          </div>
          <JobsTable jobs={filteredJobs} />
        </section>

        <footer className="flex flex-col gap-2 border-t border-border pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>{vi.dataNote}</span>
          <span className="font-mono">{vi.brand.toLocaleUpperCase('vi')}</span>
        </footer>
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={DashboardError}>
      <Dashboard />
    </ErrorBoundary>
  );
}

export default App;
