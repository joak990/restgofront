

import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { apiClient } from "../api/client";

interface DuenoDetail {
  id: string;
  nombreCompleto: string;
  correo: string;
  dni: string | null;
  telefono: string | null;
  direccion: string | null;
  provincia: string | null;
  ciudad: string | null;
  codigoPostal: string | null;
  fechaNacimiento: string | null;
  cuitCuil: string | null;
  urlAvatar: string | null;
  urlFotoDniFrente: string | null;
  urlFotoDniDorso: string | null;
  estadoVerificacion: "PENDIENTE" | "EN_REVISION" | "VERIFICADO" | "RECHAZADO";
  motivoRechazo: string | null;
  creadoEn: string;
}

const VERIF_BADGE: Record<
  DuenoDetail["estadoVerificacion"],
  { label: string; className: string }
> = {
  PENDIENTE: {
    label: "⏳ Pendiente",
    className: "bg-yellow-100 text-yellow-800",
  },
  EN_REVISION: {
    label: "🔍 En revisión",
    className: "bg-blue-100 text-blue-800",
  },
  VERIFICADO: {
    label: "✅ Verificado",
    className: "bg-green-100 text-green-800",
  },
  RECHAZADO: { label: "✕ Rechazado", className: "bg-red-100 text-red-800" },
};

