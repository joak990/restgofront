// filepath: src/api/admin.ts
// Cliente para los endpoints de admin (verificación de dueños).
// Los endpoints están protegidos por AdminGuard en el backend
// (restgofront/src/components/RequireAdmin.tsx en el front).

import { apiClient } from "./client";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type EstadoVerificacion =
  "PENDIENTE" | "EN_REVISION" | "VERIFICADO" | "RECHAZADO";

export interface DuenoDetalle {
  id: string;
  correo: string;
  nombreCompleto: string;
  dni: string;
  cuitCuil: string | null;
  telefono: string;
  direccion: string;
  codigoPostal: string | null;
  fechaNacimiento: string | null;
  urlAvatar: string | null;
  urlFotoDniFrente: string | null;
  urlFotoDniDorso: string | null;
  estadoVerificacion: EstadoVerificacion;
  motivoRechazo: string | null;
  verificadoEn: string | null;
  rechazadoEn: string | null;
  creadoEn: string;
  actualizadoEn: string;
  provincia: { id: string; nombre: string } | null;
  ciudad: { id: string; nombre: string } | null;
}

export interface ListDuenosMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListDuenosResponse {
  data: DuenoDetalle[];
  meta: ListDuenosMeta;
}

export interface ListDuenosParams {
  estado?: EstadoVerificacion;
  page?: number;
  limit?: number;
}

// ---------------------------------------------------------------------------
// Clientes
// ---------------------------------------------------------------------------

export type EstadoCliente = "ACTIVO" | "SUSPENDIDO" | "ELIMINADO";

export interface ClienteDetalle {
  id: string;
  correo: string;
  nombreCompleto: string;
  telefono: string | null;
  urlAvatar: string | null;
  estadoCliente: EstadoCliente;
  activo: boolean;
  creadoEn: string;
  provincia: { id: string; nombre: string } | null;
  ciudad: { id: string; nombre: string } | null;
  _count: { reservas: number; pagos: number };
}

export interface ListClientesResponse {
  data: ClienteDetalle[];
  meta: ListDuenosMeta;
}

export interface ListClientesParams {
  estadoCliente?: EstadoCliente;
  provinciaId?: string;
  q?: string;
  page?: number;
  limit?: number;
}

// ---------------------------------------------------------------------------
// Restaurantes
// ---------------------------------------------------------------------------

export interface RestauranteEnGrupo {
  id: string;
  nombre: string;
  tipoCocina: string | null;
  rangoPrecio: number;
  urlImagenPortada: string | null;
  verificado: boolean;
  activo: boolean;
  ciudad: { nombre: string } | null;
  dueno: {
    id: string;
    nombreCompleto: string;
    correo: string;
    estadoVerificacion: string;
  };
  _count: { platos: number; mesas: number };
}

