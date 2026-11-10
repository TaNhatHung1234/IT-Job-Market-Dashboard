import { ChevronDown, Search, X } from 'lucide-react';
import { JOB_CITIES, JOB_LEVELS, JOB_ROLES, type JobFilters } from '@/types/job';
import { emptyFilters } from '@/utils/jobs';
import { vi } from '@/i18n/vi';

interface FilterBarProps {
  filters: JobFilters;
  setFilters: (next: JobFilters) => void;
  skills: string[];
}

export function FilterBar({ filters, setFilters, skills }: FilterBarProps) {
  const activeCount = [
    Boolean(filters.role),
    Boolean(filters.city),
    Boolean(filters.level),
    Boolean(filters.keyword.trim()),
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
            <Search size={16} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-sm font-bold">{vi.filters}</h2>
            <p className="text-xs text-muted-foreground" data-testid="active-filters-count">
              {activeCount ? `${activeCount} ${vi.activeFilters}` : vi.filterHint}
            </p>
          </div>
        </div>
        {activeCount > 0 && (
          <button
            type="button"
            data-testid="button-reset-filters"
            onClick={() => setFilters({ ...emptyFilters, skills: [] })}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <X size={13} aria-hidden="true" />
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
              aria-hidden="true"
            />
            <input
              type="search"
              aria-label={vi.keyword}
              data-testid="filter-keyword"
              value={filters.keyword}
              onChange={(event) => update({ keyword: event.target.value })}
              placeholder={vi.keywordPlaceholder}
              className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm font-normal text-foreground placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
          </span>
        </label>

        <label className="text-xs font-semibold text-muted-foreground">
          {vi.role}
          <select
            aria-label={vi.role}
            data-testid="filter-role"
            value={filters.role}
            onChange={(event) => update({ role: event.target.value as JobFilters['role'] })}
            className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <option value="">{vi.allRoles}</option>
            {JOB_ROLES.map((role) => (
              <option key={role} value={role}>
                {vi.roles[role]}
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs font-semibold text-muted-foreground">
          {vi.city}
          <select
            aria-label={vi.city}
            data-testid="filter-city"
            value={filters.city}
            onChange={(event) => update({ city: event.target.value as JobFilters['city'] })}
            className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <option value="">{vi.allCities}</option>
            {JOB_CITIES.map((city) => (
              <option key={city} value={city}>
                {vi.cities[city]}
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs font-semibold text-muted-foreground">
          {vi.level}
          <select
            aria-label={vi.level}
            data-testid="filter-level"
            value={filters.level}
            onChange={(event) => update({ level: event.target.value as JobFilters['level'] })}
            className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <option value="">{vi.allLevels}</option>
            {JOB_LEVELS.map((level) => (
              <option key={level} value={level}>
                {vi.levels[level]}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="min-w-0 text-xs font-semibold text-muted-foreground">
          <legend>{vi.skills}</legend>
          <details className="group relative mt-1.5">
            <summary
              data-testid="filter-skills-toggle"
              className="flex h-10 cursor-pointer list-none items-center justify-between rounded-lg border border-input bg-background px-3 text-sm font-normal text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <span className="truncate">
                {filters.skills.length
                  ? `${filters.skills.length} ${vi.selectedSkills}`
                  : vi.anySkill}
              </span>
              <ChevronDown size={15} className="text-muted-foreground" aria-hidden="true" />
            </summary>
            <div
              className="absolute left-0 z-20 mt-2 max-h-64 w-56 overflow-auto rounded-xl border border-card-border bg-card p-2 shadow-xl sm:left-auto sm:right-0"
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
        </fieldset>

        <fieldset className="min-w-0 text-xs font-semibold text-muted-foreground sm:col-span-2 lg:col-span-3 xl:col-span-2">
          <legend>
            {vi.salary} <span className="font-normal">({vi.salaryUnit})</span>
          </legend>
          <div className="mt-1.5 grid grid-cols-2 gap-x-4">
            <label className="text-[11px] font-normal">
              {vi.minSalary}: <output>{filters.minSalary}</output>
              <input
                type="range"
                aria-label={vi.minSalary}
                data-testid="filter-min-salary"
                min="0"
                max="100"
                step="1"
                value={filters.minSalary}
                onChange={(event) =>
                  update({
                    minSalary: Math.min(Number(event.target.value), filters.maxSalary),
                  })
                }
                className="mt-1 block h-5 w-full cursor-pointer accent-primary"
              />
            </label>
            <label className="text-[11px] font-normal">
              {vi.maxSalary}: <output>{filters.maxSalary}</output>
              <input
                type="range"
                aria-label={vi.maxSalary}
                data-testid="filter-max-salary"
                min="0"
                max="100"
                step="1"
                value={filters.maxSalary}
                onChange={(event) =>
                  update({
                    maxSalary: Math.max(Number(event.target.value), filters.minSalary),
                  })
                }
                className="mt-1 block h-5 w-full cursor-pointer accent-primary"
              />
            </label>
          </div>
        </fieldset>
      </div>
    </section>
  );
}
