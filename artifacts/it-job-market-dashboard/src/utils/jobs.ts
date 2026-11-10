import type { Job, JobFilters, SortDirection, SortKey } from '@/types/job';

export const emptyFilters: JobFilters = {
  role: '',
  city: '',
  level: '',
  skills: [],
  minSalary: 0,
  maxSalary: 100,
  keyword: '',
};

export function filterJobs(jobs: readonly Job[], filters: JobFilters): Job[] {
  const query = filters.keyword.trim().toLocaleLowerCase('vi');
  return jobs.filter((job) => {
    const text = [job.title, job.company, job.city, job.level, ...job.skills]
      .join(' ')
      .toLocaleLowerCase('vi');
    return (
      (!filters.role ||
        job.title.toLocaleLowerCase('vi').includes(filters.role.toLocaleLowerCase('vi'))) &&
      (!filters.city || job.city === filters.city) &&
      (!filters.level || job.level === filters.level) &&
      filters.skills.every((skill) => job.skills.includes(skill)) &&
      job.salaryMax >= filters.minSalary &&
      job.salaryMin <= filters.maxSalary &&
      (!query || text.includes(query))
    );
  });
}

export function averageSalary(jobs: readonly Job[]): number {
  if (!jobs.length) return 0;
  return jobs.reduce((sum, job) => sum + (job.salaryMin + job.salaryMax) / 2, 0) / jobs.length;
}

function mostFrequent(items: readonly string[]): string {
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
    .slice(0, limit);
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
    count: jobs.filter((j) => {
      const midpoint = (j.salaryMin + j.salaryMax) / 2;
      return midpoint >= bin.min && midpoint < bin.max;
    }).length,
  }));
}

export function cityBreakdown(jobs: readonly Job[]): { name: string; jobs: number }[] {
  const counts = new Map<string, number>();
  jobs.forEach((job) => counts.set(job.city, (counts.get(job.city) ?? 0) + 1));
  return [...counts.entries()]
    .map(([name, count]) => ({ name, jobs: count }))
    .sort((a, b) => b.jobs - a.jobs || a.name.localeCompare(b.name, 'vi'));
}

export function salaryByLevel(
  jobs: readonly Job[],
): { level: string; salary: number; count: number }[] {
  const order = ['Intern', 'Junior', 'Middle', 'Senior', 'Lead'];
  return order
    .map((level) => {
      const group = jobs.filter((job) => job.level === level);
      return { level, salary: Math.round(averageSalary(group) * 10) / 10, count: group.length };
    })
    .filter((row) => row.count > 0);
}

export function monthlyPostings(jobs: readonly Job[]): { month: string; count: number }[] {
  const counts = new Map<string, number>();
  jobs.forEach((job) => {
    const date = new Date(`${job.postedDate}T00:00:00`);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, count]) => {
      const [year, month] = key.split('-');
      return { month: `${month}/${year.slice(2)}`, count };
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
