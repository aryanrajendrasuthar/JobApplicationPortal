import api from './client';
import type { Company } from '../types';

export const companiesApi = {
  getAll: () => api.get<Company[]>('/companies').then(r => r.data),

  getById: (id: number) => api.get<Company>(`/companies/${id}`).then(r => r.data),

  getProfile: (id: number) =>
    api.get<{ company: Company; openJobCount: number; openJobs: unknown[] }>(
      `/companies/${id}/profile`
    ).then(r => r.data),

  getMyCompany: () => api.get<Company>('/companies/my-company').then(r => r.data),

  createOrUpdate: (data: Partial<Company>) =>
    api.post<Company>('/companies', data).then(r => r.data),
};
