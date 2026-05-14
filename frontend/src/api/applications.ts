import api from './client';
import type { Application, PageResponse } from '../types';

export const applicationsApi = {
  apply: (data: { jobId: number; coverLetter?: string; resumeUrl?: string }) =>
    api.post<Application>('/applications', data).then(r => r.data),

  getMyApplications: () =>
    api.get<Application[]>('/applications/my-applications').then(r => r.data),

  getJobApplications: (jobId: number, page = 0, size = 20) =>
    api.get<PageResponse<Application>>(`/applications/job/${jobId}`, {
      params: { page, size },
    }).then(r => r.data),

  updateStatus: (id: number, status: string, employerNotes?: string) =>
    api.patch<Application>(`/applications/${id}/status`, { status, employerNotes }).then(r => r.data),
};
