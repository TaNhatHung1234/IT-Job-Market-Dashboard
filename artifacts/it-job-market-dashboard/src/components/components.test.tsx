import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi as testApi } from 'vitest';
import { FilterBar } from '@/features/filters/FilterBar';
import { JobsTable } from '@/features/table/JobsTable';
import { emptyFilters } from '@/utils/jobs';
import type { Job } from '@/types/job';
import { vi } from '@/i18n/vi';

const makeJob = (index: number): Job => ({
  id: `VN-${String(index + 1).padStart(4, '0')}`,
  title: `Frontend Developer ${index + 1}`,
  company: 'Sample Tech',
  city: 'Ho Chi Minh',
  role: 'Frontend',
  level: 'Junior',
  skills: ['React', 'TypeScript', 'Git'],
  salaryMin: 18,
  salaryMax: 30,
  postedAt: `2026-01-${String(index + 1).padStart(2, '0')}`,
});

describe('dashboard features', () => {
  it('updates the selected role from the filter bar', () => {
    const setFilters = testApi.fn();
    render(<FilterBar filters={emptyFilters} setFilters={setFilters} skills={['React']} />);

    fireEvent.change(screen.getByLabelText(vi.role), { target: { value: 'Frontend' } });

    expect(setFilters).toHaveBeenCalledWith({ ...emptyFilters, role: 'Frontend' });
  });

  it('paginates the job table in pages of ten', () => {
    render(<JobsTable jobs={Array.from({ length: 11 }, (_, index) => makeJob(index))} />);

    expect(screen.getAllByTestId(/^row-job-/)).toHaveLength(10);
    fireEvent.click(screen.getByRole('button', { name: vi.next }));

    expect(screen.getAllByTestId(/^row-job-/)).toHaveLength(1);
    expect(screen.getByTestId('row-job-VN-0001')).toBeInTheDocument();
    expect(
      within(screen.getByTestId('row-job-VN-0001')).getByText('Frontend Developer 1'),
    ).toBeInTheDocument();
  });
});
