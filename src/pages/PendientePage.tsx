// filepath: src/pages/PendientePage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { onboardingApi, type OnboardingStatus } from '../api/onboarding';

const VERIF_BADGE: Record<string, { label: string; color: string }> = {
  PENDIENTE: { label: '⏳ Pendiente', color: 'pill-yellow' },
  EN_REVISION: { label: '🔍 En revisión', color: 'pill-blue' },
  VERIFICADO: { label: '✅ Verificado', color: 'pill-green' },
  RECHAZADO: { label: '✕ Rechazado', color: 'pill-red' },
};

export default function PendientePage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authApi.currentUser()) {
      navigate('/login-dueno', { replace: true });
      return;
    }
    onboardingApi
      .getStatus()
      .then(setStatus)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [navigate]);

  async function handleLogout() {
    await authApi.logout();
    navigate('/login-dueno', { replace: true });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-6 h-6 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const badge = status ? VERIF_BADGE[status.estadoVerificacion] : null;
  const aprobado = status?.estadoVerificacion === 'VERIFICADO';
  const rechazado = status?.estadoVerificacion === 'RECHAZADO';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-100 via-cream-50 to-cream-200 p-4">
      <div className="w-full max-w-lg">
        <div className="card p-8 text-center space-y-5">
          <div className="text-6xl">
            {aprobado ? '🎉' : rechazado ? '😔' : '⏳'}
          </div>

          <h1 className="text-2xl font-bold text-stone-900">
            {aprobado
              ? '¡Tu cuenta fue verificada!'
              : rechazado
                ? 'Tu cuenta fue rechazada'
                : 'Tu cuenta está en revisión'}
          </h1>

          {badge && (
            <div className="flex justify-center">
              <span className={badge.color}>{badge.label}</span>
            </div>
          )}

          {status?.motivoRechazo && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg text-left">
              <strong>Motivo:</strong> {status.motivoRechazo}
            </div>
          )}

          <p className="text-sm text-stone-600">
            {aprobado
              ? 'Ya podés crear y administrar tus restaurantes.'
              : rechazado
                ? 'Contactanos a soporte@restaurantgo.com para revisar tu caso.'
                : 'Nuestro equipo está revisando tus documentos. Te avisaremos por mail cuando esté listo.'}
          </p>

          <div className="flex flex-col gap-2 pt-4">
            {aprobado && (
              <button
                type="button"
                onClick={() => navigate('/dueno', { replace: true })}
                className="btn-primary"
              >
                Ir a mi panel
              </button>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="btn-ghost"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}