export default function TelegramReviewDuenoPage() {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [dueno, setDueno] = useState<DuenoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [adminNombre, setAdminNombre] = useState("");
  const [motivo, setMotivo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const rechazarFlow = searchParams.get("rechazar") === "1";

  useEffect(() => {
    if (!token) {
      setError("Token inválido.");
      setLoading(false);
      return;
    }

    Promise.all([
      apiClient.get<DuenoDetail>(`/admin/telegram/dueno/${token}`),
      apiClient
        .get<{ display_name: string | null; username: string | null }>(
          "/admin/telegram/me",
        )
        .catch(() => ({ data: { display_name: null, username: null } })),
    ])
      .then(([duenoRes, meRes]) => {
        setDueno(duenoRes.data);
        if (meRes.data.display_name) {
          setAdminNombre(meRes.data.display_name);
        } else if (meRes.data.username) {
          setAdminNombre(`@${meRes.data.username}`);
        }
      })
      .catch((err: unknown) => {
        const msg =
          (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
          "No se pudo cargar el detalle del dueño. El link puede haber expirado.";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function handleAprobar() {
    if (!token) return;
    if (!adminNombre.trim()) {
      setError("Decinos tu nombre de Telegram antes de aprobar.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiClient.post(
        `/admin/telegram/verificar/${token}`,
        { adminNombre: adminNombre.trim() },
        { responseType: "text" },
      );
      // El backend devuelve HTML con la confirmación.
      const w = window.open("", "_self");
      if (w) {
        w.document.open();
        w.document.write(res.data);
        w.document.close();
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "No se pudo aprobar al dueño.";
      setError(msg);
      setSubmitting(false);
    }
  }

  async function handleRechazar() {
    if (!token) return;
    if (!adminNombre.trim()) {
      setError("Decinos tu nombre de Telegram antes de rechazar.");
      return;
    }
    if (motivo.trim().length < 5) {
      setError("El motivo debe tener al menos 5 caracteres.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiClient.post(
        `/admin/telegram/rechazar/${token}`,
        { motivo: motivo.trim(), adminNombre: adminNombre.trim() },
        { responseType: "text" },
      );
      const w = window.open("", "_self");
      if (w) {
        w.document.open();
        w.document.write(res.data);
        w.document.close();
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "No se pudo rechazar al dueño.";
      setError(msg);
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <span className="w-6 h-6 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !dueno) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-md p-6 text-center">
          <div className="text-5xl mb-3">⚠️</div>
          <h1 className="text-xl font-bold text-stone-900 mb-2">
            Link inválido o expirado
          </h1>
          <p className="text-sm text-stone-600">{error}</p>
          <button
            onClick={() => navigate("/dueno-panel-adm-7x9z")}
            className="mt-5 w-full py-3 rounded-xl bg-forest-700 text-white font-semibold"
          >
            Ir al panel admin
          </button>
        </div>
      </div>
    );
  }

  if (!dueno) return null;

  const badge = VERIF_BADGE[dueno.estadoVerificacion];
  const yaResuelto =
    dueno.estadoVerificacion === "VERIFICADO" ||
    dueno.estadoVerificacion === "RECHAZADO";

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4">
      <div className="max-w-xl mx-auto space-y-4">
        <header className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-stone-900">
                Revisar dueño
              </h1>
              <p className="text-sm text-stone-500 mt-0.5">
                Datos enviados desde el onboarding.
              </p>
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${badge.className}`}
            >
              {badge.label}
            </span>
          </div>
        </header>

        <section className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
          <div className="flex items-center gap-3">
            {dueno.urlAvatar ? (
              <img
                src={dueno.urlAvatar}
                alt={dueno.nombreCompleto}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-forest-700 text-white flex items-center justify-center font-semibold text-lg">
                {dueno.nombreCompleto.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-semibold text-stone-900">
                {dueno.nombreCompleto}
              </p>
              <p className="text-sm text-stone-500">{dueno.correo}</p>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm pt-2">
            <div>
              <dt className="text-stone-500">DNI</dt>
              <dd className="font-medium text-stone-900">{dueno.dni ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-stone-500">CUIT/CUIL</dt>
              <dd className="font-medium text-stone-900">
                {dueno.cuitCuil ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-stone-500">Teléfono</dt>
              <dd className="font-medium text-stone-900">
                {dueno.telefono ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-stone-500">Fecha de nacimiento</dt>
              <dd className="font-medium text-stone-900">
                {dueno.fechaNacimiento
                  ? new Date(dueno.fechaNacimiento).toLocaleDateString("es-AR")
                  : "—"}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-stone-500">Dirección</dt>
              <dd className="font-medium text-stone-900">
                {dueno.direccion ?? "—"}
                {dueno.ciudad ? `, ${dueno.ciudad}` : ""}
                {dueno.provincia ? ` (${dueno.provincia})` : ""}
                {dueno.codigoPostal ? ` CP ${dueno.codigoPostal}` : ""}
              </dd>
            </div>
          </dl>
        </section>

        {(dueno.urlFotoDniFrente || dueno.urlFotoDniDorso) && (
          <section className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="font-semibold text-stone-900 mb-3">Fotos del DNI</h2>
            <div className="grid grid-cols-2 gap-3">
              {dueno.urlFotoDniFrente ? (
                <a
                  href={dueno.urlFotoDniFrente}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    src={dueno.urlFotoDniFrente}
                    alt="DNI frente"
                    className="w-full aspect-[3/2] object-cover rounded-lg border border-stone-200"
                  />
                  <p className="text-xs text-center mt-1 text-stone-500">
                    Frente
                  </p>
                </a>
              ) : (
                <div className="aspect-[3/2] flex items-center justify-center text-xs text-stone-400 border border-dashed border-stone-200 rounded-lg">
                  Sin foto frente
                </div>
              )}
              {dueno.urlFotoDniDorso ? (
                <a
                  href={dueno.urlFotoDniDorso}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    src={dueno.urlFotoDniDorso}
                    alt="DNI dorso"
                    className="w-full aspect-[3/2] object-cover rounded-lg border border-stone-200"
                  />
                  <p className="text-xs text-center mt-1 text-stone-500">
                    Dorso
                  </p>
                </a>
              ) : (
                <div className="aspect-[3/2] flex items-center justify-center text-xs text-stone-400 border border-dashed border-stone-200 rounded-lg">
                  Sin foto dorso
                </div>
              )}
            </div>
          </section>
        )}

        {yaResuelto ? (
          <section className="bg-white rounded-2xl shadow-sm p-5 text-center">
            <p className="text-stone-700">
              Este dueño ya fue{" "}
              <b>
                {dueno.estadoVerificacion === "VERIFICADO"
                  ? "aprobado"
                  : "rechazado"}
              </b>
              .
            </p>
            {dueno.motivoRechazo && (
              <blockquote className="mt-2 text-left text-sm bg-slate-50 border-l-4 border-red-400 px-3 py-2 rounded">
                Motivo: {dueno.motivoRechazo}
              </blockquote>
            )}
            <button
              onClick={() => navigate("/dueno-panel-adm-7x9z")}
              className="mt-4 w-full py-3 rounded-xl bg-forest-700 text-white font-semibold"
            >
              Ir al panel admin
            </button>
          </section>
        ) : (
          <section className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
            <div>
              <label className="text-sm font-medium text-stone-700">
                Tu nombre de Telegram
              </label>
              <input
                type="text"
                value={adminNombre}
                onChange={(e) => setAdminNombre(e.target.value)}
                placeholder="Detectado automáticamente desde Telegram"
                className="mt-1 w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
              <p className="text-xs text-stone-500 mt-1">
                Se completó desde tu cuenta de Telegram. Lo podés editar si querés.
              </p>
            </div>

            {rechazarFlow && (
              <div>
                <label className="text-sm font-medium text-stone-700">
                  Motivo del rechazo
                </label>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Mínimo 5 caracteres. Ej: DNI ilegible, subí otra foto."
                  rows={3}
                  className="mt-1 w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
                />
              </div>
            )}

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                {error}
              </p>
            )}

            {rechazarFlow ? (
              <button
                onClick={handleRechazar}
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-red-700 text-white font-semibold disabled:opacity-50"
              >
                {submitting ? "Rechazando..." : "⛔ Rechazar dueño"}
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate(`?rechazar=1`, { replace: true })}
                  className="py-3 rounded-xl bg-red-50 text-red-700 font-semibold border border-red-200"
                >
                  ⛔ Rechazar
                </button>
                <button
                  onClick={handleAprobar}
                  disabled={submitting}
                  className="py-3 rounded-xl bg-green-700 text-white font-semibold disabled:opacity-50"
                >
                  {submitting ? "Aprobando..." : "✅ Aprobar"}
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
