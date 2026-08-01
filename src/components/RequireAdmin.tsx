// filepath: src/components/RequireAdmin.tsx
// Guard que verifica que el usuario sea ADMIN.
// - Si no hay token → redirige a /login-dueno
// - Si el rol no es ADMIN → redirige a /login-dueno
//
// No consulta al backend: confía en el JWT y el objeto User guardado
// en el localStorage por api/client.ts.

import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../api/client";
import type { LoginResponse } from "../api/auth";

export default function RequireAdmin({ children }: { children: ReactNode }) {
  const token = auth.getToken();
  const user = auth.getUser<LoginResponse>();

  if (!token || !user) {
    return <Navigate to="/login-dueno" replace />;
  }
  if (user.tipo !== "ADMIN") {
    return <Navigate to="/login-dueno" replace />;
  }

  return <>{children}</>;
}
