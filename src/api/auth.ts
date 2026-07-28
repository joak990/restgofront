// filepath: src/api/auth.ts
// import { signInWithPopup, signOut, type User } from 'firebase/auth';
import { apiClient, auth } from "./client";

export type UserRole = "DUENO" | "CLIENTE" | "ADMIN" | "EMPLEADO";

export interface LoginResponse {
  accessToken: string;
  tipo: UserRole;
  id: string;
  nombreCompleto: string;
  // Empleado
  restauranteId?: string;
  rol?: "MANAGER" | "STAFF";
  // Admin
  rolAdmin?: "SUPER_ADMIN" | "MODERADOR" | "SOPORTE";
}

/**
 * Devuelve la ruta del panel al que debe ir el usuario según su tipo.
 */
export function rutaPorTipo(user: LoginResponse | null): string {
  if (!user) return "/login";
  switch (user.tipo) {
    case "DUENO":
      return "/dueno";
    case "EMPLEADO":
      return `/staff/${user.restauranteId ?? ""}`;
    case "ADMIN":
      return "/admin";
    case "CLIENTE":
    default:
      return "/login";
  }
}

// async function getIdTokenFromFirebase(): Promise<string> {
//   if (!firebaseAuth) {
//     throw new Error(
//       'Firebase no está configurado. Revisá las variables VITE_FIREBASE_* en .env.',
//     );
//   }
//   const credential = await signInWithPopup(firebaseAuth, googleProvider);
//   return credential.user.getIdToken(/* forceRefresh */ true);
// }

async function exchangeIdTokenWithBackend(
  idToken: string,
): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>("/auth/firebase", {
    idToken,
  });
  return data;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nombreCompleto: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export const authApi = {
  /**
   * Registro con email y password.
   */
  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await apiClient.post<
      LoginResponse & { needsOnboarding?: boolean; tempToken?: string }
    >("/auth/register", data);
    // Si necesita onboarding, guardamos el tempToken
    if (response.data.needsOnboarding && response.data.tempToken) {
      auth.setToken(response.data.tempToken);
    }
    return response.data;
  },

  /**
   * Login con email y password.
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>("/auth/login", data);
    auth.setToken(response.data.accessToken);
    auth.setUser(response.data);
    return response.data;
  },

  /**
   * Flujo unificado: Google → Firebase → idToken → backend → JWT nuestro.
   * @deprecated Usar loginWithEmail en su lugar.
   */
  async loginWithFirebase(): Promise<LoginResponse> {
    // const idToken = await getIdTokenFromFirebase();
    // const data = await exchangeIdTokenWithBackend(idToken);
    // auth.setToken(data.accessToken);
    // auth.setUser(data);
    // return data;
    throw new Error("Google OAuth deshabilitado. Usá loginWithEmail.");
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
      // if (firebaseAuth) {
      //   await signOut(firebaseAuth);
      // }
    } catch {
      /* ignore */
    }
    auth.clear();
  },

  currentUser<T = LoginResponse>(): T | null {
    return auth.getUser<T>();
  },

  /**
   * @deprecated Google OAuth deshabilitado.
   */
  async currentFirebaseUser(): Promise<null> {
    return null;
  },
};
