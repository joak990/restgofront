// filepath: src/pages/RestauranteDetallePage.tsx
import { NavLink, Outlet, useParams } from 'react-router-dom';

const tabs = [
  { to: '', label: 'Info', icon: '📋' },
  { to: 'horarios', label: 'Horarios', icon: '🕐' },
  { to: 'mesas', label: 'Mesas', icon: '🪑' },
  { to: 'reservas', label: 'Reservas', icon: '📅' },
];

export default function RestauranteDetallePage() {
  const { id } = useParams();

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <span className="text-3xl">🍴</span>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Restaurante</h1>
          <p className="text-xs text-stone-500 font-mono">{id}</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-stone-100 flex gap-1 px-2">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end
              className={({ isActive }) =>
                `px-4 py-3 text-sm font-medium transition flex items-center gap-2 ${
                  isActive ? 'tab-active' : 'tab-idle'
                }`
              }
            >
              <span>{t.icon}</span>
              {t.label}
            </NavLink>
          ))}
        </div>
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
