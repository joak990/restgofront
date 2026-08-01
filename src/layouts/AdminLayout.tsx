// filepath: src/layouts/AdminLayout.tsx
// Layout del panel de admin. Independiente del OwnerLayout porque el admin
// no debe ver el navbar del dueño y debe tener una estética más sobria.

import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { authApi } from "../api/auth";

const SUBNAV: { to: string; label: string; end?: boolean }[] = [
  { to: "/dueno-panel-adm-7x9z/dashboard", label: "Dashboard" },
  { to: "/dueno-panel-adm-7x9z", label: "Pendientes", end: true },
  { to: "/dueno-panel-adm-7x9z/clientes", label: "Clientes" },
  { to: "/dueno-panel-adm-7x9z/restaurantes", label: "Restaurantes" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const user = authApi.currentUser();

  async function handleLogout() {
    await authApi.logout();
    navigate("/login-dueno");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-cream-100">
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-cream-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5 group">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-forest-600 to-forest-800 text-cream-50 shadow-sm group-hover:scale-105 transition-transform">
              <span className="text-lg">🛡️</span>
            </span>
            <div>
              <h1 className="font-bold text-stone-900 leading-tight">
                RestaurantGo · Admin
              </h1>
              <p className="text-xs text-stone-500 leading-tight">
                Panel de moderación
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="hidden sm:flex flex-col items-end">
              <span className="font-medium text-stone-800">
                {user?.nombreCompleto ?? ""}
              </span>
              <span className="text-xs text-forest-600 font-medium">
                {user?.rolAdmin ?? "ADMIN"}
              </span>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-forest-500 to-forest-700 flex items-center justify-center text-cream-50 font-medium shadow-sm">
              {user?.nombreCompleto?.charAt(0).toUpperCase() ?? "A"}
            </div>
            <button
              onClick={handleLogout}
              className="btn-ghost text-sm py-1.5 px-3"
              title="Cerrar sesión"
            >
              Salir
            </button>
          </div>
        </div>
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 pb-2 -mt-1 flex items-center gap-1 text-sm">
          {SUBNAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md font-medium transition ${
                  isActive
                    ? "bg-forest-100 text-forest-800"
                    : "text-stone-600 hover:bg-cream-100 hover:text-stone-800"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}
