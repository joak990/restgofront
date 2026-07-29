import { useEffect, useState, ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../api/client";
import { onboardingApi } from "../api/onboarding";
import { verificationCache } from "../lib/verification-cache";
import type { LoginResponse } from "../api/auth";

type VerificationStatus =
  | "loading"
  | "verificado"
  | "pendiente";

/**
 * Guard que verifica que el dueño tenga su cuenta VERIFICADA.
 * - Si no hay token → redirige a /login-dueno
 * - Si no es DUENO → redirige a /login-dueno
 * - Si el estado no es VERIFICADO → redirige a /dueno/pendiente
 * - Si está VERIFICADO → renderiza los children
 *
 * Usa un cache en memoria para no llamar a getStatus() en cada render.
 * El cache se limpia al hacer logout/login (ver client.ts).
 */
export default function RequireDuenoVerificado({
  children,
}: {
  children: ReactNode;
}) {
  const [status, setStatus] = useState<VerificationStatus>(
    verificationCache.get() ?? "loading",
  );

  useEffect(() => {
    const token = auth.getToken();
    const user = auth.getUser<LoginResponse>();

    if (!token || !user) {
      setStatus("pendiente");
      return;
    }

    if (user.tipo !== "DUENO") {
      setStatus("pendiente");
      return;
    }

    const cached = verificationCache.get();
    if (cached) {
      setStatus(cached);
      return;
    }

    onboardingApi
      .getStatus()
      .then((s) => {
        if (s.estadoVerificacion === "VERIFICADO") {
          verificationCache.set("verificado");
          setStatus("verificado");
        } else {
          verificationCache.set("pendiente");
          setStatus("pendiente");
        }
      })
      .catch(() => {
        verificationCache.set("pendiente");
        setStatus("pendiente");
      });
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-3 border-forest-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-stone-500 text-sm">Verificando cuenta...</p>
        </div>
      </div>
    );
  }

  if (status === "pendiente") {
    return <Navigate to="/dueno/pendiente" replace />;
  }

  return <>{children}</>;
}
