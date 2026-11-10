import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  BriefcaseBusiness,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Moon,
  Search,
  Sun,
  TrendingUp,
  UsersRound,
  X,
} from 'lucide-react';
import { ErrorBoundary, type ErrorFallbackProps } from '@/components/error-boundary';
import { useJobs } from '@/hooks/use-jobs';
import { loadSampleJobs } from '@/data/loadJobs';
import { MetricCard } from '@/components/metric-card';
import { SkillTag } from '@/components/skill-tag';
import {
  emptyFilters,
  averageSalary,
  filterJobs,
  mostRequestedSkill,
  sortJobs,
  topCity,
} from '@/utils/jobs';
import type { JobFilters, SortDirection, SortKey } from '@/types/job';
import { vi } from '@/i18n/vi';

const MarketCharts = lazy(() =>
  import('@/components/market-charts').then((module) => ({ default: module.MarketCharts })),
);
const roles = [
  'AI Engineer',
  'Backend Developer',
  'Data Analyst',
  'Data Engineer',
  'DevOps Engineer',
  'Frontend Developer',
  'Full-stack Developer',
  'Mobile Developer',
  'Product Manager',
  'QA Engineer',
  'Security Engineer',
  'UI/UX Designer',
];
const cities = ['Bình Dương', 'Cần Thơ', 'Đà Nẵng', 'Hà Nội', 'Hải Phòng', 'Hồ Chí Minh'];
const levels = ['Intern', 'Junior', 'Middle', 'Senior', 'Lead'];
const formatMoney = (value: number) =>
  new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(value);

function readFilters(): JobFilters {
  if (typeof window === 'undefined') return { ...emptyFilters };
  const params = new URLSearchParams(window.location.search);
  return {
    role: params.get('role') ?? '',
    city: params.get('city') ?? '',
    level: params.get('level') ?? '',
    skills: params.get('skills')?.split(',').filter(Boolean) ?? [],
    minSalary: Number(params.get('min') ?? 0),
    maxSalary: Number(params.get('max') ?? 100),
    keyword: params.get('q') ?? '',
  };
}

function useTheme() {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('it-market-theme');
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('it-market-theme', dark ? 'dark' : 'light');
  }, [dark]);
  return { dark, toggle: () => setDark((value) => !value) };
}

function Skeleton() {
  return (
    <main className="min-h-[100dvh] bg-background px-4 py-7 sm:px-8">
      <div className="mx-auto max-w-[1440px] animate-pulse space-y-7">
        <div className="h-8 w-48 rounded bg-muted" />
        <div className="h-24 max-w-2xl rounded-xl bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-muted" />
          ))}
        </div>
        <div className="h-20 rounded-2xl bg-muted" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-72 rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
    </main>
  );
}

function ErrorState({ message, retry }: { message: string; retry: () => void }) {
  return (
    <div className="grid min-h-[100dvh] place-items-center bg-background px-5">
      <div className="max-w-md rounded-2xl border border-card-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent/10 text-accent">
          <BarChart3 />
        </div>
        <h1 className="mt-4 font-serif text-xl font-bold">{vi.loadingError}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <button
          onClick={retry}
          className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          {vi.retry}
        </button>
      </div>
    </div>
  );
}

function DashboardError({ resetError }: ErrorFallbackProps) {
  return (
    <div className="grid min-h-[100dvh] place-items-center bg-background px-5">
      <div className="max-w-md rounded-2xl border border-card-border bg-card p-8 text-center shadow-sm">
        <h1 className="font-serif text-xl font-bold">{vi.unexpectedErrorTitle}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{vi.unexpectedErrorDescription}</p>
        <button
          onClick={resetError}
          className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          {vi.retryView}
        </button>
      </div>
    </div>
  );
}

