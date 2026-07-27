// filepath: src/layouts/OwnerLayout.tsx
import { Link, Outlet, useNavigate } from "react-router-dom";
import { authApi } from "../api/auth";

export default function OwnerLayout() {
  const navigate = useNavigate();
  const user = authApi.currentUser();

  const handleLogout = () => {
    authApi.logout();
    navigate("/login");
  };

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
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
