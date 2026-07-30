import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { guestbookMock } from "../data/guestbookMock";

export default function ClientesPage() {
  const { id } = useParams<{ id: string }>();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(guestbookMock[0]?.id ?? null);

  const filteredGuests = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q === "") return guestbookMock;
    return guestbookMock.filter((guest) => {
      return (
        guest.nombre.toLowerCase().includes(q) ||
        guest.telefono.toLowerCase().includes(q) ||
        guest.correo.toLowerCase().includes(q)
      );
    });
  }, [search]);

  const selectedGuest = guestbookMock.find((guest) => guest.id === selectedId) ?? filteredGuests[0] ?? null;

  function formatDateToArg(dateStr: string) {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = String(d.getFullYear());
      return `${dd}-${mm}-${yyyy}`;
    } catch {
      return dateStr;
    }
  }

  return (
    <div className="bg-cream-50 min-h-screen pb-8">
      <div className="max-w-7xl mx-auto px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-forest-700 font-semibold">
            {id ? `Restaurante ${id}` : "Demo cliente"}
          </p>
          <h1 className="text-3xl font-bold text-stone-900">Guestbook de reservas</h1>
          <p className="mt-2 text-sm text-stone-600 max-w-2xl">
            Lista de clientes que hicieron una reserva con los datos clave para seguimiento y contacto.
          </p>
        </div>

        <div className="rounded-3xl border border-cream-300 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Reservas registradas</p>
          <p className="text-2xl font-semibold text-forest-800">{guestbookMock.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <aside className="col-span-12 lg:col-span-4 xl:col-span-3 flex flex-col rounded-[32px] border border-cream-300 bg-white shadow-sm overflow-hidden lg:h-[calc(100vh-6rem)]">
          <div className="px-5 py-4 border-b border-cream-200 bg-cream-100">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-forest-800">Clientes</p>
                <p className="text-xs text-stone-500">Busca por nombre, teléfono o correo</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-forest-700 px-3 py-1 text-xs font-semibold text-cream-50">
                {filteredGuests.length} encontrados
              </span>
            </div>
            <div className="mt-4">
              <label className="sr-only" htmlFor="guest-search">
                Buscar clientes
              </label>
              <div className="relative">
                <input
                  id="guest-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nombre o teléfono"
                  className="w-full rounded-2xl border border-cream-300 bg-cream-50 px-4 py-2 text-sm text-stone-800 outline-none transition focus:border-forest-500 focus:ring-2 focus:ring-forest-200"
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-stone-400">🔍</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredGuests.length === 0 ? (
              <div className="p-6 text-center text-sm text-stone-500">No hay clientes que coincidan con la búsqueda.</div>
            ) : (
              <ul className="space-y-1 p-4">
                {filteredGuests.map((guest) => {
                  const active = guest.id === selectedGuest?.id;
                  return (
                    <li key={guest.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(guest.id)}
                        className={`w-full rounded-3xl border px-4 py-4 text-left transition ${
                          active
                            ? "border-forest-700 bg-forest-50 shadow-sm"
                            : "border-cream-200 bg-white hover:border-forest-300 hover:bg-cream-50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-stone-900">{guest.nombre}</p>
                            <p className="mt-1 text-sm text-stone-500">{guest.telefono}</p>
                          </div>
                          <span className="rounded-full bg-cream-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-stone-600">
                            {guest.ultimoEstado}
                          </span>
                        </div>
                        <div className="mt-3 text-sm text-stone-500">
                          {guest.compania ?? "Sin compañía"} · {guest.ciudad}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        <section className="col-span-12 lg:col-span-8 xl:col-span-9 space-y-4 lg:sticky lg:top-24 self-start">
          {selectedGuest ? (
            <div className="rounded-[32px] border border-cream-300 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-forest-700">Detalle del cliente</p>
                  <h2 className="mt-2 text-3xl font-bold text-stone-900">{selectedGuest.nombre}</h2>
                  <p className="mt-1 text-sm text-stone-500">Reservó para {selectedGuest.ultimaReserva}</p>
                </div>
                {/* Phone badge removed as requested */}
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <InfoCard label="Email" value={selectedGuest.correo.toLowerCase()} />
                <InfoCard label="Fecha de la reserva" value={selectedGuest.ultimaReserva} />
                <InfoCard label="Dirección" value={selectedGuest.direccion} />
                <InfoCard label="Ciudad" value={selectedGuest.ciudad} />
              </div>

              <div className="mt-6">
                <div className="rounded-3xl border border-cream-200 bg-cream-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Notas internas</p>
                  <p className="mt-3 text-sm leading-6 text-stone-700">
                    {selectedGuest.notas ?? "No hay notas adicionales."}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <CardGroup label="Teléfono" value={selectedGuest.telefono} />
                <CardGroup label="Fecha de nacimiento" value={formatDateToArg(selectedGuest.birthday)} />
              </div>
            </div>
          ) : (
            <div className="rounded-[32px] border border-cream-300 bg-white p-6 text-center text-stone-500 shadow-sm">
              Selecciona un cliente para ver sus datos.
            </div>
          )}
        </section>
      </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-cream-200 bg-cream-50 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-stone-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-stone-900">{value}</p>
    </div>
  );
}



function CardGroup({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-cream-200 bg-cream-50 p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-stone-500">{label}</p>
      <p className="mt-4 text-xl font-semibold text-stone-900">{value}</p>
    </div>
  );
}
