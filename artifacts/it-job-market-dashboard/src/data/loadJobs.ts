import jobsJson from './jobs.json';
import type { Job } from '@/types/job';

export type JobLoader = () => Promise<readonly Job[]>;

export const loadSampleJobs: JobLoader = async () => jobsJson as Job[];
