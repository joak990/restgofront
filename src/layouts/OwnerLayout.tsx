// filepath: src/layouts/OwnerLayout.tsx
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { authApi } from "../api/auth";
import { duenosApi, type Restaurante } from "../api/duenos";

export default function OwnerLayout() {
  const navigate = useNavigate();
  const user = authApi.currentUser();
  const [primerResto, setPrimerResto] = useState<Restaurante | null>(null);

  useEffect(() => {
    let cancelado = false;
    duenosApi
      .getMisRestaurantes()
      .then((lista) => {
        if (!cancelado && lista.length > 0) setPrimerResto(lista[0]);
      })
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, []);

  const handleLogout = async () => {
    await authApi.logout();
    navigate("/login");
  };

  const vistasHref = primerResto
    ? `/dueno/restaurantes/${primerResto.id}/vista-mesa`
    : "/dueno";

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-cream-100">
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-cream-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link to="/dueno" className="flex items-center gap-2.5 group">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-forest-600 to-forest-800 text-cream-50 shadow-sm group-hover:scale-105 transition-transform">
              <span className="text-lg">🍽️</span>
            </span>
            <div>
              <h1 className="font-bold text-stone-900 leading-tight">
                RestaurantGo
              </h1>
              <p className="text-xs text-stone-500 leading-tight">
                Panel de dueños
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link
              to="/dueno/perfil"
              className="flex items-center gap-2 hover:opacity-80 transition"
              title="Mi perfil"
            >
              <div className="hidden sm:flex flex-col items-end">
                <span className="font-medium text-stone-800">
                  {user?.nombreCompleto ?? ""}
                </span>
                <span className="text-xs text-stone-500">
                  {user?.tipo ?? ""}
                </span>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-forest-500 to-forest-700 flex items-center justify-center text-cream-50 font-medium shadow-sm">
                {user?.nombreCompleto?.charAt(0).toUpperCase() ?? "?"}
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="btn-ghost text-sm py-1.5 px-3"
              title="Cerrar sesión"
            >
              Salir
            </button>
          </div>
        </div>

        {/* Barra de navegación */}
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 pb-2 -mt-1 flex items-center gap-1 text-sm">
          <NavLink
            to="/dueno"
            end
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-md font-medium transition ${
                isActive
                  ? "bg-forest-100 text-forest-800"
                  : "text-stone-600 hover:bg-cream-100 hover:text-stone-800"
              }`
            }
          >
            🏠 Mis restaurantes
          </NavLink>
          {primerResto && (
            <NavLink
              to={vistasHref}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md font-medium transition ${
                  isActive
                    ? "bg-forest-100 text-forest-800"
                    : "text-stone-600 hover:bg-cream-100 hover:text-stone-800"
                }`
              }
            >
              🪑 Vista de mesa
            </NavLink>
          )}
          <NavLink
            to="/demo/clientes"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-md font-medium transition ${
                isActive
                  ? "bg-forest-100 text-forest-800"
                  : "text-stone-600 hover:bg-cream-100 hover:text-stone-800"
              }`
            }
          >
            👥 Guestbook clientes
          </NavLink>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
