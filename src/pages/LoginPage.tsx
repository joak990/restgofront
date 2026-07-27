// filepath: src/pages/LoginPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, rutaPorTipo } from '../api/auth';
import { isFirebaseReady } from '../lib/firebase';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleGoogleLogin() {
    setError(null);
    setLoading(true);
    try {
      const data = await authApi.loginWithFirebase();
      navigate(rutaPorTipo(data), { replace: true });
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.includes('No existe un usuario registrado')) {
        setError(
          'Tu email no está registrado en RestaurantGo. Pedile al administrador que te dé de alta.',
        );
      } else {
        setError(msg);
      }
      await authApi.logout();
    } finally {
      setLoading(false);
    }
  }

  const ready = isFirebaseReady();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-100 via-cream-50 to-cream-200 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-forest-600 to-forest-800 shadow-lg mb-3 text-3xl">
            🍽️
          </div>
          <h1 className="text-3xl font-bold text-stone-900">RestaurantGo</h1>
          <p className="text-stone-600 mt-1">Dueños · Empleados · Administradores</p>
        </div>

        <div className="card p-8 space-y-5">
          {!ready && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg">
              Firebase no está configurado. Revisá las variables
              <code className="mx-1 px-1 bg-amber-100 rounded">VITE_FIREBASE_*</code>
              en tu <code className="px-1 bg-amber-100 rounded">.env</code>.
            </div>
          )}

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

          <p className="text-xs text-stone-500 text-center">
            Dueños, empleados y administradores de plataforma usan el mismo
            acceso. Te llevamos al panel correcto según tu rol.
          </p>
        </div>

        <p className="text-center text-xs text-stone-500 mt-6">
          Reservas · Mesas · Horarios · Todo en un solo lugar
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
