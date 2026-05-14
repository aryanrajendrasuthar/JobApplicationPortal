import api from './client';
import type { Job, JobSearchParams, PageResponse } from '../types';

export const jobsApi = {
  search: (params: JobSearchParams) =>
    api.get<PageResponse<Job>>('/jobs', { params }).then(r => r.data),

  getLatest: () => api.get<Job[]>('/jobs/latest').then(r => r.data),

  getById: (id: number) => api.get<Job>(`/jobs/${id}`).then(r => r.data),

  getByCompany: (companyId: number) =>
    api.get<Job[]>(`/jobs/company/${companyId}`).then(r => r.data),

  getEmployerJobs: () => api.get<Job[]>('/jobs/employer/my-jobs').then(r => r.data),

  create: (data: Partial<Job>) => api.post<Job>('/jobs', data).then(r => r.data),

  update: (id: number, data: Partial<Job>) =>
    api.put<Job>(`/jobs/${id}`, data).then(r => r.data),

  close: (id: number) => api.patch(`/jobs/${id}/close`),

  toggleSave: (id: number) =>
    api.post<{ savedJobIds: number[] }>(`/jobs/${id}/save`).then(r => r.data),

  getSaved: () => api.get<Job[]>('/jobs/saved').then(r => r.data),
};
