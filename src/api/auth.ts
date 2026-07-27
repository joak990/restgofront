// filepath: src/api/auth.ts
import {
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { apiClient, auth } from './client';
import { firebaseAuth, googleProvider } from '../lib/firebase';

export type UserRole = 'DUENO' | 'CLIENTE' | 'ADMIN' | 'EMPLEADO';

export interface LoginResponse {
  accessToken: string;
  tipo: UserRole;
  id: string;
  nombreCompleto: string;
  // Empleado
  restauranteId?: string;
  rol?: 'MANAGER' | 'STAFF';
  // Admin
  rolAdmin?: 'SUPER_ADMIN' | 'MODERADOR' | 'SOPORTE';
}

/**
 * Devuelve la ruta del panel al que debe ir el usuario según su tipo.
 */
export function rutaPorTipo(user: LoginResponse | null): string {
  if (!user) return '/login';
  switch (user.tipo) {
    case 'DUENO':
      return '/dueno';
    case 'EMPLEADO':
      return `/staff/${user.restauranteId ?? ''}`;
    case 'ADMIN':
      return '/admin';
    case 'CLIENTE':
    default:
      return '/login';
  }
}

async function getIdTokenFromFirebase(): Promise<string> {
  if (!firebaseAuth) {
    throw new Error(
      'Firebase no está configurado. Revisá las variables VITE_FIREBASE_* en .env.',
    );
  }
  const credential = await signInWithPopup(firebaseAuth, googleProvider);
  return credential.user.getIdToken(/* forceRefresh */ true);
}

async function exchangeIdTokenWithBackend(idToken: string): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>(
    '/auth/firebase',
    { idToken },
  );
  return data;
}

export const authApi = {
  /**
   * Flujo unificado: Google → Firebase → idToken → backend → JWT nuestro.
   */
  async loginWithFirebase(): Promise<LoginResponse> {
    const idToken = await getIdTokenFromFirebase();
    const data = await exchangeIdTokenWithBackend(idToken);
    auth.setToken(data.accessToken);
    auth.setUser(data);
    return data;
  },

  /**
   * Login rápido con un idToken que ya tengamos (útil para tests).
   */
  async loginWithIdToken(idToken: string): Promise<LoginResponse> {
    const data = await exchangeIdTokenWithBackend(idToken);
    auth.setToken(data.accessToken);
    auth.setUser(data);
    return data;
  },

  /**
   * Cierra sesión en el back (best-effort) y limpia localStorage.
   * También desloguea de Firebase para no reutilizar la sesión.
   */
  async logout(): Promise<void> {
    try {
      if (firebaseAuth) {
        await signOut(firebaseAuth);
      }
    } catch {
      /* ignore */
    }
    auth.clear();
  },

  currentUser<T = LoginResponse>(): T | null {
    return auth.getUser<T>();
  },

  /**
   * Devuelve el User de Firebase actual (si hay sesión Google activa).
   */
  async currentFirebaseUser(): Promise<User | null> {
    if (!firebaseAuth) return null;
    return firebaseAuth.currentUser;
  },
};
