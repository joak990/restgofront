// filepath: src/pages/LoginDuenoPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, type User } from 'firebase/auth';
import { firebaseAuth, googleProvider, isFirebaseReady } from '../lib/firebase';
import { apiClient, auth } from '../api/client';

/**
 * Login específico para dueños.
 * - Si el email existe → JWT propio + redirige a /dueno
 * - Si no existe → tempToken de onboarding + redirige a /onboarding/dueno
 */
export default function LoginDuenoPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const ready = isFirebaseReady();

  async function handleGoogleLogin() {
    setError(null);
    setLoading(true);
    try {
      if (!firebaseAuth) throw new Error('Firebase no está configurado');

      // 1) Login con Firebase
      const credential = await signInWithPopup(firebaseAuth, googleProvider);
      const idToken = await credential.user.getIdToken(true);

      // 2) Enviar idToken al backend
      const { data } = await apiClient.post('/auth/firebase', { idToken });

      // 3) Caso 1: ya estaba registrado
      if (data.accessToken) {
        auth.setToken(data.accessToken);
        auth.setUser(data);
        navigate('/dueno', { replace: true });
        return;
      }

      // 4) Caso 2: necesita onboarding
      if (data.needsOnboarding) {
        // Guardamos el tempToken en una storage temporal
        sessionStorage.setItem('restaurantgo_onboarding', JSON.stringify(data));
        navigate('/onboarding/dueno', { replace: true });
        return;
      }

      throw new Error('Respuesta inesperada del servidor');
    } catch (err) {
      const msg = (err as Error).message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-100 via-cream-50 to-cream-200 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-forest-600 to-forest-800 shadow-lg mb-3 text-3xl">
            🍽️
          </div>
          <h1 className="text-3xl font-bold text-stone-900">RestaurantGo</h1>
          <p className="text-stone-600 mt-1">Portal para dueños</p>
        </div>

        <div className="card p-8 space-y-5">
          {!ready && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg">
              Firebase no está configurado.
            </div>
          )}

          <p className="text-sm text-stone-600 text-center">
            Si es la primera vez que ingresás, te vamos a pedir que completes tu
            perfil para verificar tu identidad.
          </p>

          <button
            type="button"
            disabled={loading || !ready}
            onClick={handleGoogleLogin}
            className="btn-primary w-full flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Conectando...
              </>
            ) : (
              <>
                <GoogleIcon />
                Continuar con Google
              </>
            )}
          </button>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-stone-500 mt-6">
          ¿Sos empleado o administrador? Usá el{' '}
          <a href="/login" className="underline">
            login general
          </a>
          .
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fill="#fff"
        d="M21.35 11.1H12v3.2h5.35c-.5 2.6-2.7 4.5-5.35 4.5a6 6 0 1 1 0-12 5.5 5.5 0 0 1 3.85 1.5l2.3-2.3A8.9 8.9 0 0 0 12 3a9 9 0 1 0 9 9c0-.6-.05-1.2-.15-1.9z"
      />
    </svg>
  );
}

// evitar warning de unused
void ({} as User);