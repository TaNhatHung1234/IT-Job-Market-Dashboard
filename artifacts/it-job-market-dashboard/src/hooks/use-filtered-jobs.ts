import { useMemo } from 'react';
import { filterJobs } from '@/utils/jobs';
import type { Job, JobFilters } from '@/types/job';

export function useFilteredJobs(jobs: readonly Job[], filters: JobFilters): Job[] {
  return useMemo(() => filterJobs(jobs, filters), [jobs, filters]);
}
