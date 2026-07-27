// filepath: src/pages/LoginPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';

// Placeholder hasta que se implemente el flujo Google OAuth real.
// Hoy: pegas el googleId y "login" envía al backend.
// El backend devuelve el tipo (DUENO/CLIENTE) y redirigimos según rol.
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
        // Por ahora este panel es solo de dueños. Mostramos error.
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold mb-1">RestaurantGo</h1>
        <p className="text-sm text-gray-500 mb-6">Panel de dueños</p>

        <label className="block text-sm font-medium text-gray-700 mb-1">
          Google ID (placeholder)
        </label>
        <input
          type="text"
          value={googleId}
          onChange={(e) => setGoogleId(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-4"
          required
        />

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}
