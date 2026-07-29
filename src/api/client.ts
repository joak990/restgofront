// filepath: src/api/client.ts
import axios from 'axios';
import { verificationCache } from '../lib/verification-cache';

const TOKEN_KEY = 'restaurantgo_token';
const USER_KEY = 'restaurantgo_user';

// baseURL resolution:
//  - Si VITE_API_URL está seteado → usar esa URL completa (ej: https://api.tu-dominio.com/v1)
//  - Si NO está seteado:
//      * Dev: vite proxy sirve /api → http://localhost:3000/v1
//      * Prod (Vercel rewrite /api/* → backend): igual usa /api
//    Entonces baseURL queda como '/api' (relativa al host del frontend)
const envUrl = import.meta.env.VITE_API_URL?.trim();
const baseURL = envUrl && envUrl.length > 0 ? envUrl : '/api';

export const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Inyecta JWT en cada request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helpers de auth
export const auth = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    verificationCache.clear();
  },
  setUser: (user: unknown) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  getUser: <T = unknown>(): T | null => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  },
};
