// filepath: src/pages/RegisterPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth";

interface RegisterResponse {
  needsOnboarding?: boolean;
  tempToken?: string;
  email?: string;
  nombreCompleto?: string;
  accessToken?: string;
  tipo?: string;
}

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Las passwords no coinciden.");
      return;
    }

    if (password.length < 6) {
      setError("La password debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const data = (await authApi.register({
        email,
        password,
        nombreCompleto,
      })) as RegisterResponse;
      // Si necesita onboarding, redirigir
      if (data.needsOnboarding && data.tempToken) {
        sessionStorage.setItem(
          "restaurantgo_onboarding",
          JSON.stringify({
            needsOnboarding: true,
            tempToken: data.tempToken,
            email: data.email,
            nombre: data.nombreCompleto,
          }),
        );
        navigate("/onboarding/dueno", { replace: true });
        return;
      }
      // Si no necesita onboarding, redirigir al login
      navigate("/login", { replace: true });
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
          <p className="text-stone-600 mt-1">Creá tu cuenta</p>
        </div>

        <div className="card p-8 space-y-5">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Nombre completo
              </label>
              <input
                type="text"
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
                required
                minLength={2}
              />
            </div>

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
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Confirmar password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
                required
                minLength={6}
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
                  Creando cuenta...
                </>
              ) : (
                "Crear cuenta"
              )}
            </button>
          </form>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <p className="text-xs text-stone-500 text-center">
            ¿Ya tenés cuenta?{" "}
            <a href="/login" className="underline">
              Iniciá sesión
            </a>
          </p>
        </div>

        <p className="text-center text-xs text-stone-500 mt-6">
          Al registrarte, después podrás completar tu perfil de dueño de
          restaurante.
        </p>
      </div>
    </div>
  );
}
