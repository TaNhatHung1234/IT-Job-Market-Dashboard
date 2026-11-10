# Lát cắt IT — Vietnam Job Market Dashboard

A Vietnamese-language, frontend-only market explorer for a curated, realistic sample of 400 IT job postings across Vietnam. The data covers a rolling 12-month window ending **10 November 2026** and can be explored by role, city, experience, skills, salary and keyword.

## Run locally

From the monorepo root, use its existing pnpm workspace:

```sh
pnpm install
pnpm --filter @workspace/it-job-market-dashboard dev
```

The scaffold requires `PORT` and `BASE_PATH` when running Vite. The shared dev environment supplies those values. Standalone, use e.g. `PORT=5173 BASE_PATH=/ pnpm --filter @workspace/it-job-market-dashboard dev`.

## Scripts

| Script                                                       | Purpose                        |
| ------------------------------------------------------------ | ------------------------------ |
| `pnpm --filter @workspace/it-job-market-dashboard dev`       | Vite development server        |
| `pnpm --filter @workspace/it-job-market-dashboard build`     | Production build               |
| `pnpm --filter @workspace/it-job-market-dashboard preview`   | Preview production build       |
| `pnpm --filter @workspace/it-job-market-dashboard lint`      | ESLint checks                  |
| `pnpm --filter @workspace/it-job-market-dashboard test`      | Vitest + Testing Library suite |
| `pnpm --filter @workspace/it-job-market-dashboard typecheck` | Strict TypeScript check        |
| `pnpm --filter @workspace/it-job-market-dashboard format`    | Prettier formatting            |

## Sample data and replacement

`src/data/jobs.json` contains 400 complete records, generated with varied companies, titles, skill combinations, salary ranges, levels, employment types, and ISO `YYYY-MM-DD` posting dates. The dates sit between 2025-11-11 and 2026-11-10. Ho Chi Minh City and Hanoi lead the city distribution; salaries trend higher in those two markets. All salaries are monthly VND millions.

The entries are illustrative, synthetic sample data. They are **not live vacancies**, do not represent an employer's actual offer, and should not be treated as a statistically representative survey or salary benchmark. Company names are illustrative placeholders for realistic market context.

`src/data/loadJobs.ts` exports the `JobLoader` contract and `loadSampleJobs`. Swap that loader for another local source while retaining the `Job` shape; the dashboard hooks and processing functions do not depend on a particular transport.

## Structure

```text
src/
  components/       KPI, skill tag, chart collection and component tests
  data/             JSON sample set and swappable loader
  hooks/            memo-friendly local dataset hook
  i18n/vi.ts         Vietnamese interface copy
  types/job.ts       Strict job, filter and sorting contracts
  utils/             Pure filtering, aggregations, charts and sorting + unit tests
  App.tsx            Dashboard composition, query state and theme
  index.css          Design tokens and responsive theme foundation
.github/workflows/   Push / PR lint, test, and build workflow
```

## Design and engineering decisions

- **Editorial data desk:** a deep mineral-green report masthead, parchment-tinted light canvas, warm coral accent, compact system-sans display hierarchy and system monospace for numeric information. No external font or data requests are required.
- **Useful density:** prominent market signals first, interactive filters next, lazy-loaded visual analysis and a sortable, paginated table at the bottom. All visualizations recalculate against the active filters.
- **Local-first:** no API calls or backend dependency. Query parameters encode filter state, and the theme preference is stored locally while honoring the operating-system preference on first visit.
- **Accessible by default:** native select, checkbox and number controls; visible focus rings; accessible names for actions; semantic table headings; and a reduced-complexity loading state.
- **Testable calculations:** all filtering, ranking, sorting and chart aggregations are pure functions. Tests cover empty data, equal-frequency ties, no-match cases, salary overlap, and ordering.
- React is pinned to **18.3.1**. Charts load lazily to keep the initial interface responsive.

## Future improvements

1. Replace the illustrative sample with a licensed, regularly refreshed and provenance-documented Vietnamese vacancy dataset.
2. Add time-series comparisons and salary percentiles once there is enough verified data for meaningful conclusions.
3. Offer a clear data-download/export flow and saved filter presets.
4. Add locale-aware currency conversion only when a reliable, documented exchange-rate source is available.
