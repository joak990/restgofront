// filepath: src/layouts/AdminLayout.tsx
// Layout del panel de admin. Independiente del OwnerLayout porque el admin
// no debe ver el navbar del dueño y debe tener una estética más sobria.

import { Outlet, useNavigate } from "react-router-dom";
import { authApi } from "../api/auth";

export default function AdminLayout() {
  const navigate = useNavigate();
  const user = authApi.currentUser();

  async function handleLogout() {
    await authApi.logout();
    navigate("/login-dueno");
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-stone-900 text-white shadow-sm border-b border-stone-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-stone-700 text-amber-300 shadow-sm">
              <span className="text-lg">🛡️</span>
            </span>
            <div>
              <h1 className="font-bold text-white leading-tight">
                RestaurantGo · Admin
              </h1>
              <p className="text-xs text-stone-400 leading-tight">
                Panel de moderación
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="hidden sm:flex flex-col items-end">
              <span className="font-medium text-white">
                {user?.nombreCompleto ?? ""}
              </span>
              <span className="text-xs text-amber-300">
                {user?.rolAdmin ?? "ADMIN"}
              </span>
            </div>
            <div className="w-9 h-9 rounded-full bg-stone-700 flex items-center justify-center text-amber-300 font-medium shadow-sm">
              {user?.nombreCompleto?.charAt(0).toUpperCase() ?? "A"}
            </div>
            <button
              onClick={handleLogout}
              className="text-sm px-3 py-1.5 rounded border border-stone-600 hover:bg-stone-800 transition"
              title="Cerrar sesión"
            >
              Salir
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}
