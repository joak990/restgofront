// filepath: src/pages/AdminRestaurantesPage.tsx
// Panel admin: restaurantes activos agrupados por provincia.
// Vista de tabla compacta para que entren muchos por pantalla.

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
  const [detalle, setDetalle] = useState<RestauranteEnGrupo | null>(null);

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
        <div className="card p-8 text-center bg-cream-50/40 border-dashed border-cream-300">
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
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-semibold text-stone-700 uppercase tracking-wide">
                  {g.provinciaNombre}
                </h3>
                <span className="text-xs text-stone-500">({g.total})</span>
                <div className="flex-1 h-px bg-cream-200 ml-1" />
              </div>
              <div className="overflow-hidden rounded-xl border border-cream-200 bg-white shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-cream-50 text-left text-stone-700">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Restaurante</th>
                      <th className="px-3 py-2 font-semibold hidden md:table-cell">
                        Ciudad
                      </th>
                      <th className="px-3 py-2 font-semibold hidden lg:table-cell">
                        Cocina
                      </th>
                      <th className="px-3 py-2 font-semibold">Dueño</th>
                      <th className="px-3 py-2 font-semibold w-24 text-center">
                        Estado
                      </th>
                      <th className="px-3 py-2 font-semibold w-20 text-right">
                        $
                      </th>
                      <th className="px-3 py-2 font-semibold w-24 text-right">
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-100">
                    {g.restaurantes.map((r) => (
                      <tr
                        key={r.id}
                        className="hover:bg-cream-50/60 transition cursor-pointer"
                        onClick={() => setDetalle(r)}
                      >
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-md bg-cream-100 overflow-hidden shrink-0 flex items-center justify-center text-stone-400 text-sm">
                              {r.urlImagenPortada ? (
                                <img
                                  src={r.urlImagenPortada}
                                  alt={r.nombre}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                "🍽️"
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-stone-900 truncate">
                                {r.nombre}
                              </div>
                              <div className="text-xs text-stone-500 truncate">
                                {r._count.platos} platos · {r._count.mesas}{" "}
                                mesas
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-stone-700 hidden md:table-cell">
                          {r.ciudad?.nombre ?? "—"}
                        </td>
                        <td className="px-3 py-2 text-stone-700 hidden lg:table-cell">
                          {r.tipoCocina ?? "—"}
                        </td>
                        <td className="px-3 py-2 text-stone-700">
                          <div className="truncate max-w-[180px]">
                            {r.dueno.nombreCompleto}
                          </div>
                          <div className="text-xs text-stone-500 truncate">
                            {r.dueno.correo}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${
                              r.verificado
                                ? "bg-forest-100 text-forest-800 border-forest-200"
                                : "bg-amber-100 text-amber-800 border-amber-200"
                            }`}
                          >
                            {r.verificado ? "Verif." : "Pend."}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right text-stone-700">
                          {RANGO_PRECIO_LABEL[r.rangoPrecio] ??
                            `$${r.rangoPrecio}`}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDetalle(r);
                            }}
                            className="text-xs px-2 py-1 rounded bg-forest-600 text-cream-50 hover:bg-forest-700 transition"
                          >
                            Ver detalle
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Modal de detalle */}
      {detalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDetalle(null)}
          />
          <div className="relative card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h3 className="text-xl font-bold text-stone-900">
                  {detalle.nombre}
                </h3>
                <p className="text-sm text-stone-500">
                  {detalle.tipoCocina ?? "Sin tipo de cocina"}
                  {detalle.ciudad?.nombre ? ` · ${detalle.ciudad.nombre}` : ""}
                </p>
              </div>
              <button
                onClick={() => setDetalle(null)}
                className="text-stone-400 hover:text-stone-700 text-2xl leading-none"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <div className="aspect-[16/9] bg-gradient-to-br from-stone-100 to-stone-200 rounded-lg overflow-hidden mb-4">
              {detalle.urlImagenPortada ? (
                <img
                  src={detalle.urlImagenPortada}
                  alt={detalle.nombre}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl text-stone-400">
                  🍽️
                </div>
              )}
            </div>

            <section className="mb-4">
              <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
                Datos
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-stone-500">Rango de precio</span>
                  <div className="text-stone-900">
                    {RANGO_PRECIO_LABEL[detalle.rangoPrecio] ??
                      `$${detalle.rangoPrecio}`}
                  </div>
                </div>
                <div>
                  <span className="text-stone-500">Estado</span>
                  <div>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${
                        detalle.verificado
                          ? "bg-forest-100 text-forest-800 border-forest-200"
                          : "bg-amber-100 text-amber-800 border-amber-200"
                      }`}
                    >
                      {detalle.verificado ? "Verificado" : "No verificado"}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-stone-500">Platos</span>
                  <div className="text-stone-900">{detalle._count.platos}</div>
                </div>
                <div>
                  <span className="text-stone-500">Mesas</span>
                  <div className="text-stone-900">{detalle._count.mesas}</div>
                </div>
              </div>
            </section>

            <section className="mb-4">
              <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
                Dueño
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-stone-500">Nombre</span>
                  <div className="text-stone-900">
                    {detalle.dueno.nombreCompleto}
                  </div>
                </div>
                <div>
                  <span className="text-stone-500">Correo</span>
                  <div className="text-stone-900 truncate">
                    {detalle.dueno.correo}
                  </div>
                </div>
                <div>
                  <span className="text-stone-500">Estado verificación</span>
                  <div>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${
                        detalle.dueno.estadoVerificacion === "VERIFICADO"
                          ? "bg-forest-100 text-forest-800 border-forest-200"
                          : "bg-amber-100 text-amber-800 border-amber-200"
                      }`}
                    >
                      {detalle.dueno.estadoVerificacion}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
