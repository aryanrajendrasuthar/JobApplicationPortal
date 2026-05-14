import api from './client';
import type { Job } from '../types';

export const recommendationsApi = {
  get: () => api.get<Job[]>('/recommendations').then(r => r.data),
};
