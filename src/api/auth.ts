// filepath: src/api/auth.ts
import { apiClient, auth } from './client';

// Hoy el backend emite DUENO o CLIENTE. Cuando se agreguen admin/soporte,
// extender este union.
export type UserRole = 'DUENO' | 'CLIENTE';

export interface LoginResponse {
  accessToken: string;
  tipo: UserRole;
  id: string;
  nombreCompleto: string;
}

export const authApi = {
  async login(googleId: string): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', { googleId });
    auth.setToken(data.accessToken);
    auth.setUser(data);
    return data;
  },
  logout(): void {
    auth.clear();
  },
  currentUser<T = LoginResponse>(): T | null {
    return auth.getUser<T>();
  },
};
