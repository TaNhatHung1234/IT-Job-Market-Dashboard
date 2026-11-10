import { useEffect, useState } from 'react';
import { loadSampleJobs, type JobLoader } from '@/data/loadJobs';
import type { Job } from '@/types/job';
import { vi } from '@/i18n/vi';

export function useJobs(loader: JobLoader = loadSampleJobs) {
  const [jobs, setJobs] = useState<readonly Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    loader()
      .then((result) => {
        if (active) {
          setJobs(result);
          setError(null);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setError(vi.loadingError);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [loader]);

  return { jobs, loading, error };
}
