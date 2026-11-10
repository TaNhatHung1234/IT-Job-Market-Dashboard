import { useCallback, useEffect, useState } from 'react';
import { loadSampleJobs, type JobLoader } from '@/data/loadJobs';
import type { Job } from '@/types/job';
import { vi } from '@/i18n/vi';

export function useJobs(loader: JobLoader = loadSampleJobs) {
  const [jobs, setJobs] = useState<readonly Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    loader(requestKey)
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
  }, [loader, requestKey]);

  const retry = useCallback(() => setRequestKey((value) => value + 1), []);

  return { jobs, loading, error, retry };
}
