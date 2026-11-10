# IT Job Market Dashboard

A Vietnamese-language, frontend-only dashboard for exploring the IT job market in Vietnam. The portfolio project uses a local set of 400 illustrative job postings to make salary, skills, experience levels, and hiring locations easy to compare.

## Screenshots

<!-- Replace these placeholders with captured screenshots when available. -->

![Desktop dashboard screenshot placeholder](docs/screenshots/dashboard-desktop.png)

![Mobile dashboard screenshot placeholder](docs/screenshots/dashboard-mobile.png)

**Live demo:** [Replace with the published app URL](https://example.com/replace-with-live-demo)

## Features

- Filter by role, city, experience level, multiple skills, salary range, and job title or company.
- Share filtered views through URL query parameters.
- Track total listings, average salary, most requested skill, and top hiring city.
- Explore the top 10 skills, salary distribution, jobs by city, salary by level, and monthly posting trends.
- Sort table columns and browse listings ten at a time.
- Use a responsive Vietnamese interface with keyboard-accessible controls.
- Switch between dark and light themes; the system preference is used until a theme is selected.
- Load only local sample data—no backend, database, or paid API is required.

## Tech stack

- React 18.3 and TypeScript in strict mode
- Vite and Tailwind CSS
- Recharts for data visualizations
- Vitest and React Testing Library
- ESLint and Prettier

## Run locally

Use Node.js 24 and pnpm from the monorepo root:

```sh
pnpm install
pnpm --filter @workspace/it-job-market-dashboard dev
```

The Replit workflow supplies `PORT` and `BASE_PATH`. For a local standalone run, use:

```sh
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/it-job-market-dashboard dev
```

Run the checks:

```sh
pnpm --filter @workspace/it-job-market-dashboard lint
pnpm --filter @workspace/it-job-market-dashboard test
pnpm --filter @workspace/it-job-market-dashboard typecheck
pnpm --filter @workspace/it-job-market-dashboard build
pnpm --filter @workspace/it-job-market-dashboard format
```

## Project structure

```text
src/
  components/             Shared UI, metric cards, and loading/error states
  data/                   Sample JSON and typed, replaceable loader
  features/
    charts/               Lazily loaded Recharts visualizations
    filters/              Shareable market filters
    table/                Sorting, pagination, and listing display
  hooks/                  Data, filter, theme, and memoization hooks
  i18n/vi.ts              Vietnamese UI strings and display labels
  types/job.ts            Job, filter, enum, and sorting types
  utils/                  Pure filtering and market aggregation functions
  App.tsx                 Dashboard composition
  index.css               Responsive theme tokens
.github/workflows/ci.yml  Lint, tests, typecheck, and build on pushes and PRs
```

## Sample data and replacing it

`src/data/jobs.json` contains 400 synthetic postings with `id`, `title`, `company`, `city`, `role`, `level`, `skills`, `salaryMin`, `salaryMax`, and `postedAt`. Salary values are monthly VND millions. Posting dates are ISO dates between 2025-11-11 and 2026-11-10. Ho Chi Minh City and Ha Noi have the largest share of postings, and expected salary ranges rise with experience.

**This is sample data only.** Listings are fictional illustrations, not live vacancies, verified salary offers, or a statistically representative market survey. Company labels are included for realistic examples and do not indicate that those organizations published these jobs.

`src/data/loadJobs.ts` exports the `JobLoader` type, `loadSampleJobs`, and runtime shape validation. Replace the JSON data or provide another local loader that returns the same `Job` shape; the dashboard's filters and analytics remain independent of the data source.

## Key design decisions

- **Local-first:** all records are bundled as JSON, keeping the project easy to run and avoiding backend and API dependencies.
- **Pure analytics:** filtering, ranking, salary summaries, time series, and sorting live in testable utility functions rather than UI components.
- **Shareable state:** active filters are encoded in the URL so a market view can be reopened or shared.
- **Responsive analysis:** charts are lazy-loaded and all calculations follow the selected filters.
- **System-aware theme:** the operating-system preference is honored until the user explicitly changes the theme; that choice persists in local storage.
- **Vietnamese copy in one place:** visible interface copy and localized enum labels are kept in `src/i18n/vi.ts`.

## Future improvements

1. Replace illustrative listings with a licensed, refreshed, and provenance-documented dataset.
2. Add salary percentiles and longer-term comparisons when verified data supports them.
3. Add CSV export and saved filter presets.
4. Add additional locales if the dashboard needs to serve a wider audience.
