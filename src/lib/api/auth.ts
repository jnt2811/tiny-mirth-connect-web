import type { LoginStatus, User } from '@/types/auth';
import api from '../api';

export async function login(username: string, password: string): Promise<LoginStatus> {
  const params = new URLSearchParams({ username, password });
  const res = await api.post<LoginStatus>('/users/_login', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return res.data;
}

export async function logout(): Promise<void> {
  await api.post('/users/_logout');
}

export async function getCurrentUser(): Promise<User> {
  const res = await api.get<User>('/users/current');
  return res.data;
}
