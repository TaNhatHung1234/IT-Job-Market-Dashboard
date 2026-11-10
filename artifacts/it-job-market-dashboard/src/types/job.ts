export interface Job {
  id: string;
  title: string;
  company: string;
  city: string;
  level: 'Intern' | 'Junior' | 'Middle' | 'Senior' | 'Lead';
  salaryMin: number;
  salaryMax: number;
  currency: 'VND';
  salaryUnit: 'million/month';
  skills: string[];
  postedDate: string;
  employmentType: string;
  description: string;
}

export interface JobFilters {
  role: string;
  city: string;
  level: string;
  skills: string[];
  minSalary: number;
  maxSalary: number;
  keyword: string;
}

export type SortKey = 'title' | 'company' | 'city' | 'level' | 'salaryMin' | 'postedDate';
export type SortDirection = 'asc' | 'desc';
