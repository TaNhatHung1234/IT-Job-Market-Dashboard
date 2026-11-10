import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ReactNode } from 'react';
import {
  cityBreakdown,
  monthlyPostings,
  salaryByLevel,
  salaryHistogram,
  topSkills,
} from '@/utils/jobs';
import type { Job } from '@/types/job';
import { vi } from '@/i18n/vi';

const chartColors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

function ChartCard({
  title,
  children,
  className = '',
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-card-border bg-card p-5 shadow-sm ${className}`}>
      <h3 className="mb-5 font-serif text-base font-bold tracking-tight">{title}</h3>
      {children}
    </section>
  );
}

function BlankChart() {
  return (
    <div className="grid h-[220px] place-items-center text-sm text-muted-foreground">
      {vi.noData}
    </div>
  );
}

export function MarketCharts({ jobs }: { jobs: readonly Job[] }) {
  const skills = topSkills(jobs);
  const salary = salaryHistogram(jobs);
  const cities = cityBreakdown(jobs);
  const levels = salaryByLevel(jobs);
  const months = monthlyPostings(jobs);
  const axis = {
    tick: { fill: 'hsl(var(--muted-foreground))', fontSize: 11 },
    axisLine: false,
    tickLine: false,
  };
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
      <ChartCard title={vi.skillsChart} className="xl:col-span-3">
        {skills.length ? (
          <ResponsiveContainer width="100%" height={255}>
            <BarChart
              data={skills}
              layout="vertical"
              margin={{ left: 10, right: 18 }}
              className="chart-grid"
            >
              <CartesianGrid horizontal={false} strokeDasharray="3 4" />
              <XAxis type="number" {...axis} />
              <YAxis dataKey="name" type="category" width={102} {...axis} />
              <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} />
              <Bar
                dataKey="jobs"
                name={vi.jobsAxis}
                fill={chartColors[0]}
                radius={[0, 5, 5, 0]}
                barSize={14}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <BlankChart />
        )}
      </ChartCard>
      <ChartCard title={vi.salaryChart} className="xl:col-span-3">
        {jobs.length ? (
          <ResponsiveContainer width="100%" height={255}>
            <BarChart data={salary} margin={{ left: -18, right: 10 }} className="chart-grid">
              <CartesianGrid vertical={false} strokeDasharray="3 4" />
              <XAxis dataKey="range" {...axis} />
              <YAxis {...axis} />
              <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} />
              <Bar
                dataKey="count"
                name={vi.salaryAxis}
                fill={chartColors[1]}
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <BlankChart />
        )}
      </ChartCard>
      <ChartCard title={vi.cityChart} className="xl:col-span-2">
        {cities.length ? (
          <div className="flex h-[255px] items-center gap-2">
            <ResponsiveContainer width="56%" height="100%">
              <PieChart>
                <Pie
                  data={cities}
                  dataKey="jobs"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={83}
                  paddingAngle={3}
                  stroke="none"
                >
                  {cities.map((city, index) => (
                    <Cell key={city.name} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <ul className="min-w-0 space-y-3 text-xs">
              {cities.slice(0, 5).map((city, index) => (
                <li key={city.name} className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: chartColors[index % chartColors.length] }}
                  />
                  <span className="truncate text-muted-foreground">{city.name}</span>
                  <strong className="ml-auto font-mono">{city.jobs}</strong>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <BlankChart />
        )}
      </ChartCard>
      <ChartCard title={vi.levelChart} className="xl:col-span-2">
        {levels.length ? (
          <ResponsiveContainer width="100%" height={255}>
            <BarChart data={levels} margin={{ left: -14, right: 4 }} className="chart-grid">
              <CartesianGrid vertical={false} strokeDasharray="3 4" />
              <XAxis dataKey="level" {...axis} />
              <YAxis {...axis} />
              <Tooltip
                formatter={(value: number | string | (number | string)[] | undefined) => [
                  `${String(value)} ${vi.salarySuffix}`,
                  vi.average,
                ]}
              />
              <Bar dataKey="salary" name={vi.average} fill={chartColors[2]} radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <BlankChart />
        )}
      </ChartCard>
      <ChartCard title={vi.monthlyChart} className="xl:col-span-2">
        {months.length ? (
          <ResponsiveContainer width="100%" height={255}>
            <BarChart data={months} margin={{ left: -14, right: 4 }} className="chart-grid">
              <CartesianGrid vertical={false} strokeDasharray="3 4" />
              <XAxis dataKey="month" {...axis} />
              <YAxis {...axis} />
              <Tooltip />
              <Bar dataKey="count" name={vi.jobsAxis} fill={chartColors[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <BlankChart />
        )}
      </ChartCard>
    </div>
  );
}
