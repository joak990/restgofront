// filepath: src/pages/RestauranteDetallePage.tsx
import { NavLink, Outlet, useParams } from 'react-router-dom';

const tabs = [
  { to: '', label: 'Info' },
  { to: 'horarios', label: 'Horarios' },
  { to: 'mesas', label: 'Mesas' },
];

export default function RestauranteDetallePage() {
  const { id } = useParams();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Restaurante</h1>
      <p className="text-sm text-gray-500 mb-4">ID: {id}</p>

      <div className="border-b mb-4 flex gap-1">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end
            className={({ isActive }) =>
              `px-4 py-2 text-sm border-b-2 transition ${
                isActive
                  ? 'border-blue-600 text-blue-700 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  );
}
