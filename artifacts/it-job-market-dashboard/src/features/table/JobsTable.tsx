import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Search } from 'lucide-react';
import { SkillTag } from '@/components/skill-tag';
import { vi } from '@/i18n/vi';
import type { Job, SortDirection, SortKey } from '@/types/job';
import { sortJobs } from '@/utils/jobs';

const PAGE_SIZE = 10;
const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
});

export function JobsTable({ jobs }: { jobs: readonly Job[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('postedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [page, setPage] = useState(1);
  const sorted = useMemo(
    () => sortJobs(jobs, sortKey, sortDirection),
    [jobs, sortKey, sortDirection],
  );
  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const rows = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [jobs]);

  const sortButton = (label: string, key: SortKey) => (
    <button
      type="button"
      data-testid={`sort-${key}`}
      aria-label={`${vi.sortBy} ${label}`}
      aria-pressed={sortKey === key}
      className="inline-flex items-center gap-1 text-left hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
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

  const sortableHeader = (label: string, key: SortKey) => (
    <th
      scope="col"
      aria-sort={sortKey === key ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
      className="px-4 py-3"
    >
      {sortButton(label, key)}
    </th>
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
              <Search aria-hidden="true" />
            </span>
            <h3 className="mt-4 font-serif text-lg font-bold">{vi.emptyTitle}</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">{vi.emptyDescription}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left text-sm">
              <thead className="bg-muted/70 text-[11px] font-bold uppercase tracking-[.09em] text-muted-foreground">
                <tr>
                  {sortableHeader(vi.position, 'title')}
                  {sortableHeader(vi.company, 'company')}
                  {sortableHeader(vi.location, 'city')}
                  {sortableHeader(vi.roleColumn, 'role')}
                  {sortableHeader(vi.levelColumn, 'level')}
                  <th scope="col" className="px-4 py-3">
                    {vi.skills}
                  </th>
                  {sortableHeader(vi.salaryColumn, 'salaryMin')}
                  {sortableHeader(vi.posted, 'postedAt')}
                </tr>
              </thead>
              <tbody>
                {rows.map((job) => (
                  <tr
                    key={job.id}
                    data-testid={`row-job-${job.id}`}
                    className="border-t border-border/80 transition-colors hover:bg-muted/45"
                  >
                    <td className="max-w-[190px] px-4 py-4">
                      <p className="truncate font-semibold text-foreground">{job.title}</p>
                    </td>
                    <td className="px-4 py-4 font-medium">{job.company}</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                        <MapPin size={13} className="text-accent" aria-hidden="true" />
                        {vi.cities[job.city]}
                      </span>
                    </td>
                    <td className="px-4 py-4">{vi.roles[job.role]}</td>
                    <td className="px-4 py-4">
                      <span className="rounded-md bg-secondary px-2 py-1 text-xs font-semibold">
                        {vi.levels[job.level]}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex max-w-[220px] flex-wrap gap-1.5">
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
                    <td className="whitespace-nowrap px-4 py-4 font-mono text-xs text-muted-foreground">
                      {dateFormatter.format(new Date(`${job.postedAt}T00:00:00Z`))}
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
                type="button"
                aria-label={vi.previous}
                data-testid="pagination-previous"
                disabled={page === 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label={vi.next}
                data-testid="pagination-next"
                disabled={page >= pageCount}
                onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
                className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
