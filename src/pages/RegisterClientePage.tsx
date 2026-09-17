// filepath: src/pages/RegisterClientePage.tsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/auth";
import {
  getProvincias,
  getCiudades,
  type Provincia,
  type Ciudad,
} from "../api/restaurantes";

export default function RegisterClientePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"landing" | "form">("landing");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Location state
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [loadingUbicacion, setLoadingUbicacion] = useState(false);
  const [selectedProvincia, setSelectedProvincia] = useState("");
  const [selectedCiudad, setSelectedCiudad] = useState("");

  const [formData, setFormData] = useState({
    nombreCompleto: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Load provinces on mount
  useEffect(() => {
    (async () => {
      try {
        const ps = await getProvincias();
        setProvincias(ps);
        // Default to Buenos Aires if available
        const bsas = ps.find(
          (p) => p.nombre.toLowerCase().includes("buenos aires"),
        );
        if (bsas) {
          setSelectedProvincia(bsas.id);
        }
      } catch {}
    })();
  }, []);

  // Load cities when province changes
  useEffect(() => {
    if (!selectedProvincia) return;
    setLoadingUbicacion(true);
    setSelectedCiudad("");
    (async () => {
      try {
        const cs = await getCiudades(selectedProvincia);
        setCiudades(cs);
        if (cs.length > 0) {
          // Try to auto-select first or match Buenos Aires city
          const bsasCiudad = cs.find(
            (c) => c.nombre.toLowerCase().includes("buenos aires"),
          );
          setSelectedCiudad(bsasCiudad?.id ?? cs[0].id);
        }
      } catch {
        setCiudades([]);
      } finally {
        setLoadingUbicacion(false);
      }
    })();
  }, [selectedProvincia]);

  function updateField(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (
      !formData.nombreCompleto.trim() ||
      !formData.email.trim() ||
      !formData.password.trim() ||
      !selectedCiudad
    ) {
      setError("Completá todos los campos.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      await authApi.registerCliente({
        email: formData.email.trim(),
        password: formData.password,
        nombreCompleto: formData.nombreCompleto.trim(),
        ciudadId: selectedCiudad,
      });
      // Ir a la página de verificación
      navigate(`/register/verify?email=${encodeURIComponent(formData.email.trim())}`, { replace: true });
    } catch (err: any) {
      setError(err?.message || "No se pudo crear la cuenta. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  // ─── LANDING STEP ────────────────────────────────────────────────────────────
  if (step === "landing") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-100 via-cream-50 to-cream-200 p-4">
        <div className="w-full max-w-md">
          {/* Header decoration */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-forest-500 to-forest-700 shadow-xl mb-6">
              <span className="text-5xl">🍽️</span>
            </div>
            <h1 className="text-4xl font-extrabold text-stone-900 tracking-tight">
              RestaurantGo
            </h1>
            <p className="mt-2 text-stone-600 text-base">
              Encontrá tu próximo lugar favorito para salir a comer.
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-stone-200/60 p-8 space-y-5">
            <p className="text-center text-stone-500 text-sm">
              Guardá tus restaurantes favoritos y descubrí nuevas opciones para tu próxima salida.
            </p>

            {/* Google button placeholder */}
            <button
              className="w-full flex items-center justify-center gap-3 bg-stone-800 hover:bg-stone-900 text-white font-semibold py-3.5 px-4 rounded-2xl transition-colors duration-200 cursor-not-allowed opacity-60"
              disabled
              title="Próximamente"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continuar con Google
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-stone-200 w-full" />
              <span className="absolute bg-white px-3 text-xs text-stone-400 uppercase tracking-wide">
                o
              </span>
            </div>

            {/* Email button */}
            <button
              onClick={() => setStep("form")}
              className="w-full bg-forest-600 hover:bg-forest-700 text-white font-semibold py-3.5 px-4 rounded-2xl transition-colors duration-200"
            >
              Crear cuenta con email
            </button>

            <p className="text-center text-stone-500 text-sm">
              ¿Ya tenés cuenta?{" "}
              <Link to="/login" className="text-forest-600 font-semibold hover:underline">
                Iniciar sesión
              </Link>
            </p>
          </div>

          {/* Footer */}
          <p className="text-center text-stone-400 text-xs mt-6">
            Al continuar, aceptás nuestros{" "}
            <span className="underline cursor-pointer">Términos</span> y{" "}
            <span className="underline cursor-pointer">Política de privacidad</span>.
          </p>
        </div>
      </div>
    );
  }

  // ─── FORM STEP ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-100 via-cream-50 to-cream-200 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-forest-500 to-forest-700 shadow-lg mb-4">
            <span className="text-4xl">🍽️</span>
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900">Crear cuenta</h1>
          <p className="mt-2 text-stone-600 text-sm">
            Encontrá tu próximo lugar favorito para salir a comer.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-stone-200/60 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Nombre completo
              </label>
              <input
                type="text"
                placeholder="Juan Pérez"
                value={formData.nombreCompleto}
                onChange={(e) => updateField("nombreCompleto", e.target.value)}
                className="w-full px-4 py-3 bg-cream-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all"
                autoComplete="name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Provincia
              </label>
              <select
                value={selectedProvincia}
                onChange={(e) => setSelectedProvincia(e.target.value)}
                className="w-full px-4 py-3 bg-cream-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all appearance-none"
              >
                <option value="">Seleccioná tu provincia</option>
                {provincias.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Ciudad
              </label>
              <div className="relative min-h-[52px]">
                <select
                  value={selectedCiudad}
                  onChange={(e) => setSelectedCiudad(e.target.value)}
                  disabled={!selectedProvincia || loadingUbicacion}
                  className="w-full px-4 py-3 bg-cream-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {loadingUbicacion
                      ? "Cargando ciudades..."
                      : selectedProvincia
                        ? "Seleccioná tu ciudad"
                        : "Elegí provincia primero"}
                  </option>
                  {ciudades.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
                {loadingUbicacion && (
                  <div className="absolute inset-y-0 right-10 flex items-center pointer-events-none">
                    <div className="w-4 h-4 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                placeholder="juan@ejemplo.com"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="w-full px-4 py-3 bg-cream-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={(e) => updateField("password", e.target.value)}
                className="w-full px-4 py-3 bg-cream-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Confirmar contraseña
              </label>
              <input
                type="password"
                placeholder="Repetí tu contraseña"
                value={formData.confirmPassword}
                onChange={(e) => updateField("confirmPassword", e.target.value)}
                className="w-full px-4 py-3 bg-cream-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all"
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-forest-600 hover:bg-forest-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-4 rounded-2xl transition-colors duration-200 mt-2"
            >
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => setStep("landing")}
                className="text-stone-500 hover:text-forest-600 transition-colors"
              >
                ← Volver
              </button>
              <p className="text-stone-500">
                ¿Ya tenés cuenta?{" "}
                <Link to="/login" className="text-forest-600 font-semibold hover:underline">
                  Iniciar sesión
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
