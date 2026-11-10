import { describe, expect, it } from 'vitest';
import { loadSampleJobs, validateJobs } from './loadJobs';
import { JOB_CITIES, JOB_LEVELS, JOB_ROLES } from '@/types/job';

describe('sample job data loader', () => {
  it('loads 400 valid records using the requested enums and fields', async () => {
    const jobs = await loadSampleJobs();
    expect(jobs).toHaveLength(400);
    expect([...new Set(jobs.map((job) => job.role))].sort()).toEqual([...JOB_ROLES].sort());
    expect([...new Set(jobs.map((job) => job.city))].sort()).toEqual([...JOB_CITIES].sort());
    expect([...new Set(jobs.map((job) => job.level))].sort()).toEqual([...JOB_LEVELS].sort());
    expect(jobs.every((job) => job.skills.length >= 3 && job.skills.length <= 6)).toBe(true);
    expect(jobs.every((job) => /^\d{4}-\d{2}-\d{2}$/.test(job.postedAt))).toBe(true);
    const postingDates = jobs.map((job) => job.postedAt).sort();
    expect(postingDates[0]).toBe('2025-11-11');
    expect(postingDates.at(-1)).toBe('2026-11-10');
    expect(
      jobs.filter((job) => job.city === 'Ho Chi Minh' || job.city === 'Ha Noi').length,
    ).toBeGreaterThan(200);
    const averageFor = (level: (typeof JOB_LEVELS)[number]) => {
      const group = jobs.filter((job) => job.level === level);
      return (
        group.reduce((sum, job) => sum + (job.salaryMin + job.salaryMax) / 2, 0) / group.length
      );
    };
    expect(averageFor('Senior')).toBeGreaterThan(averageFor('Fresher'));
  });

  it('rejects malformed job data and duplicate IDs', () => {
    expect(() => validateJobs({})).toThrow('Job data must be an array.');
    expect(() => validateJobs([{ id: 'missing-fields' }])).toThrow(
      'Invalid job record at index 0.',
    );
    const validJob = {
      id: 'same-id',
      title: 'Frontend Developer',
      company: 'Sample Co',
      city: 'Ha Noi',
      role: 'Frontend',
      level: 'Junior',
      skills: ['React', 'TypeScript', 'Git'],
      salaryMin: 16,
      salaryMax: 30,
      postedAt: '2026-05-18',
    };
    expect(() => validateJobs([validJob, validJob])).toThrow('Duplicate job id "same-id".');
  });
});
