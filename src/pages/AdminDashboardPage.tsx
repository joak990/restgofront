// filepath: src/pages/AdminDashboardPage.tsx
// Dashboard ejecutivo con métricas de la plataforma.
//
// Visualización: lightweight-charts para series de tiempo,
// tarjetas HTML para KPIs y una grilla simple para distribución por estado.

import { useEffect, useMemo, useState } from "react";
import {
  createChart,
  LineSeries,
  AreaSeries,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import {
  adminApi,
  type DashboardResumen,
  type DuenosPorEstado,
  type PuntoSerie,
} from "../api/admin";

type Rango = "7d" | "30d" | "90d";

const RANGO_LABEL: Record<Rango, string> = {
  "7d": "Últimos 7 días",
  "30d": "Últimos 30 días",
  "90d": "Últimos 90 días",
};

function diasAtras(rango: Rango): number {
  if (rango === "7d") return 7;
  if (rango === "30d") return 30;
  return 90;
}

function formatPesos(centavos: number): string {
  const pesos = centavos / 100;
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(pesos);
}

export default function AdminDashboardPage() {
  const [resumen, setResumen] = useState<DashboardResumen | null>(null);
  const [duenosEstado, setDuenosEstado] = useState<DuenosPorEstado | null>(
    null,
  );
  const [usuarios, setUsuarios] = useState<{
    duenos: PuntoSerie[];
    clientes: PuntoSerie[];
  } | null>(null);
  const [restaurantes, setRestaurantes] = useState<PuntoSerie[]>([]);
  const [reservas, setReservas] = useState<PuntoSerie[]>([]);
  const [reservasTurno, setReservasTurno] = useState<PuntoSerie[]>([]);
  const [rango, setRango] = useState<Rango>("30d");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function cargar() {
    setCargando(true);
    setError(null);
    const hoy = new Date();
    const hace = new Date();
    hace.setDate(hoy.getDate() - diasAtras(rango));
    const desde = hace.toISOString().slice(0, 10);
    const hasta = hoy.toISOString().slice(0, 10);

    Promise.all([
      adminApi.getDashboardResumen(),
      adminApi.getDuenosPorEstado(),
      adminApi.getUsuariosNuevos({ desde, hasta }),
      adminApi.getRestaurantesNuevos({ desde, hasta }),
      adminApi.getReservasDashboard({
        desde,
        hasta,
        granularidad: "dia",
      }),
      adminApi.getReservasPorTurno({
        desde,
        hasta,
        granularidad: "dia",
      }),
    ])
      .then(([r, d, u, rn, rs, rt]) => {
        setResumen(r);
        setDuenosEstado(d);
        setUsuarios(u);
        setRestaurantes(rn);
        setReservas(rs);
        setReservasTurno(rt);
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rango]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-semibold text-stone-900">Dashboard</h2>
        <div className="flex gap-1.5">
          {(Object.keys(RANGO_LABEL) as Rango[]).map((r) => (
            <button
              key={r}
              onClick={() => setRango(r)}
              className={`text-xs px-3 py-1.5 rounded-full border transition ${
                rango === r
                  ? "bg-forest-600 text-cream-50 border-forest-600 shadow-sm"
                  : "bg-white text-stone-700 border-stone-200 hover:bg-cream-100 hover:border-stone-300"
              }`}
            >
              {RANGO_LABEL[r]}
            </button>
          ))}
          <button
            onClick={cargar}
            className="text-xs px-3 py-1.5 rounded-full border bg-white text-stone-700 border-stone-200 hover:bg-cream-100 hover:border-stone-300"
            title="Refrescar"
          >
            Refrescar
          </button>
        </div>
      </div>

      {error && (
        <div className="card p-4 text-red-700 bg-red-50 border-red-200 mb-4">
          {error}
        </div>
      )}

      {cargando && !resumen ? (
        <div className="text-stone-500 flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-stone-600 border-t-transparent rounded-full animate-spin" />
          Cargando métricas…
        </div>
      ) : resumen ? (
        <>
          {/* KPIs principales */}
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4 mb-6">
            <KpiCard
              label="Dueños"
              total={resumen.totales.duenos}
              delta={resumen.ultimos7Dias.duenosNuevos}
              deltaLabel="últ. 7d"
            />
            <KpiCard
              label="Clientes"
              total={resumen.totales.clientes}
              delta={resumen.ultimos7Dias.clientesNuevos}
              deltaLabel="últ. 7d"
            />
            <KpiCard
              label="Restaurantes"
              total={resumen.totales.restaurantes}
              delta={resumen.ultimos7Dias.restaurantesNuevos}
              deltaLabel="últ. 7d"
            />
            <KpiCard
              label="Reservas"
              total={resumen.totales.reservas}
              delta={resumen.ultimos7Dias.reservas}
              deltaLabel="últ. 7d"
            />
          </div>

          {/* KPIs secundarios */}
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4 mb-6">
            <CardMini
              label="Hoy"
              value={`${resumen.hoy.duenosNuevos} dueños · ${resumen.hoy.clientesNuevos} clientes · ${resumen.hoy.reservas} reservas`}
            />
            <CardMini
              label="Verificados"
              value={`${resumen.totales.duenosVerificados}/${resumen.totales.duenos} dueños`}
            />
            <CardMini
              label="Pendientes"
              value={`${resumen.totales.duenosPendientes} dueños`}
            />
            <CardMini
              label="Ingresos"
              value={formatPesos(resumen.totales.ingresosTotalesCentavos)}
            />
          </div>

          {/* Charts */}
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard
              title="Usuarios nuevos"
              subtitle="Dueños y clientes por día"
              data={usuarios?.duenos ?? []}
              data2={usuarios?.clientes ?? []}
              series1Name="Dueños"
              series2Name="Clientes"
              tipo="line"
            />
            <ChartCard
              title="Reservas por día de turno"
              subtitle="Cuándo se va a sentar el cliente"
              data={reservasTurno}
              tipo="area"
              serieName="Reservas"
            />
            <ChartCard
              title="Reservas creadas por día"
              subtitle="Cuándo se hizo la reserva"
              data={reservas}
              tipo="area"
              serieName="Reservas"
            />
            <ChartCard
              title="Restaurantes nuevos"
              subtitle="Nuevos restaurantes por día"
              data={restaurantes}
              tipo="area"
              serieName="Restaurantes"
            />
            <DistribucionCard estado={duenosEstado} />
          </div>
        </>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-componentes
// ---------------------------------------------------------------------------

function KpiCard({
  label,
  total,
  delta,
  deltaLabel,
}: {
  label: string;
  total: number;
  delta?: number;
  deltaLabel?: string;
}) {
  return (
    <div className="card p-4">
      <div className="text-xs uppercase tracking-wide text-stone-500">
        {label}
      </div>
      <div className="text-2xl font-bold text-stone-900 mt-1">
        {total.toLocaleString("es-AR")}
      </div>
      {delta !== undefined && (
        <div className="text-xs text-stone-500 mt-1">
          +{delta} {deltaLabel}
        </div>
      )}
    </div>
  );
}

function CardMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <div className="text-xs uppercase tracking-wide text-stone-500">
        {label}
      </div>
      <div className="text-sm font-semibold text-stone-900 mt-1">{value}</div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  data,
  data2,
  serieName,
  series1Name,
  series2Name,
  tipo,
}: {
  title: string;
  subtitle: string;
  data: PuntoSerie[];
  data2?: PuntoSerie[];
  serieName?: string;
  series1Name?: string;
  series2Name?: string;
  tipo: "line" | "area";
}) {
  const containerId = useMemo(
    () => `chart-${Math.random().toString(36).slice(2, 9)}`,
    [],
  );

  useEffect(() => {
    const el = document.getElementById(containerId);
    if (!el || data.length === 0) return;

    const chart: IChartApi = createChart(el, {
      width: el.clientWidth,
      height: 240,
      layout: {
        background: { color: "#ffffff" },
        textColor: "#44403c",
      },
      grid: {
        vertLines: { color: "#f5f5f4" },
        horzLines: { color: "#f5f5f4" },
      },
      rightPriceScale: { borderColor: "#e7e5e4" },
      timeScale: {
        borderColor: "#e7e5e4",
        tickMarkFormatter: (t: UTCTimestamp) => {
          const d = new Date(t * 1000);
          return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
        },
      },
      handleScale: false,
      handleScroll: false,
    });

    const tsToValue = (rows: PuntoSerie[]) =>
      rows.map((p) => ({
        // 'YYYY-MM-DD' → epoch seconds (lightweight-charts requiere number).
        time: Math.floor(Date.parse(p.fecha) / 1000) as UTCTimestamp,
        value: p.valor,
      }));

    if (tipo === "area") {
      const series: ISeriesApi<"Area"> = chart.addSeries(AreaSeries, {
        lineColor: "#166534",
        topColor: "#16653455",
        bottomColor: "#16653411",
        priceFormat: { type: "volume" },
      });
      series.setData(tsToValue(data));
    } else {
      const s1: ISeriesApi<"Line"> = chart.addSeries(LineSeries, {
        color: "#166534",
        lineWidth: 2,
      });
      s1.setData(tsToValue(data));
      if (data2) {
        const s2: ISeriesApi<"Line"> = chart.addSeries(LineSeries, {
          color: "#0ea5e9",
          lineWidth: 2,
        });
        s2.setData(tsToValue(data2));
      }
    }

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (el.clientWidth > 0) {
        chart.applyOptions({ width: el.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [containerId, data, data2, tipo, serieName, series1Name, series2Name]);

  return (
    <div className="card p-4">
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-stone-900">{title}</h3>
        <p className="text-xs text-stone-500">{subtitle}</p>
      </div>
      {data.length === 0 ? (
        <div className="h-60 flex items-center justify-center text-stone-400 text-sm">
          Sin datos en el rango seleccionado
        </div>
      ) : (
        <div id={containerId} className="w-full" />
      )}
      {(series1Name || series2Name) && (
        <div className="flex gap-3 mt-2 text-xs text-stone-500">
          {series1Name && (
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#166534]" />
              {series1Name}
            </span>
          )}
          {series2Name && (
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0ea5e9]" />
              {series2Name}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function DistribucionCard({ estado }: { estado: DuenosPorEstado | null }) {
  if (!estado) {
    return (
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-stone-900 mb-2">
          Distribución de dueños
        </h3>
        <div className="h-60 flex items-center justify-center text-stone-400 text-sm">
          Sin datos
        </div>
      </div>
    );
  }

  const total = Object.values(estado).reduce((a, b) => a + b, 0);
  const items = [
    { label: "Pendientes", value: estado.PENDIENTE, color: "bg-amber-500" },
    {
      label: "En revisión",
      value: estado.EN_REVISION,
      color: "bg-sky-500",
    },
    {
      label: "Verificados",
      value: estado.VERIFICADO,
      color: "bg-forest-600",
    },
    { label: "Rechazados", value: estado.RECHAZADO, color: "bg-red-500" },
  ];

  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold text-stone-900">
        Distribución de dueños
      </h3>
      <p className="text-xs text-stone-500 mb-3">{total} dueños en total</p>
      <div className="space-y-2">
        {items.map((it) => {
          const pct = total > 0 ? (it.value / total) * 100 : 0;
          return (
            <div key={it.label}>
              <div className="flex justify-between text-xs text-stone-600 mb-1">
                <span>{it.label}</span>
                <span className="font-semibold text-stone-800">
                  {it.value} ({pct.toFixed(0)}%)
                </span>
              </div>
              <div className="h-2 bg-stone-100 rounded overflow-hidden">
                <div
                  className={`h-full ${it.color} transition-all`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
