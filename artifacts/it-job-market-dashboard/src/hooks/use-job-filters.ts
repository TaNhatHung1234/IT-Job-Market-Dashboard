import { useEffect, useState } from 'react';
import { emptyFilters, parseJobFilters, serializeJobFilters } from '@/utils/jobs';
import type { JobFilters } from '@/types/job';

function readFilters(): JobFilters {
  return typeof window === 'undefined'
    ? { ...emptyFilters, skills: [] }
    : parseJobFilters(new URLSearchParams(window.location.search));
}

export function useJobFilters() {
  const [filters, setFilters] = useState<JobFilters>(readFilters);

  useEffect(() => {
    const query = serializeJobFilters(filters).toString();
    const nextUrl = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
    window.history.replaceState(window.history.state, '', nextUrl);
  }, [filters]);

  useEffect(() => {
    const onPopState = () => setFilters(readFilters());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return { filters, setFilters };
}
