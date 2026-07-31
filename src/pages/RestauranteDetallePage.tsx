// filepath: src/pages/RestauranteDetallePage.tsx
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useParams } from 'react-router-dom';
import { duenosApi, type Restaurante } from '../api/duenos';

const tabs = [
  { to: '', label: 'Info' },
  { to: 'horarios', label: 'Horarios' },
  { to: 'mesas', label: 'Mesas' },
  { to: 'reservas', label: 'Reservas' },
  { to: 'clientes', label: 'Clientes' },
];

export default function RestauranteDetallePage() {
  const { id } = useParams();
  const [restaurante, setRestaurante] = useState<Restaurante | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelado = false;
    duenosApi
      .getMisRestaurantes()
      .then((lista) => {
        if (!cancelado) {
          setRestaurante(lista.find((r) => r.id === id) ?? null);
        }
      })
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, [id]);

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <span className="text-3xl">🍴</span>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            {restaurante?.nombre ?? 'Restaurante'}
          </h1>
          {restaurante?.tipoCocina && (
            <p className="text-xs text-stone-500">{restaurante.tipoCocina}</p>
          )}
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
