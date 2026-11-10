import {
  JOB_CITIES,
  JOB_LEVELS,
  JOB_ROLES,
  type Job,
  type JobCity,
  type JobFilters,
  type JobLevel,
  type JobRole,
  type SortDirection,
  type SortKey,
} from '@/types/job';

export const emptyFilters: JobFilters = {
  role: '',
  city: '',
  level: '',
  skills: [],
  minSalary: 0,
  maxSalary: 100,
  keyword: '',
};

export function parseJobFilters(params: URLSearchParams): JobFilters {
  const minValue = params.get('min');
  const maxValue = params.get('max');
  const rawMin = minValue === null ? 0 : Number(minValue);
  const rawMax = maxValue === null ? 100 : Number(maxValue);
  const minSalary = Number.isFinite(rawMin) ? Math.min(100, Math.max(0, rawMin)) : 0;
  const maxSalary = Number.isFinite(rawMax) ? Math.min(100, Math.max(minSalary, rawMax)) : 100;
  const role = params.get('role') ?? '';
  const city = params.get('city') ?? '';
  const level = params.get('level') ?? '';

  return {
    role: JOB_ROLES.includes(role as JobRole) ? (role as JobRole) : '',
    city: JOB_CITIES.includes(city as JobCity) ? (city as JobCity) : '',
    level: JOB_LEVELS.includes(level as JobLevel) ? (level as JobLevel) : '',
    skills: [...new Set((params.get('skills') ?? '').split(',').filter(Boolean))],
    minSalary,
    maxSalary,
    keyword: params.get('q') ?? '',
  };
}

export function serializeJobFilters(filters: JobFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.role) params.set('role', filters.role);
  if (filters.city) params.set('city', filters.city);
  if (filters.level) params.set('level', filters.level);
  if (filters.skills.length) params.set('skills', [...new Set(filters.skills)].sort().join(','));
  if (filters.minSalary > 0) params.set('min', String(filters.minSalary));
  if (filters.maxSalary < 100) params.set('max', String(filters.maxSalary));
  if (filters.keyword.trim()) params.set('q', filters.keyword.trim());
  return params;
}

export function filterJobs(jobs: readonly Job[], filters: JobFilters): Job[] {
  const query = filters.keyword.trim().toLocaleLowerCase('vi');
  return jobs.filter((job) => {
    const searchableText = `${job.title} ${job.company}`.toLocaleLowerCase('vi');
    return (
      (!filters.role || job.role === filters.role) &&
      (!filters.city || job.city === filters.city) &&
      (!filters.level || job.level === filters.level) &&
      filters.skills.every((skill) => job.skills.includes(skill)) &&
      job.salaryMax >= filters.minSalary &&
      job.salaryMin <= filters.maxSalary &&
      (!query || searchableText.includes(query))
    );
  });
}

export function averageSalary(jobs: readonly Job[]): number {
  if (!jobs.length) return 0;
  return jobs.reduce((sum, job) => sum + (job.salaryMin + job.salaryMax) / 2, 0) / jobs.length;
}

export function mostFrequent(items: readonly string[]): string {
  if (!items.length) return '—';
  const counts = new Map<string, number>();
  items.forEach((item) => counts.set(item, (counts.get(item) ?? 0) + 1));
  return (
    [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'vi'))[0]?.[0] ??
    '—'
  );
}

export function mostRequestedSkill(jobs: readonly Job[]): string {
  return mostFrequent(jobs.flatMap((job) => job.skills));
}

export function topCity(jobs: readonly Job[]): string {
  return mostFrequent(jobs.map((job) => job.city));
}

export function topSkills(jobs: readonly Job[], limit = 10): { name: string; jobs: number }[] {
  const counts = new Map<string, number>();
  jobs.forEach((job) =>
    job.skills.forEach((skill) => counts.set(skill, (counts.get(skill) ?? 0) + 1)),
  );
  return [...counts.entries()]
    .map(([name, count]) => ({ name, jobs: count }))
    .sort((a, b) => b.jobs - a.jobs || a.name.localeCompare(b.name, 'vi'))
    .slice(0, Math.max(0, limit));
}

export function salaryHistogram(jobs: readonly Job[]): { range: string; count: number }[] {
  const bins = [
    { range: '< 15', min: 0, max: 15 },
    { range: '15–25', min: 15, max: 25 },
    { range: '25–35', min: 25, max: 35 },
    { range: '35–45', min: 35, max: 45 },
    { range: '45–60', min: 45, max: 60 },
    { range: '60+', min: 60, max: Infinity },
  ];
  return bins.map((bin) => ({
    range: bin.range,
    count: jobs.filter((job) => {
      const midpoint = (job.salaryMin + job.salaryMax) / 2;
      return midpoint >= bin.min && midpoint < bin.max;
    }).length,
  }));
}

export function cityBreakdown(jobs: readonly Job[]): { name: JobCity; jobs: number }[] {
  const counts = new Map<JobCity, number>();
  jobs.forEach((job) => counts.set(job.city, (counts.get(job.city) ?? 0) + 1));
  return [...counts.entries()]
    .map(([name, count]) => ({ name, jobs: count }))
    .sort((a, b) => b.jobs - a.jobs || a.name.localeCompare(b.name, 'vi'));
}

export function salaryByLevel(
  jobs: readonly Job[],
): { level: JobLevel; salary: number; count: number }[] {
  return JOB_LEVELS.map((level) => {
    const group = jobs.filter((job) => job.level === level);
    return { level, salary: Math.round(averageSalary(group) * 10) / 10, count: group.length };
  }).filter((row) => row.count > 0);
}

export function monthlyPostings(jobs: readonly Job[]): { month: string; count: number }[] {
  if (!jobs.length) return [];
  const counts = new Map<number, number>();
  const monthIndex = (date: Date) => date.getUTCFullYear() * 12 + date.getUTCMonth();
  const dates = jobs.map((job) => new Date(`${job.postedAt}T00:00:00Z`));
  const validDates = dates.filter((date) => Number.isFinite(date.getTime()));
  if (!validDates.length) return [];

  validDates.forEach((date) => {
    const key = monthIndex(date);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  const first = Math.min(...counts.keys());
  const last = Math.max(...counts.keys());

  return Array.from({ length: last - first + 1 }, (_, offset) => {
    const index = first + offset;
    const date = new Date(Date.UTC(Math.floor(index / 12), index % 12, 1));
    const key = monthIndex(date);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    return { month: `${month}/${String(year).slice(-2)}`, count: counts.get(key) ?? 0 };
  });
}

export function sortJobs(jobs: readonly Job[], key: SortKey, direction: SortDirection): Job[] {
  const factor = direction === 'asc' ? 1 : -1;
  return [...jobs].sort((a, b) => {
    const left = a[key];
    const right = b[key];
    const result =
      typeof left === 'number' && typeof right === 'number'
        ? left - right
        : String(left).localeCompare(String(right), 'vi', { sensitivity: 'base' });
    return result * factor || a.id.localeCompare(b.id);
  });
}