export interface RestauranteGrupoPorProvincia {
  provinciaId: string;
  provinciaNombre: string;
  total: number;
  restaurantes: RestauranteEnGrupo[];
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export interface PuntoSerie {
  fecha: string; // YYYY-MM-DD
  valor: number;
}

export interface DashboardResumen {
  generadoEn: string;
  totales: {
    duenos: number;
    duenosVerificados: number;
    duenosPendientes: number;
    clientes: number;
    restaurantes: number;
    restaurantesVerificados: number;
    platos: number;
    reservas: number;
    pagos: number;
    ingresosTotalesCentavos: number;
  };
  hoy: {
    duenosNuevos: number;
    clientesNuevos: number;
    restaurantesNuevos: number;
    reservas: number;
  };
  ultimos7Dias: {
    duenosNuevos: number;
    clientesNuevos: number;
    restaurantesNuevos: number;
    reservas: number;
  };
}

export interface DuenosPorEstado {
  PENDIENTE: number;
  EN_REVISION: number;
  VERIFICADO: number;
  RECHAZADO: number;
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

export const adminApi = {
  /**
   * Listar dueños con filtros opcionales.
   * GET /admin/duenos?estado=...&page=...&limit=...
   */
  async listDuenos(params: ListDuenosParams = {}): Promise<ListDuenosResponse> {
    const { data } = await apiClient.get<ListDuenosResponse>("/admin/duenos", {
      params,
    });
    return data;
  },

  /**
   * Detalle de un dueño (incluye DNI, avatar, etc.).
   * GET /admin/duenos/:id
   */
  async getDuenoById(id: string): Promise<DuenoDetalle> {
    const { data } = await apiClient.get<DuenoDetalle>(`/admin/duenos/${id}`);
    return data;
  },

  /**
   * Aprobar verificación de un dueño.
   * PATCH /admin/duenos/:id/verificar
   */
  async verificarDueno(id: string): Promise<DuenoDetalle> {
    const { data } = await apiClient.patch<DuenoDetalle>(
      `/admin/duenos/${id}/verificar`,
    );
    return data;
  },

  /**
   * Rechazar verificación de un dueño (requiere motivo).
   * PATCH /admin/duenos/:id/rechazar  body: { motivo: string }
   */
  async rechazarDueno(id: string, motivo: string): Promise<DuenoDetalle> {
    const { data } = await apiClient.patch<DuenoDetalle>(
      `/admin/duenos/${id}/rechazar`,
      { motivo },
    );
    return data;
  },

  /**
   * Listar todos los clientes (admin).
   * GET /admin/clientes?estadoCliente=...&provinciaId=...&q=...&page=...&limit=...
   */
  async listClientes(
    params: ListClientesParams = {},
  ): Promise<ListClientesResponse> {
    const { data } = await apiClient.get<ListClientesResponse>(
      "/admin/clientes",
      { params },
    );
    return data;
  },

  /**
   * Listar todos los restaurantes activos, agrupados por provincia.
   * GET /admin/restaurantes?provinciaId=...
   */
  async listRestaurantes(
    params: { provinciaId?: string } = {},
  ): Promise<RestauranteGrupoPorProvincia[]> {
    const { data } = await apiClient.get<RestauranteGrupoPorProvincia[]>(
      "/admin/restaurantes",
      { params },
    );
    return data;
  },

  // -------------------------------------------------------------------------
  // Dashboard
  // -------------------------------------------------------------------------

  /**
   * Resumen ejecutivo de métricas.
   * GET /admin/dashboard/resumen
   */
  async getDashboardResumen(): Promise<DashboardResumen> {
    const { data } = await apiClient.get<DashboardResumen>(
      "/admin/dashboard/resumen",
    );
    return data;
  },

  /**
   * Distribución de dueños por estado de verificación.
   * GET /admin/dashboard/duenos-por-estado
   */
  async getDuenosPorEstado(): Promise<DuenosPorEstado> {
    const { data } = await apiClient.get<DuenosPorEstado>(
      "/admin/dashboard/duenos-por-estado",
    );
    return data;
  },

  /**
   * Series de tiempo de registros de usuarios.
   * GET /admin/dashboard/usuarios-nuevos?desde=...&hasta=...
   */
  async getUsuariosNuevos(
    params: { desde?: string; hasta?: string } = {},
  ): Promise<{ duenos: PuntoSerie[]; clientes: PuntoSerie[] }> {
    const { data } = await apiClient.get<{
      duenos: PuntoSerie[];
      clientes: PuntoSerie[];
    }>("/admin/dashboard/usuarios-nuevos", { params });
    return data;
  },

  /**
   * Serie de tiempo de restaurantes nuevos.
   * GET /admin/dashboard/restaurantes-nuevos?desde=...&hasta=...
   */
  async getRestaurantesNuevos(
    params: { desde?: string; hasta?: string } = {},
  ): Promise<PuntoSerie[]> {
    const { data } = await apiClient.get<PuntoSerie[]>(
      "/admin/dashboard/restaurantes-nuevos",
      { params },
    );
    return data;
  },

  /**
   * Serie de tiempo de reservas (por fecha de creación).
   * GET /admin/dashboard/reservas?desde=...&hasta=...&granularidad=dia|semana|mes
   */
  async getReservasDashboard(
    params: {
      desde?: string;
      hasta?: string;
      granularidad?: "dia" | "semana" | "mes";
    } = {},
  ): Promise<PuntoSerie[]> {
    const { data } = await apiClient.get<PuntoSerie[]>(
      "/admin/dashboard/reservas",
      { params },
    );
    return data;
  },

  /**
   * Serie de tiempo de reservas por FECHA DEL TURNO (cuándo se va a sentar el cliente).
   * GET /admin/dashboard/reservas-turno?desde=...&hasta=...&granularidad=...
   */
  async getReservasPorTurno(
    params: {
      desde?: string;
      hasta?: string;
      granularidad?: "dia" | "semana" | "mes";
    } = {},
  ): Promise<PuntoSerie[]> {
    const { data } = await apiClient.get<PuntoSerie[]>(
      "/admin/dashboard/reservas-turno",
      { params },
    );
    return data;
  },
};
