// filepath: src/pages/OnboardingPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onboardingApi, type CompletarPerfilBody } from "../api/onboarding";
import { duenosApi, type Provincia, type Ciudad } from "../api/duenos";
import CloudinaryUploader from "../components/CloudinaryUploader";

interface OnboardingData {
  tempToken: string;
  email: string;
  nombre: string;
  foto: string | null;
  googleUid: string;
}

const STEPS = [
  { id: 1, title: "Datos personales", description: "Tu información básica" },
  { id: 2, title: "Foto de perfil", description: "Una imagen para tu cuenta" },
  {
    id: 3,
    title: "Documentos",
    description: "Foto del DNI frente y dorso",
  },
  { id: 4, title: "Confirmación", description: "Revisá y enviá" },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<OnboardingData | null>(null);
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form data
  const [form, setForm] = useState<CompletarPerfilBody>({
    nombreCompleto: "",
    dni: "",
    cuitCuil: "",
    fechaNacimiento: "",
    telefono: "",
    direccion: "",
    provinciaId: "",
    ciudadId: "",
    codigoPostal: "",
  });
  const [urlAvatar, setUrlAvatar] = useState<string | null>(null);
  const [urlDniFrente, setUrlDniFrente] = useState<string | null>(null);
  const [urlDniDorso, setUrlDniDorso] = useState<string | null>(null);

  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const raw = sessionStorage.getItem("restaurantgo_onboarding");
      if (!raw) {
        navigate("/login-dueno", { replace: true });
        return;
      }
      const parsed = JSON.parse(raw) as OnboardingData;
      if (cancelled) return;

      setData(parsed);
      setForm((f) => ({ ...f, nombreCompleto: parsed.nombre }));
      setUrlAvatar(parsed.foto);

      // cargar provincias
      duenosApi
        .getProvincias()
        .then((p) => {
          if (!cancelled) setProvincias(p);
        })
        .catch((err) => console.error("Error al cargar provincias:", err));

      // Verificar en qué paso quedó el usuario
      try {
        const status = await onboardingApi.getStatus();
        if (cancelled) return;
        if (status.perfilCompleto && !status.documentosSubidos) {
          setStep(3); // Falta subir documentos
        } else if (status.perfilCompleto && status.documentosSubidos) {
          setStep(4); // Ya completó todo
        }
        // Si perfilCompleto es false, queda en step 1 (default)
      } catch {
        // Si falla, arranca desde step 1
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function handleProvinciaChange(pid: string) {
    setForm((f) => ({ ...f, provinciaId: pid, ciudadId: "" }));
    if (pid) {
      try {
        const c = await duenosApi.getCiudades(pid);
        setCiudades(c);
        if (c.length === 0) {
          setError(
            "No hay ciudades cargadas para esta provincia. Contactá al administrador.",
          );
        }
      } catch (err) {
        const msg = (err as Error).message;
        setError(`Error al cargar ciudades: ${msg}`);
        setCiudades([]);
      }
    } else {
      setCiudades([]);
    }
  }

  async function handleSubmitPerfil(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const body: CompletarPerfilBody = {
        ...form,
        cuitCuil: form.cuitCuil || undefined,
        fechaNacimiento: form.fechaNacimiento || undefined,
        codigoPostal: form.codigoPostal || undefined,
        urlAvatar: urlAvatar || undefined,
      };
      await onboardingApi.completarPerfil(body);
      setStep(3);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmitDocumentos(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!urlDniFrente || !urlDniDorso) {
      setError("Subí las dos fotos del DNI");
      return;
    }
    setSaving(true);
    try {
      await onboardingApi.subirDocumentos({
        urlFotoDniFrente: urlDniFrente,
        urlFotoDniDorso: urlDniDorso,
      });
      setStep(4);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (!data) {
    return <div className="p-8 text-center text-stone-500">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-100 via-cream-50 to-cream-200 p-4">
      <div className="max-w-2xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-stone-900">🍽️ RestaurantGo</h1>
          <p className="text-stone-600 mt-1">
            Hola <strong>{data.nombre}</strong>, completá tu perfil para empezar
          </p>
        </div>

        {/* Stepper */}
        <div className="flex justify-between mb-8">
          {STEPS.map((s) => (
            <div key={s.id} className="flex-1 text-center">
              <div
                className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-sm font-bold ${
                  step >= s.id
                    ? "bg-forest-600 text-white"
                    : "bg-stone-200 text-stone-500"
                }`}
              >
                {step > s.id ? "✓" : s.id}
              </div>
              <p className="text-[10px] text-stone-600 mt-1">{s.title}</p>
            </div>
          ))}
        </div>

        {/* Card del paso */}
        <div className="card p-8 space-y-5">
          {step === 1 && (
            <form onSubmit={handleSubmitPerfil} className="space-y-4">
              <h2 className="font-semibold text-lg">Datos personales</h2>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Nombre completo *" required>
                  <input
                    className="input w-full"
                    value={form.nombreCompleto}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, nombreCompleto: e.target.value }))
                    }
                    required
                  />
                </Field>
                <Field label="DNI *" required>
                  <input
                    className="input w-full"
                    value={form.dni}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, dni: e.target.value }))
                    }
                    required
                    pattern="\d{7,8}"
                  />
                </Field>
                <Field label="CUIT/CUIL">
                  <input
                    className="input w-full"
                    value={form.cuitCuil ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, cuitCuil: e.target.value }))
                    }
                    pattern="\d{11}"
                  />
                </Field>
                <Field label="Fecha de nacimiento">
                  <input
                    type="date"
                    className="input w-full"
                    value={form.fechaNacimiento ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        fechaNacimiento: e.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="Teléfono *" required>
                  <input
                    type="tel"
                    className="input w-full"
                    value={form.telefono}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, telefono: e.target.value }))
                    }
                    required
                  />
                </Field>
                <Field label="Código postal">
                  <input
                    className="input w-full"
                    value={form.codigoPostal ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, codigoPostal: e.target.value }))
                    }
                  />
                </Field>
              </div>

              <Field label="Dirección *" required>
                <input
                  className="input w-full"
                  value={form.direccion}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, direccion: e.target.value }))
                  }
                  required
                />
              </Field>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Provincia *" required>
                  <select
                    className="input w-full"
                    value={form.provinciaId}
                    onChange={(e) => handleProvinciaChange(e.target.value)}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {provincias.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Ciudad *" required>
                  <select
                    className="input w-full"
                    value={form.ciudadId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, ciudadId: e.target.value }))
                    }
                    required
                    disabled={!form.provinciaId}
                  >
                    <option value="">Seleccionar...</option>
                    {ciudades.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="btn-primary w-full"
              >
                {saving ? "Guardando..." : "Continuar"}
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-lg">Foto de perfil</h2>
              <p className="text-sm text-stone-600">
                Si te logueaste con Google, ya tenemos tu foto. Podés
                actualizarla.
              </p>
              <CloudinaryUploader
                label="Tu foto"
                value={urlAvatar}
                onChange={setUrlAvatar}
                folder="restaurantgo/avatars"
              />
              <button
                type="button"
                onClick={() => setStep(3)}
                className="btn-primary w-full"
              >
                Continuar
              </button>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmitDocumentos} className="space-y-4">
              <h2 className="font-semibold text-lg">Documentos de identidad</h2>
              <p className="text-sm text-stone-600">
                Necesitamos fotos claras del DNI frente y dorso para verificar
                tu identidad.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <CloudinaryUploader
                  label="DNI frente"
                  value={urlDniFrente}
                  onChange={setUrlDniFrente}
                  folder="restaurantgo/dni"
                />
                <CloudinaryUploader
                  label="DNI dorso"
                  value={urlDniDorso}
                  onChange={setUrlDniDorso}
                  folder="restaurantgo/dni"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-ghost flex-1"
                >
                  ← Atrás
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex-1"
                >
                  {saving ? "Enviando..." : "Enviar a verificación"}
                </button>
              </div>
            </form>
          )}

          {step === 4 && (
            <div className="text-center space-y-4 py-8">
              <div className="text-6xl">✅</div>
              <h2 className="text-2xl font-bold text-stone-900">¡Listo!</h2>
              <p className="text-stone-600">
                Tu cuenta está en revisión. Te avisaremos al mail{" "}
                <strong>{data.email}</strong> cuando esté verificada.
              </p>
              <p className="text-sm text-stone-500">
                Mientras tanto no podés acceder al panel de restaurantes.
              </p>
              <button
                type="button"
                onClick={() => {
                  sessionStorage.removeItem("restaurantgo_onboarding");
                  navigate("/dueno/pendiente", { replace: true });
                }}
                className="btn-primary mt-4"
              >
                Ir a mi estado
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-stone-600 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
