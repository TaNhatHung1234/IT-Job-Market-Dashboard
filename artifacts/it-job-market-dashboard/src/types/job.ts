export const JOB_ROLES = [
  'Frontend',
  'Backend',
  'Fullstack',
  'Mobile',
  'Data',
  'DevOps',
  'QA',
  'AI/ML',
] as const;

export const JOB_CITIES = ['Ha Noi', 'Ho Chi Minh', 'Da Nang', 'Remote'] as const;

export const JOB_LEVELS = ['Intern', 'Fresher', 'Junior', 'Middle', 'Senior'] as const;

export type JobRole = (typeof JOB_ROLES)[number];
export type JobCity = (typeof JOB_CITIES)[number];
export type JobLevel = (typeof JOB_LEVELS)[number];

export interface Job {
  id: string;
  title: string;
  company: string;
  city: JobCity;
  role: JobRole;
  level: JobLevel;
  skills: string[];
  salaryMin: number;
  salaryMax: number;
  postedAt: string;
}

export interface JobFilters {
  role: JobRole | '';
  city: JobCity | '';
  level: JobLevel | '';
  skills: string[];
  minSalary: number;
  maxSalary: number;
  keyword: string;
}

export type SortKey = 'title' | 'company' | 'city' | 'role' | 'level' | 'salaryMin' | 'postedAt';
export type SortDirection = 'asc' | 'desc';
