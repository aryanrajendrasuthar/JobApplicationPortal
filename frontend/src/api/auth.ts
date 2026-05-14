import api from './client';
import type { AuthResponse } from '../types';

export const authApi = {
  register: (data: {
    name: string; email: string; password: string; role: string;
    companyName?: string; companyIndustry?: string; companyLocation?: string;
  }) => api.post<AuthResponse>('/auth/register', data).then(r => r.data),

  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }).then(r => r.data),

  getMe: () => api.get<AuthResponse>('/auth/me').then(r => r.data),
};
