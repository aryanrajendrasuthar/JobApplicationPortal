export type Role = 'ROLE_SEEKER' | 'ROLE_EMPLOYER' | 'ROLE_ADMIN';
export type JobType = 'REMOTE' | 'HYBRID' | 'ONSITE';
export type JobStatus = 'ACTIVE' | 'CLOSED' | 'DRAFT';
export type AppStatus = 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFERED' | 'REJECTED';

export interface AuthResponse {
  token: string;
  userId: number;
  name: string;
  email: string;
  role: Role;
  companyId?: number;
  avatarUrl?: string;
}

export interface Job {
  id: number;
  companyId: number;
  companyName?: string;
  companyLogoUrl?: string;
  companyIndustry?: string;
  title: string;
  location: string;
  type: JobType;
  salaryMin?: number;
  salaryMax?: number;
  requiredSkills: string[];
  status: JobStatus;
  experienceLevel?: string;
  postedAt: string;
  expiresAt?: string;
  applicationCount: number;
  saved: boolean;
  fullDescription?: string;
  benefits?: string;
  requirements?: string[];
  responsibilities?: string[];
  aboutRole?: string;
}

export interface Application {
  id: number;
  jobId: number;
  jobTitle?: string;
  jobLocation?: string;
  companyName?: string;
  companyLogoUrl?: string;
  seekerId: number;
  seekerName?: string;
  seekerEmail?: string;
  seekerAvatarUrl?: string;
  seekerSkills?: string[];
  resumeUrl?: string;
  coverLetter?: string;
  status: AppStatus;
  employerNotes?: string;
  appliedAt: string;
  updatedAt: string;
}

export interface Company {
  id: number;
  name: string;
  logoUrl?: string;
  industry?: string;
  companySize?: string;
  location?: string;
  website?: string;
  description?: string;
  employerId: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface JobSearchParams {
  keyword?: string;
  location?: string;
  type?: string;
  salaryMin?: number;
  salaryMax?: number;
  experienceLevel?: string;
  page?: number;
  size?: number;
  sortBy?: string;
}