function FilterBar({
  filters,
  setFilters,
  skills,
}: {
  filters: JobFilters;
  setFilters: (next: JobFilters) => void;
  skills: string[];
}) {
  const selectedCount = [
    filters.role,
    filters.city,
    filters.level,
    filters.keyword,
    filters.skills.length > 0,
    filters.minSalary > 0,
    filters.maxSalary < 100,
  ].filter(Boolean).length;
  const update = (patch: Partial<JobFilters>) => setFilters({ ...filters, ...patch });
  const toggleSkill = (skill: string) =>
    update({
      skills: filters.skills.includes(skill)
        ? filters.skills.filter((item) => item !== skill)
        : [...filters.skills, skill],
    });
  return (
    <section
      aria-label={vi.filters}
      className="rounded-2xl border border-card-border bg-card p-4 shadow-sm sm:p-5"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <Search size={16} />
          </span>
          <div>
            <h2 className="text-sm font-bold">{vi.filters}</h2>
            <p className="text-xs text-muted-foreground">
              {selectedCount ? `${selectedCount} ${vi.activeFilters}` : vi.filterHint}
            </p>
          </div>
        </div>
        {selectedCount > 0 && (
          <button
            data-testid="button-reset-filters"
            onClick={() => setFilters({ ...emptyFilters })}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/10"
          >
            <X size={13} />
            {vi.reset}
          </button>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <label className="text-xs font-semibold text-muted-foreground sm:col-span-2 xl:col-span-2">
          {vi.keyword}
          <span className="relative mt-1.5 block">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={15}
            />
            <input
              aria-label={vi.keyword}
              data-testid="filter-keyword"
              value={filters.keyword}
              onChange={(event) => update({ keyword: event.target.value })}
              placeholder={vi.keywordPlaceholder}
              className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm font-normal text-foreground placeholder:text-muted-foreground"
            />
          </span>
        </label>
        <label className="text-xs font-semibold text-muted-foreground">
          {vi.role}
          <select
            aria-label={vi.role}
            data-testid="filter-role"
            value={filters.role}
            onChange={(event) => update({ role: event.target.value })}
            className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal text-foreground"
          >
            <option value="">{vi.allRoles}</option>
            {roles.map((role) => (
              <option key={role}>{role}</option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-muted-foreground">
          {vi.city}
          <select
            aria-label={vi.city}
            data-testid="filter-city"
            value={filters.city}
            onChange={(event) => update({ city: event.target.value })}
            className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal text-foreground"
          >
            <option value="">{vi.allCities}</option>
            {cities.map((city) => (
              <option key={city}>{city}</option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-muted-foreground">
          {vi.level}
          <select
            aria-label={vi.level}
            data-testid="filter-level"
            value={filters.level}
            onChange={(event) => update({ level: event.target.value })}
            className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal text-foreground"
          >
            <option value="">{vi.allLevels}</option>
            {levels.map((level) => (
              <option key={level}>{level}</option>
            ))}
          </select>
        </label>
        <div className="text-xs font-semibold text-muted-foreground">
          {vi.skills}
          <details className="group relative mt-1.5">
            <summary className="flex h-10 cursor-pointer list-none items-center justify-between rounded-lg border border-input bg-background px-3 text-sm font-normal text-foreground">
              <span className="truncate">
                {filters.skills.length
                  ? `${filters.skills.length} ${vi.selectedSkills}`
                  : vi.anySkill}
              </span>
              <ChevronDown size={15} className="text-muted-foreground" />
            </summary>
            <div
              className="absolute right-0 z-20 mt-2 max-h-64 w-56 overflow-auto rounded-xl border border-card-border bg-card p-2 shadow-xl"
              role="group"
              aria-label={vi.skills}
            >
              {skills.map((skill) => (
                <label
                  key={skill}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm font-normal text-foreground hover:bg-muted"
                >
                  <input
                    type="checkbox"
                    data-testid={`filter-skill-${skill}`}
                    checked={filters.skills.includes(skill)}
                    onChange={() => toggleSkill(skill)}
                    className="accent-primary"
                  />
                  {skill}
                </label>
              ))}
            </div>
          </details>
        </div>
        <div className="text-xs font-semibold text-muted-foreground sm:col-span-2 lg:col-span-3 xl:col-span-2">
          {vi.salary} <span className="font-normal">({vi.salaryUnit})</span>
          <div className="mt-1.5 flex items-center gap-2">
            <input
              aria-label={vi.minSalary}
              data-testid="filter-min-salary"
              type="number"
              min="0"
              max={filters.maxSalary}
              value={filters.minSalary}
              onChange={(event) => update({ minSalary: Math.max(0, Number(event.target.value)) })}
              className="h-10 min-w-0 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal text-foreground"
            />
            <span className="text-muted-foreground">—</span>
            <input
              aria-label={vi.maxSalary}
              data-testid="filter-max-salary"
              type="number"
              min={filters.minSalary}
              max="100"
              value={filters.maxSalary}
              onChange={(event) => update({ maxSalary: Math.min(100, Number(event.target.value)) })}
              className="h-10 min-w-0 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal text-foreground"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function JobsTable({ jobs }: { jobs: ReturnType<typeof sortJobs> }) {
  const [sortKey, setSortKey] = useState<SortKey>('postedDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [page, setPage] = useState(1);
  const sorted = useMemo(
    () => sortJobs(jobs, sortKey, sortDirection),
    [jobs, sortKey, sortDirection],
  );
  const pageCount = Math.max(1, Math.ceil(sorted.length / 10));
  const rows = sorted.slice((page - 1) * 10, page * 10);
  useEffect(() => {
    setPage(1);
  }, [jobs]);
  const sortButton = (label: string, key: SortKey) => (
    <button
      data-testid={`sort-${key}`}
      className="inline-flex items-center gap-1 text-left hover:text-primary"
      onClick={() => {
        if (sortKey === key) setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        else {
          setSortKey(key);
          setSortDirection('asc');
        }
      }}
    >
      {label}
      <span aria-hidden="true">
        {sortKey === key ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
      </span>
    </button>
  );
  return (
    <section className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          <h2 className="font-serif text-lg font-extrabold">{vi.listings}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{vi.listingCaption}</p>
        </div>
        <span
          className="rounded-full bg-primary/10 px-3 py-1.5 font-mono text-xs font-medium text-primary"
          data-testid="results-count"
        >
          {jobs.length.toLocaleString('vi-VN')} {vi.searchResults}
        </span>
      </div>
      {jobs.length === 0 ? (
        <div
          className="grid min-h-64 place-items-center px-5 py-12 text-center"
          data-testid="empty-state"
        >
          <div>
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-muted text-muted-foreground">
              <Search />
            </span>
            <h3 className="mt-4 font-serif text-lg font-bold">{vi.emptyTitle}</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">{vi.emptyDescription}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[930px] border-collapse text-left text-sm">
              <thead className="bg-muted/70 text-[11px] font-bold uppercase tracking-[.09em] text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">{sortButton(vi.position, 'title')}</th>
                  <th className="px-4 py-3">{sortButton(vi.company, 'company')}</th>
                  <th className="px-4 py-3">{sortButton(vi.location, 'city')}</th>
                  <th className="px-4 py-3">{sortButton(vi.level, 'level')}</th>
                  <th className="px-4 py-3">{vi.skills}</th>
                  <th className="px-4 py-3">{sortButton(vi.salaryColumn, 'salaryMin')}</th>
                  <th className="px-5 py-3">{sortButton(vi.posted, 'postedDate')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((job) => (
                  <tr
                    key={job.id}
                    data-testid={`row-job-${job.id}`}
                    className="border-t border-border/80 transition-colors hover:bg-muted/45"
                  >
                    <td className="max-w-[210px] px-5 py-4">
                      <p className="truncate font-semibold text-foreground">{job.title}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">{job.employmentType}</p>
                    </td>
                    <td className="px-4 py-4 font-medium">{job.company}</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                        <MapPin size={13} className="text-accent" />
                        {job.city}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-md bg-secondary px-2 py-1 text-xs font-semibold">
                        {job.level}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex max-w-[235px] flex-wrap gap-1.5">
                        {job.skills.slice(0, 3).map((skill) => (
                          <SkillTag key={skill} name={skill} />
                        ))}
                        {job.skills.length > 3 && (
                          <span className="px-1 py-1 text-[11px] text-muted-foreground">
                            +{job.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 font-mono text-xs font-semibold">
                      {job.salaryMin}–{job.salaryMax}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-muted-foreground">
                      {new Date(`${job.postedDate}T00:00:00`).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-border px-5 py-3">
            <p className="text-xs text-muted-foreground">
              {vi.page} <span className="font-mono font-semibold text-foreground">{page}</span> /{' '}
              {pageCount}
            </p>
            <div className="flex gap-2">
              <button
                aria-label={vi.previous}
                data-testid="pagination-previous"
                disabled={page === 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                aria-label={vi.next}
                data-testid="pagination-next"
                disabled={page >= pageCount}
                onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
                className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function Dashboard() {
  const [filters, setFilters] = useState<JobFilters>(readFilters);
  const [attempt, setAttempt] = useState(0);
  const loader = useCallback(() => loadSampleJobs(), [attempt]);
  const { jobs, loading, error } = useJobs(loader);
  const { dark, toggle } = useTheme();
  const filtered = useMemo(() => filterJobs(jobs, filters), [jobs, filters]);
  const allSkills = useMemo(
    () => [...new Set(jobs.flatMap((job) => job.skills))].sort((a, b) => a.localeCompare(b, 'vi')),
    [jobs],
  );
  const avg = useMemo(() => averageSalary(filtered), [filtered]);
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.role) params.set('role', filters.role);
    if (filters.city) params.set('city', filters.city);
    if (filters.level) params.set('level', filters.level);
    if (filters.skills.length) params.set('skills', filters.skills.join(','));
    if (filters.minSalary) params.set('min', String(filters.minSalary));
    if (filters.maxSalary < 100) params.set('max', String(filters.maxSalary));
    if (filters.keyword.trim()) params.set('q', filters.keyword.trim());
    const query = params.toString();
    window.history.replaceState({}, '', `${window.location.pathname}${query ? `?${query}` : ''}`);
  }, [filters]);
  useEffect(() => {
    const onPopState = () => setFilters(readFilters());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);
  if (loading) return <Skeleton />;
  if (error) return <ErrorState message={error} retry={() => setAttempt((value) => value + 1)} />;
  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="border-b border-border bg-card/80">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <BarChart3 size={19} />
            </span>
            <span className="font-serif text-sm font-extrabold tracking-tight">
              {vi.brand}
              <span className="ml-2 hidden rounded-full bg-accent/10 px-2 py-1 font-sans text-[9px] font-bold uppercase tracking-[.14em] text-accent sm:inline">
                {vi.regionStamp}
              </span>
            </span>
          </div>
          <nav
            className="hidden items-center gap-6 text-xs font-semibold text-muted-foreground md:flex"
            aria-label={vi.mainNavigation}
          >
            <a className="text-primary" href="#tong-quan" data-testid="link-overview">
              {vi.overview}
            </a>
            <a className="hover:text-primary" href="#phan-tich" data-testid="link-analysis">
              {vi.analysis}
            </a>
            <a className="hover:text-primary" href="#co-hoi" data-testid="link-opportunities">
              {vi.opportunities}
            </a>
          </nav>
          <button
            onClick={toggle}
            aria-label={dark ? vi.themeLight : vi.themeDark}
            data-testid="theme-toggle"
            className="grid h-9 w-9 place-items-center rounded-xl border border-border text-muted-foreground hover:bg-muted"
          >
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-[1440px] space-y-8 px-4 pb-10 pt-7 sm:px-8 sm:pt-10">
        <section
          id="tong-quan"
          className="reveal relative overflow-hidden rounded-[1.6rem] bg-[#183a39] px-6 py-8 text-[#f2eee3] sm:px-10 sm:py-10"
        >
          <div className="pointer-events-none absolute -right-12 -top-28 h-72 w-72 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-2 -top-18 h-52 w-52 rounded-full border border-white/10" />
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
              <span className="h-1.5 w-1.5 rounded-full bg-[#f2a078]" />
              {vi.updated}
            </div>
          </div>
          <div
            className="absolute bottom-7 right-9 hidden items-end gap-2 opacity-60 lg:flex"
            aria-hidden="true"
          >
            {[30, 52, 42, 72, 58, 88, 68, 100, 78, 115].map((height, index) => (
              <span key={index} className="w-2 rounded-t-sm bg-[#a8d8c4]" style={{ height }} />
            ))}
          </div>
        </section>

        <section
          aria-label={vi.selectionHeading}
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        >
          <MetricCard
            label={vi.jobCount}
            value={filtered.length.toLocaleString('vi-VN')}
            note={vi.jobsUnit}
            icon={BriefcaseBusiness}
            accent="bg-primary/10 text-primary"
          />
          <MetricCard
            label={vi.avgSalary}
            value={`${formatMoney(avg)} tr`}
            note={vi.salaryUnit}
            icon={TrendingUp}
            accent="bg-accent/10 text-accent"
          />
          <MetricCard
            label={vi.topSkill}
            value={mostRequestedSkill(filtered)}
            note={vi.skillFrequencyNote}
            icon={BarChart3}
            accent="bg-chart-3/15 text-[hsl(var(--chart-3))]"
          />
          <MetricCard
            label={vi.topCity}
            value={topCity(filtered)}
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
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="h-72 animate-pulse rounded-2xl bg-muted xl:col-span-2" />
                ))}
              </div>
            }
          >
            <MarketCharts jobs={filtered} />
          </Suspense>
        </section>

        <section id="co-hoi" className="space-y-4">
          <div className="flex items-end gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent/10 text-accent">
              <UsersRound size={17} />
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
          <JobsTable jobs={filtered} />
        </section>
        <footer className="flex flex-col gap-2 border-t border-border pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>{vi.dataNote}</span>
          <span className="font-mono">
            {vi.brand.toLocaleUpperCase('vi')} <span className="mx-1 text-accent">/</span>{' '}
            10.11.2026
          </span>
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
