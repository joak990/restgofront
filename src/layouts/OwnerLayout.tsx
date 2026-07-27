// filepath: src/layouts/OwnerLayout.tsx
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';

export default function OwnerLayout() {
  const navigate = useNavigate();
  const user = authApi.currentUser();

  const handleLogout = () => {
    authApi.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-bold text-lg text-gray-900">
            🍽️ RestaurantGo · Owners
          </Link>
          <div className="flex items-center gap-4 text-sm">
            {user && (
              <span className="text-gray-700">
                {user.nombreCompleto} <span className="text-gray-400">({user.tipo})</span>
              </span>
            )}
            <button
              onClick={handleLogout}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        <Outlet />
      </div>
    </div>
  );
}
