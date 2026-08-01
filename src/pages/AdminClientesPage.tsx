// filepath: src/pages/AdminClientesPage.tsx
// Panel admin: listado de todos los clientes (con búsqueda y filtros).

import { useEffect, useMemo, useState } from "react";
import {
  adminApi,
  type ClienteDetalle,
  type EstadoCliente,
} from "../api/admin";

const ESTADOS: { valor: EstadoCliente | "TODOS"; label: string }[] = [
  { valor: "ACTIVO", label: "Activos" },
  { valor: "SUSPENDIDO", label: "Suspendidos" },
  { valor: "ELIMINADO", label: "Eliminados" },
  { valor: "TODOS", label: "Todos" },
];

const PILL: Record<EstadoCliente, string> = {
  ACTIVO: "bg-forest-100 text-forest-800 border-forest-200",
  SUSPENDIDO: "bg-amber-100 text-amber-800 border-amber-200",
  ELIMINADO: "bg-red-100 text-red-800 border-red-200",
};

export default function AdminClientesPage() {
  const [data, setData] = useState<ClienteDetalle[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoCliente | "TODOS">(
    "ACTIVO",
  );
  const [busqueda, setBusqueda] = useState("");

  function cargar() {
    setCargando(true);
    setError(null);
    const filtro = estadoFiltro === "TODOS" ? undefined : estadoFiltro;
    adminApi
      .listClientes({ estadoCliente: filtro, limit: 100 })
      .then((resp) => setData(resp.data))
      .catch((e) => setError((e as Error).message))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estadoFiltro]);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (c) =>
        c.nombreCompleto.toLowerCase().includes(q) ||
        c.correo.toLowerCase().includes(q),
    );
  }, [data, busqueda]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-semibold text-stone-900">Clientes</h2>
        <span className="text-sm text-stone-500">
          {cargando
            ? "Cargando..."
            : `${filtrados.length} resultado${filtrados.length === 1 ? "" : "s"}`}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        {ESTADOS.map((e) => (
          <button
            key={e.valor}
            onClick={() => setEstadoFiltro(e.valor)}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${
              estadoFiltro === e.valor
                ? "bg-forest-600 text-cream-50 border-forest-600 shadow-sm"
                : "bg-white text-stone-700 border-stone-200 hover:bg-cream-100 hover:border-stone-300"
            }`}
          >
            {e.label}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o correo…"
          className="input"
        />
      </div>

      {error && (
        <div className="card p-4 text-red-700 bg-red-50 border-red-200 mb-4">
          {error}
        </div>
      )}

      {cargando ? (
        <div className="text-stone-500 flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-stone-600 border-t-transparent rounded-full animate-spin" />
          Cargando clientes…
        </div>
      ) : filtrados.length === 0 ? (
        <div className="card p-8 text-center bg-cream-50/40 border-dashed border-cream-300">
          <div className="text-4xl mb-2">📭</div>
          <p className="text-stone-700 font-medium">Sin clientes</p>
          <p className="text-xs text-stone-500 mt-1">
            Cambiá el filtro o esperá a que se registren más clientes.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-cream-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-cream-50 text-left text-stone-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-4 py-3 font-semibold hidden md:table-cell">
                  Teléfono
                </th>
                <th className="px-4 py-3 font-semibold hidden sm:table-cell">
                  Localidad
                </th>
                <th className="px-4 py-3 font-semibold">Reservas</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {filtrados.map((c) => (
                <tr key={c.id} className="hover:bg-cream-50/60 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-cream-100 overflow-hidden shrink-0 flex items-center justify-center">
                        {c.urlAvatar ? (
                          <img
                            src={c.urlAvatar}
                            alt={c.nombreCompleto}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-stone-500 font-medium">
                            {c.nombreCompleto.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-stone-900 truncate">
                          {c.nombreCompleto}
                        </div>
                        <div className="text-xs text-stone-500 truncate">
                          {c.correo}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-stone-700 hidden md:table-cell">
                    {c.telefono ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-stone-700 hidden sm:table-cell">
                    {c.ciudad?.nombre ?? "—"}
                    {c.provincia?.nombre ? `, ${c.provincia.nombre}` : ""}
                  </td>
                  <td className="px-4 py-3 text-stone-700">
                    {c._count.reservas}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${PILL[c.estadoCliente]}`}
                    >
                      {c.estadoCliente}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
