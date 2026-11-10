import jobsJson from './jobs.json';
import { JOB_CITIES, JOB_LEVELS, JOB_ROLES, type Job } from '@/types/job';

export type JobLoader = (reloadKey?: number) => Promise<readonly Job[]>;

function isJob(value: unknown): value is Job {
  if (typeof value !== 'object' || value === null) return false;
  const job = value as Record<string, unknown>;
  const postedAt = job.postedAt;
  const parsedDate =
    typeof postedAt === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(postedAt)
      ? new Date(`${postedAt}T00:00:00Z`)
      : null;

  return (
    typeof job.id === 'string' &&
    typeof job.title === 'string' &&
    typeof job.company === 'string' &&
    JOB_CITIES.includes(job.city as (typeof JOB_CITIES)[number]) &&
    JOB_ROLES.includes(job.role as (typeof JOB_ROLES)[number]) &&
    JOB_LEVELS.includes(job.level as (typeof JOB_LEVELS)[number]) &&
    Array.isArray(job.skills) &&
    job.skills.length >= 3 &&
    job.skills.length <= 6 &&
    job.skills.every((skill) => typeof skill === 'string') &&
    typeof job.salaryMin === 'number' &&
    Number.isFinite(job.salaryMin) &&
    typeof job.salaryMax === 'number' &&
    Number.isFinite(job.salaryMax) &&
    job.salaryMin <= job.salaryMax &&
    parsedDate !== null &&
    Number.isFinite(parsedDate.getTime()) &&
    parsedDate.toISOString().slice(0, 10) === postedAt
  );
}

export function validateJobs(data: unknown): readonly Job[] {
  if (!Array.isArray(data)) throw new Error('Job data must be an array.');
  const seenIds = new Set<string>();
  const jobs = data.map((item, index) => {
    if (!isJob(item)) throw new Error(`Invalid job record at index ${index}.`);
    if (seenIds.has(item.id)) throw new Error(`Duplicate job id "${item.id}".`);
    seenIds.add(item.id);
    return item;
  });
  return jobs;
}

// This is sample data. Replace the JSON file or loader when a real source is available.
export const loadSampleJobs: JobLoader = async () => validateJobs(jobsJson);
