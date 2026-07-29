// filepath: src/api/onboarding.ts
import axios from 'axios';
import { apiClient, auth } from './client';

export interface CompletarPerfilBody {
  nombreCompleto: string;
  dni: string;
  cuitCuil?: string;
  fechaNacimiento?: string;
  telefono: string;
  direccion: string;
  provinciaId: string;
  ciudadId: string;
  codigoPostal?: string;
  urlAvatar?: string;
}

export interface SubirDocumentosBody {
  urlFotoDniFrente?: string;
  urlFotoDniDorso?: string;
}

export interface OnboardingStatus {
  id: string;
  correo: string;
  nombreCompleto: string;
  estadoVerificacion: 'PENDIENTE' | 'EN_REVISION' | 'VERIFICADO' | 'RECHAZADO';
  motivoRechazo: string | null;
  perfilCompleto: boolean;
  documentosSubidos: boolean;
}

/**
 * Cliente axios específico para endpoints /onboarding/*.
 * Usa el tempToken guardado en sessionStorage (NO el JWT normal).
 */
const onboardingClient = axios.create({
  baseURL: apiClient.defaults.baseURL,
  headers: { 'Content-Type': 'application/json' },
});

onboardingClient.interceptors.request.use((config) => {
  const raw = sessionStorage.getItem('restaurantgo_onboarding');
  if (raw) {
    const { tempToken } = JSON.parse(raw);
    if (tempToken) {
      config.headers.Authorization = `Bearer ${tempToken}`;
      return config;
    }
  }
  // fallback: usar el JWT normal (caso dueño ya completó paso 1 o re-login)
  const token = localStorage.getItem('restaurantgo_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const onboardingApi = {
  async completarPerfil(body: CompletarPerfilBody) {
    const { data } = await onboardingClient.post(
      '/onboarding/dueno/perfil',
      body,
    );
    // El back devuelve el JWT real de DUENO. Lo guardamos en localStorage.
    if (data.accessToken) {
      auth.setToken(data.accessToken);
      auth.setUser({
        accessToken: data.accessToken,
        tipo: 'DUENO',
        id: data.id,
        nombreCompleto: data.nombreCompleto,
      });
      // Limpiamos el tempToken de sessionStorage (ya no se necesita)
      sessionStorage.removeItem('restaurantgo_onboarding');
    }
    return data;
  },

  async subirDocumentos(body: SubirDocumentosBody) {
    const { data } = await onboardingClient.post(
      '/onboarding/dueno/documentos',
      body,
    );
    return data;
  },

  async getStatus(): Promise<OnboardingStatus> {
    const { data } = await onboardingClient.get<OnboardingStatus>(
      '/onboarding/dueno/estado',
    );
    return data;
  },
};