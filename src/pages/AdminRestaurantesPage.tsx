// filepath: src/pages/AdminRestaurantesPage.tsx
// Panel admin: listado de todos los restaurantes activos, agrupados por provincia.

import { useEffect, useMemo, useState } from "react";
import {
  adminApi,
  type RestauranteGrupoPorProvincia,
  type RestauranteEnGrupo,
} from "../api/admin";

const RANGO_PRECIO_LABEL: Record<number, string> = {
  1: "$",
  2: "$$",
  3: "$$$",
  4: "$$$$",
};

export default function AdminRestaurantesPage() {
  const [data, setData] = useState<RestauranteGrupoPorProvincia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  function cargar() {
    setCargando(true);
    setError(null);
    adminApi
      .listRestaurantes()
      .then((resp) => setData(resp))
      .catch((e) => setError((e as Error).message))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargar();
  }, []);

  const gruposFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return data;
    return data
      .map((g) => {
        const restaurantesFiltrados = g.restaurantes.filter(
          (r) =>
            r.nombre.toLowerCase().includes(q) ||
            (r.tipoCocina?.toLowerCase().includes(q) ?? false) ||
            (r.ciudad?.nombre.toLowerCase().includes(q) ?? false) ||
            r.dueno.nombreCompleto.toLowerCase().includes(q) ||
            r.dueno.correo.toLowerCase().includes(q),
        );
        return {
          ...g,
          restaurantes: restaurantesFiltrados,
          total: restaurantesFiltrados.length,
        };
      })
      .filter((g) => g.total > 0);
  }, [data, busqueda]);

  const totalRestaurantes = data.reduce((acc, g) => acc + g.total, 0);
  const totalProvincias = data.length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-semibold text-stone-900">Restaurantes</h2>
        <span className="text-sm text-stone-500">
          {cargando
            ? "Cargando..."
            : `${totalRestaurantes} restaurantes activos en ${totalProvincias} ${totalProvincias === 1 ? "provincia" : "provincias"}`}
        </span>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, tipo de cocina, ciudad o dueño…"
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
          Cargando restaurantes…
        </div>
      ) : gruposFiltrados.length === 0 ? (
        <div className="card p-8 text-center bg-stone-100 border-dashed">
          <div className="text-4xl mb-2">📭</div>
          <p className="text-stone-700 font-medium">Sin resultados</p>
          <p className="text-xs text-stone-500 mt-1">
            Probá con otro término de búsqueda.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {gruposFiltrados.map((g) => (
            <section key={g.provinciaId || "sin"}>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-semibold text-stone-700 uppercase tracking-wide">
                  {g.provinciaNombre}
                </h3>
                <span className="text-xs text-stone-500">({g.total})</span>
                <div className="flex-1 h-px bg-stone-200 ml-1" />
              </div>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {g.restaurantes.map((r) => (
                  <RestauranteCard key={r.id} r={r} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function RestauranteCard({ r }: { r: RestauranteEnGrupo }) {
  return (
    <li className="card p-0 overflow-hidden hover:shadow-md transition">
      <div className="aspect-[16/9] bg-gradient-to-br from-stone-100 to-stone-200">
        {r.urlImagenPortada ? (
          <img
            src={r.urlImagenPortada}
            alt={r.nombre}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl text-stone-400">
            🍽️
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-stone-900 text-sm leading-tight">
            {r.nombre}
          </h4>
          <span className="text-xs text-stone-500 shrink-0">
            {RANGO_PRECIO_LABEL[r.rangoPrecio] ?? `$${r.rangoPrecio}`}
          </span>
        </div>
        <div className="text-xs text-stone-500 mt-1 space-y-0.5">
          {r.tipoCocina && <div>{r.tipoCocina}</div>}
          {r.ciudad?.nombre && <div>{r.ciudad.nombre}</div>}
        </div>
        <div className="mt-2 pt-2 border-t border-stone-100">
          <div className="text-[11px] text-stone-500">Dueño</div>
          <div className="text-xs text-stone-700 truncate">
            {r.dueno.nombreCompleto}
          </div>
          <div className="text-[11px] text-stone-500 truncate">
            {r.dueno.correo}
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2 text-[11px]">
          <span
            className={`px-2 py-0.5 rounded-full border font-medium ${
              r.verificado
                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                : "bg-amber-100 text-amber-800 border-amber-200"
            }`}
          >
            {r.verificado ? "Verificado" : "No verificado"}
          </span>
          <span className="text-stone-500">
            {r._count.platos} platos · {r._count.mesas} mesas
          </span>
        </div>
      </div>
    </li>
  );
}
