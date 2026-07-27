// filepath: src/pages/LoginPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';

export default function LoginPage() {
  const [googleId, setGoogleId] = useState('test-google-id-123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await authApi.login(googleId);
      if (data.tipo === 'DUENO') {
        navigate('/dueno', { replace: true });
      } else if (data.tipo === 'CLIENTE') {
        setError(
          'Este panel es solo para dueños de restaurantes. El portal de clientes está en otra app.',
        );
        authApi.logout();
      } else {
        setError(`Tipo de usuario no soportado: ${data.tipo}`);
        authApi.logout();
      }
    } catch {
      setError('Credenciales inválidas');
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
          <p className="text-stone-600 mt-1">Panel de dueños</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Google ID
            </label>
            <input
              type="text"
              value={googleId}
              onChange={(e) => setGoogleId(e.target.value)}
              className="input"
              placeholder="test-google-id-123"
              required
            />
            <p className="text-xs text-stone-500 mt-2">
              Modo desarrollo: cualquier googleId válido del backend.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Ingresando...
              </>
            ) : (
              'Ingresar'
            )}
          </button>
        </form>

        <p className="text-center text-xs text-stone-500 mt-6">
          Reservas · Mesas · Horarios · Todo en un solo lugar
        </p>
      </div>
    </div>
  );
}
