import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const api = axios.create({ baseURL: API_URL, headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fi_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use((res) => res, (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('fi_token');
    localStorage.removeItem('fi_user');
    if (!window.location.pathname.startsWith('/login')) window.location.href = '/login';
  }
  return Promise.reject(error);
});

export function messageFromError(error, fallback = 'Something went wrong.') {
  return error?.response?.data?.message || fallback;
}
