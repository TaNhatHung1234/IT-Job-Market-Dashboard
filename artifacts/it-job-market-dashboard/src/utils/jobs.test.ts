import { describe, expect, it } from 'vitest';
import type { Job, JobFilters } from '@/types/job';
import {
  averageSalary,
  cityBreakdown,
  emptyFilters,
  filterJobs,
  mostFrequent,
  mostRequestedSkill,
  monthlyPostings,
  parseJobFilters,
  salaryByLevel,
  salaryHistogram,
  serializeJobFilters,
  sortJobs,
  topCity,
  topSkills,
} from './jobs';

const makeJob = (overrides: Partial<Job> = {}): Job => ({
  id: 'VN-0001',
  title: 'Backend Developer',
  company: 'May Studio',
  city: 'Ha Noi',
  role: 'Backend',
  level: 'Middle',
  skills: ['Java', 'SQL', 'Docker'],
  salaryMin: 25,
  salaryMax: 35,
  postedAt: '2026-05-18',
  ...overrides,
});

const sample = [
  makeJob(),
  makeJob({
    id: 'VN-0002',
    title: 'React Frontend Developer',
    company: 'La Labs',
    city: 'Ho Chi Minh',
    role: 'Frontend',
    level: 'Senior',
    salaryMin: 40,
    salaryMax: 60,
    skills: ['React', 'TypeScript', 'Git'],
    postedAt: '2026-06-01',
  }),
  makeJob({
    id: 'VN-0003',
    title: 'Data Analyst',
    role: 'Data',
    level: 'Junior',
    salaryMin: 15,
    salaryMax: 25,
    skills: ['SQL', 'Python', 'Power BI'],
    postedAt: '2025-12-02',
  }),
];

