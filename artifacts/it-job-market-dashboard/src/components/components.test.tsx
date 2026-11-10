import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BriefcaseBusiness } from 'lucide-react';
import { MetricCard } from './metric-card';
import { SkillTag } from './skill-tag';

describe('dashboard building blocks', () => {
  it('renders a KPI value with its label and context', () => {
    render(
      <MetricCard
        label="Tin tuyển dụng"
        value="400"
        note="tin mẫu"
        icon={BriefcaseBusiness}
        accent="text-primary"
      />,
    );
    expect(screen.getByTestId('metric-value')).toHaveTextContent('400');
    expect(screen.getByText('tin mẫu')).toBeInTheDocument();
  });

  it('renders a skill as an accessible text tag', () => {
    render(<SkillTag name="TypeScript" />);
    expect(screen.getByTestId('skill-TypeScript')).toHaveTextContent('TypeScript');
  });
});
