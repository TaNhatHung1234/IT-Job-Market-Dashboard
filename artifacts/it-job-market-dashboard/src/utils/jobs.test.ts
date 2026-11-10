import { describe, expect, it } from 'vitest';
import {
  averageSalary,
  cityBreakdown,
  filterJobs,
  mostRequestedSkill,
  monthlyPostings,
  salaryByLevel,
  salaryHistogram,
  sortJobs,
  topCity,
  topSkills,
} from './jobs';
import type { Job, JobFilters } from '@/types/job';
import { emptyFilters } from './jobs';

const makeJob = (overrides: Partial<Job> = {}): Job => ({
  id: 'VN-0001',
  title: 'Backend Developer',
  company: 'Mây Studio',
  city: 'Hà Nội',
  level: 'Middle',
  salaryMin: 25,
  salaryMax: 35,
  currency: 'VND',
  salaryUnit: 'million/month',
  skills: ['Java', 'SQL'],
  postedDate: '2026-05-18',
  employmentType: 'Toàn thời gian',
  description: 'Vai trò kỹ thuật trong nhóm sản phẩm.',
  ...overrides,
});
const sample = [
  makeJob(),
  makeJob({
    id: 'VN-0002',
    title: 'Frontend Developer',
    company: 'Lá Labs',
    city: 'Hồ Chí Minh',
    level: 'Senior',
    salaryMin: 40,
    salaryMax: 60,
    skills: ['React', 'TypeScript'],
    postedDate: '2026-06-01',
  }),
  makeJob({
    id: 'VN-0003',
    title: 'Data Analyst',
    company: 'Mây Studio',
    city: 'Hà Nội',
    level: 'Junior',
    salaryMin: 15,
    salaryMax: 25,
    skills: ['SQL', 'Python'],
    postedDate: '2025-12-02',
  }),
];

describe('job market processing', () => {
  it('returns safe empty aggregates and empty charts', () => {
    expect(averageSalary([])).toBe(0);
    expect(mostRequestedSkill([])).toBe('—');
    expect(topCity([])).toBe('—');
    expect(topSkills([])).toEqual([]);
    expect(cityBreakdown([])).toEqual([]);
    expect(salaryHistogram([]).every((item) => item.count === 0)).toBe(true);
    expect(salaryByLevel([])).toEqual([]);
    expect(monthlyPostings([])).toEqual([]);
  });

  it('filters by every filter dimension and requires all selected skills', () => {
    const filters: JobFilters = {
      ...emptyFilters,
      city: 'Hà Nội',
      level: 'Middle',
      skills: ['Java', 'SQL'],
      minSalary: 30,
      maxSalary: 40,
      keyword: 'mây',
    };
    expect(filterJobs(sample, filters).map((job) => job.id)).toEqual(['VN-0001']);
    expect(filterJobs(sample, { ...emptyFilters, skills: ['React', 'SQL'] })).toEqual([]);
  });

  it('matches keyword case-insensitively across role, company, place and skills', () => {
    expect(filterJobs(sample, { ...emptyFilters, keyword: 'LÁ LABS' })).toHaveLength(1);
    expect(filterJobs(sample, { ...emptyFilters, keyword: 'không tồn tại' })).toEqual([]);
    expect(filterJobs(sample, { ...emptyFilters, keyword: 'typescript' })[0]?.id).toBe('VN-0002');
  });

  it('uses salary interval overlap and returns no results when the range misses', () => {
    expect(filterJobs(sample, { ...emptyFilters, minSalary: 34, maxSalary: 36 })).toHaveLength(1);
    expect(filterJobs(sample, { ...emptyFilters, minSalary: 90, maxSalary: 100 })).toEqual([]);
  });

  it('calculates midpoint average and handles a single result', () => {
    expect(averageSalary(sample)).toBe(100 / 3);
    expect(averageSalary([sample[0]!])).toBe(30);
  });

  it('breaks frequency ties alphabetically for skills and cities', () => {
    const tied = [
      makeJob({ skills: ['Zed', 'Alpha'], city: 'Đà Nẵng' }),
      makeJob({ id: '2', skills: ['Alpha', 'Zed'], city: 'Hà Nội' }),
    ];
    expect(mostRequestedSkill(tied)).toBe('Alpha');
    expect(topCity(tied)).toBe('Đà Nẵng');
    expect(topSkills(tied, 1)).toEqual([{ name: 'Alpha', jobs: 2 }]);
  });

  it('sorts without mutating source and uses stable id order for ties', () => {
    const input = [sample[1]!, sample[0]!];
    expect(sortJobs(input, 'salaryMin', 'asc').map((job) => job.id)).toEqual([
      'VN-0001',
      'VN-0002',
    ]);
    expect(input[0]?.id).toBe('VN-0002');
    expect(sortJobs(input, 'company', 'desc')).toHaveLength(2);
  });

  it('builds city, level, salary and month distributions in deterministic order', () => {
    expect(cityBreakdown(sample)[0]).toEqual({ name: 'Hà Nội', jobs: 2 });
    expect(salaryByLevel(sample).map((row) => row.level)).toEqual(['Junior', 'Middle', 'Senior']);
    expect(salaryHistogram(sample).reduce((total, row) => total + row.count, 0)).toBe(3);
    expect(monthlyPostings(sample)).toEqual([
      { month: '12/25', count: 1 },
      { month: '05/26', count: 1 },
      { month: '06/26', count: 1 },
    ]);
  });
});
