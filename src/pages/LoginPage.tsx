// filepath: src/pages/LoginPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi, rutaPorTipo } from "../api/auth";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await authApi.login({ email, password });
      navigate(rutaPorTipo(data), { replace: true });
    } catch (err) {
      const msg = (err as Error).message;
      setError(msg);
      await authApi.logout();
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
          <p className="text-stone-600 mt-1">
            Dueños · Empleados · Administradores
          </p>
        </div>

        <div className="card p-8 space-y-5">
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Ingresando...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </button>
          </form>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <p className="text-xs text-stone-500 text-center">
            Dueños, empleados y administradores de plataforma usan el mismo
            acceso. Te llevamos al panel correcto según tu rol.
          </p>

          <p className="text-xs text-stone-500 text-center">
            ¿No tenés cuenta?{" "}
            <a href="/register/duenos" className="underline font-medium">
              Creá tu cuenta
            </a>
          </p>
        </div>

        <p className="text-center text-xs text-stone-500 mt-6">
          Reservas · Mesas · Horarios · Todo en un solo lugar
        </p>
      </div>
    </div>
  );
}