describe('job market processing', () => {
  it('parses valid filters and safely ignores invalid enum and salary values', () => {
    expect(parseJobFilters(new URLSearchParams())).toEqual({
      ...emptyFilters,
      skills: [],
    });
    expect(
      parseJobFilters(
        new URLSearchParams(
          'role=Frontend&city=Ho+Chi+Minh&level=Senior&skills=React%2CTypeScript%2CReact&min=15&max=60&q=Acme',
        ),
      ),
    ).toEqual({
      role: 'Frontend',
      city: 'Ho Chi Minh',
      level: 'Senior',
      skills: ['React', 'TypeScript'],
      minSalary: 15,
      maxSalary: 60,
      keyword: 'Acme',
    });
    expect(parseJobFilters(new URLSearchParams('role=Manager&min=bad&max=15'))).toEqual({
      ...emptyFilters,
      skills: [],
      maxSalary: 15,
    });
    expect(parseJobFilters(new URLSearchParams('min=75&max=30')).maxSalary).toBe(75);
  });

  it('serializes only active filter values for shareable URLs', () => {
    const params = serializeJobFilters({
      ...emptyFilters,
      role: 'Frontend',
      skills: ['TypeScript', 'React', 'React'],
      minSalary: 15,
      maxSalary: 60,
      keyword: '  Acme  ',
    });
    expect(params.toString()).toBe('role=Frontend&skills=React%2CTypeScript&min=15&max=60&q=Acme');
    expect(serializeJobFilters(emptyFilters).toString()).toBe('');
  });

  it('filters by role, city, level, every selected skill, salary overlap and keyword', () => {
    const filters: JobFilters = {
      ...emptyFilters,
      role: 'Backend',
      city: 'Ha Noi',
      level: 'Middle',
      skills: ['Java', 'SQL'],
      minSalary: 30,
      maxSalary: 40,
      keyword: 'may',
    };
    expect(filterJobs(sample, filters).map((job) => job.id)).toEqual(['VN-0001']);
    expect(filterJobs(sample, { ...emptyFilters, skills: ['React', 'SQL'] })).toEqual([]);
    expect(filterJobs(sample, { ...emptyFilters, role: 'QA' })).toEqual([]);
  });

  it('searches title and company but not other fields, without case sensitivity', () => {
    expect(filterJobs(sample, { ...emptyFilters, keyword: 'LA LABS' })).toHaveLength(1);
    expect(filterJobs(sample, { ...emptyFilters, keyword: 'react' })[0]?.id).toBe('VN-0002');
    expect(filterJobs(sample, { ...emptyFilters, keyword: 'Ho Chi Minh' })).toEqual([]);
    expect(filterJobs(sample, { ...emptyFilters, keyword: 'unknown company' })).toEqual([]);
  });

  it('uses salary interval overlap and returns no results when the range misses', () => {
    expect(filterJobs(sample, { ...emptyFilters, minSalary: 34, maxSalary: 36 })).toHaveLength(1);
    expect(filterJobs(sample, { ...emptyFilters, minSalary: 90, maxSalary: 100 })).toEqual([]);
  });

  it('calculates midpoint salary averages and handles an empty array', () => {
    expect(averageSalary([])).toBe(0);
    expect(averageSalary(sample)).toBe(100 / 3);
    expect(averageSalary([sample[0]!])).toBe(30);
  });

  it('finds the most frequent value, handles empty input and breaks ties alphabetically', () => {
    expect(mostFrequent([])).toBe('—');
    expect(mostFrequent(['Zed', 'Alpha', 'Alpha', 'Zed'])).toBe('Alpha');
  });

  it('finds the leading skill and city with empty and tied data', () => {
    const tied = [
      makeJob({ skills: ['Zed', 'Alpha', 'SQL'], city: 'Da Nang' }),
      makeJob({ id: '2', skills: ['Alpha', 'Zed', 'Python'], city: 'Ha Noi' }),
    ];
    expect(mostRequestedSkill([])).toBe('—');
    expect(mostRequestedSkill(tied)).toBe('Alpha');
    expect(topCity([])).toBe('—');
    expect(topCity(tied)).toBe('Da Nang');
  });

  it('returns top skills ordered by count with alphabetical tie-breaking', () => {
    expect(topSkills([])).toEqual([]);
    expect(topSkills(sample, 2)).toEqual([
      { name: 'SQL', jobs: 2 },
      { name: 'Docker', jobs: 1 },
    ]);
    expect(topSkills(sample, -1)).toEqual([]);
  });

  it('assigns every job midpoint to one salary histogram bin', () => {
    expect(salaryHistogram([]).every((item) => item.count === 0)).toBe(true);
    expect(salaryHistogram(sample).reduce((total, row) => total + row.count, 0)).toBe(3);
  });

  it('groups cities and sorts counts deterministically', () => {
    expect(cityBreakdown([])).toEqual([]);
    expect(cityBreakdown(sample)[0]).toEqual({ name: 'Ha Noi', jobs: 2 });
  });

  it('returns only populated salary levels in career order', () => {
    expect(salaryByLevel([])).toEqual([]);
    expect(salaryByLevel(sample).map((row) => row.level)).toEqual(['Junior', 'Middle', 'Senior']);
    expect(salaryByLevel(sample).map((row) => row.salary)).toEqual([20, 30, 50]);
  });

  it('fills missing months between the first and last posting', () => {
    expect(monthlyPostings([])).toEqual([]);
    expect(monthlyPostings(sample)).toEqual([
      { month: '12/25', count: 1 },
      { month: '01/26', count: 0 },
      { month: '02/26', count: 0 },
      { month: '03/26', count: 0 },
      { month: '04/26', count: 0 },
      { month: '05/26', count: 1 },
      { month: '06/26', count: 1 },
    ]);
  });

  it('sorts without mutating the source and keeps ties stable by id', () => {
    const input = [sample[1]!, sample[0]!];
    expect(sortJobs(input, 'salaryMin', 'asc').map((job) => job.id)).toEqual([
      'VN-0001',
      'VN-0002',
    ]);
    expect(input[0]?.id).toBe('VN-0002');
    expect(sortJobs(input, 'company', 'desc')).toHaveLength(2);
    expect(
      sortJobs([makeJob({ id: 'b' }), makeJob({ id: 'a' })], 'title', 'asc').map((job) => job.id),
    ).toEqual(['a', 'b']);
  });
});
