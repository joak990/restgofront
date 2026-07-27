// filepath: src/api/duenos.ts
import { apiClient } from "./client";

export interface Restaurante {
  id: string;
  nombre: string;
  descripcion?: string | null;
  tipoCocina?: string | null;
  direccion: string;
  telefono?: string | null;
  correo?: string | null;
  urlInstagram?: string | null;
  urlImagenPortada?: string | null;
  urlLogo?: string | null;
  rangoPrecio: number;
  activo: boolean;
  verificado: boolean;
  provinciaId: string;
  ciudadId: string;
  ciudad?: { nombre: string } | null;
  provincia?: { nombre: string } | null;
  _count?: { platos: number; mesas: number };
}

export interface Horario {
  id: string;
  restauranteId: string;
  diaSemana: number;
  horaApertura: string;
  horaCierre: string;
  cerrado: boolean;
}

export interface Mesa {
  id: string;
  restauranteId: string;
  nombre: string | null;
  capacidad: number;
  activo: boolean;
}

export type EstadoReserva =
  "PENDIENTE" | "CONFIRMADA" | "CANCELADA" | "NO_ASISTIO" | "COMPLETADA";

export interface Reserva {
  id: string;
  restauranteId: string;
  mesaId: string | null;
  mesaNombre: string | null;
  fechaReserva: string;
  horaReserva: string;
  cantidadPersonas: number;
  estado: EstadoReserva | string;
  nombreCliente: string | null;
  telefonoCliente: string | null;
  creadaEn: string;
  confirmadaEn: string | null;
  canceladaEn: string | null;
  cliente: {
    id: string;
    nombreCompleto: string;
    correo: string;
    telefono: string | null;
  } | null;
}

export interface Provincia {
  id: string;
  nombre: string;
  codigoIgn: string;
}

export interface Ciudad {
  id: string;
  nombre: string;
  provinciaId: string;
}

export interface CalendarioSlot {
  hora: string;
  bloque: number;
  mesasDisponibles: number;
  totalMesas: number;
}

export interface CalendarioReserva {
  id: string;
  horaReserva: string;
  horaFin: string;
  cantidadPersonas: number;
  estado: string;
  nombreCliente: string | null;
  telefonoCliente: string | null;
  mesa: { id: string; nombre: string | null } | null;
  cliente: {
    id: string;
    nombreCompleto: string;
    correo: string;
    telefono: string | null;
  } | null;
}

export interface CalendarioResponse {
  fecha: string;
  diaSemana: number;
  horarios: {
    id: string;
    horaApertura: string;
    horaCierre: string;
    cerrado: boolean;
  }[];
  slots: CalendarioSlot[];
  reservas: CalendarioReserva[];
}

export interface CreateRestauranteBody {
  nombre: string;
  descripcion?: string;
  tipoCocina?: string;
  direccion: string;
  provinciaId: string;
  ciudadId: string;
  codigoPostal?: string;
  latitud?: number;
  longitud?: number;
  telefono?: string;
  correo?: string;
  urlInstagram?: string;
  urlImagenPortada?: string;
  urlLogo?: string;
  rangoPrecio?: number;
}

export interface UpdateRestauranteBody extends Partial<CreateRestauranteBody> {}

export interface PerfilRestaurante {
  id: string;
  nombre: string;
  nivelSuscripcion: string;
  estadoSuscripcion: string;
  suscripcionFin: string | null;
  activo: boolean;
  verificado: boolean;
  _count: { mesas: number; platos: number };
}

export interface PerfilResponse {
  id: string;
  correo: string;
  nombreCompleto: string;
  dni: string;
  cuitCuil: string | null;
  telefono: string;
  direccion: string;
  provinciaId: string;
  ciudadId: string;
  codigoPostal: string | null;
  fechaNacimiento: string | null;
  urlAvatar: string | null;
  estadoVerificacion: string;
  provincia: { id: string; nombre: string } | null;
  ciudad: { id: string; nombre: string } | null;
  restaurantes: PerfilRestaurante[];
  totalRestaurantes: number;
  totalMesas: number;
}

export interface ActualizarPerfilBody {
  nombreCompleto?: string;
  telefono?: string;
  direccion?: string;
  provinciaId?: string;
  ciudadId?: string;
  codigoPostal?: string;
  urlAvatar?: string;
}

export const duenosApi = {
  // Restaurantes del dueño autenticado
  async getMisRestaurantes(): Promise<Restaurante[]> {
    const { data } = await apiClient.get<Restaurante[]>("/duenos/restaurantes");
    return data;
  },

  async createRestaurante(body: CreateRestauranteBody): Promise<Restaurante> {
    const { data } = await apiClient.post<Restaurante>(
      "/duenos/restaurantes",
      body,
    );
    return data;
  },

  async updateRestaurante(
    restauranteId: string,
    body: UpdateRestauranteBody,
  ): Promise<Restaurante> {
    const { data } = await apiClient.patch<Restaurante>(
      `/duenos/restaurantes/${restauranteId}`,
      body,
    );
    return data;
  },

  // Ubicaciones
  async getProvincias(): Promise<Provincia[]> {
    const { data } = await apiClient.get<Provincia[]>(
      "/ubicaciones/provincias",
    );
    return data;
  },

  async getCiudades(provinciaId: string): Promise<Ciudad[]> {
    const { data } = await apiClient.get<Ciudad[]>(
      `/ubicaciones/provincias/${provinciaId}/ciudades`,
    );
    return data;
  },

  // Horarios
  async getHorarios(restauranteId: string): Promise<Horario[]> {
    const { data } = await apiClient.get<Horario[]>(
      `/duenos/restaurantes/${restauranteId}/horarios`,
    );
    return data;
  },
  async createHorario(
    restauranteId: string,
    body: Omit<Horario, "id" | "restauranteId">,
  ): Promise<Horario> {
    const { data } = await apiClient.post<Horario>(
      `/duenos/restaurantes/${restauranteId}/horarios`,
      body,
    );
    return data;
  },
  async bulkCreateHorarios(
    restauranteId: string,
    horarios: Array<Omit<Horario, "id" | "restauranteId">>,
  ): Promise<Horario[]> {
    const { data } = await apiClient.post<Horario[]>(
      `/duenos/restaurantes/${restauranteId}/horarios/bulk`,
      { horarios },
    );
    return data;
  },
  async updateHorario(
    restauranteId: string,
    horarioId: string,
    body: Partial<Omit<Horario, "id" | "restauranteId">>,
  ): Promise<Horario> {
    const { data } = await apiClient.patch<Horario>(
      `/duenos/restaurantes/${restauranteId}/horarios/${horarioId}`,
      body,
    );
    return data;
  },
  async deleteHorario(restauranteId: string, horarioId: string): Promise<void> {
    await apiClient.delete(
      `/duenos/restaurantes/${restauranteId}/horarios/${horarioId}`,
    );
  },

  // Mesas
  async getMesas(restauranteId: string): Promise<Mesa[]> {
    const { data } = await apiClient.get<Mesa[]>(
      `/duenos/restaurantes/${restauranteId}/mesas`,
    );
    return data;
  },
  async createMesa(
    restauranteId: string,
    body: { nombre?: string; capacidad: number },
  ): Promise<Mesa> {
    const { data } = await apiClient.post<Mesa>(
      `/duenos/restaurantes/${restauranteId}/mesas`,
      body,
    );
    return data;
  },
  async updateMesa(
    restauranteId: string,
    mesaId: string,
    body: { nombre?: string; capacidad?: number; activo?: boolean },
  ): Promise<Mesa> {
    const { data } = await apiClient.patch<Mesa>(
      `/duenos/restaurantes/${restauranteId}/mesas/${mesaId}`,
      body,
    );
    return data;
  },
  async deleteMesa(restauranteId: string, mesaId: string): Promise<void> {
    await apiClient.delete(
      `/duenos/restaurantes/${restauranteId}/mesas/${mesaId}`,
    );
  },

  // Calendario
  async getCalendario(
    restauranteId: string,
    fecha: string,
  ): Promise<CalendarioResponse> {
    const { data } = await apiClient.get<CalendarioResponse>(
      `/duenos/restaurantes/${restauranteId}/calendario`,
      { params: { fecha } },
    );
    return data;
  },

  // Reservas
  async getReservas(
    restauranteId: string,
    filtros?: { desde?: string; hasta?: string; estado?: string },
  ): Promise<Reserva[]> {
    const { data } = await apiClient.get<Reserva[]>(
      `/duenos/restaurantes/${restauranteId}/reservas`,
      { params: filtros },
    );
    return data;
  },

  async getReserva(restauranteId: string, reservaId: string): Promise<Reserva> {
    const { data } = await apiClient.get<Reserva>(
      `/duenos/restaurantes/${restauranteId}/reservas/${reservaId}`,
    );
    return data;
  },

  async actualizarEstadoReserva(
    restauranteId: string,
    reservaId: string,
    estado: "CONFIRMADA" | "CANCELADA" | "NO_ASISTIO" | "COMPLETADA",
  ): Promise<Reserva> {
    const { data } = await apiClient.patch<Reserva>(
      `/duenos/restaurantes/${restauranteId}/reservas/${reservaId}`,
      { estado },
    );
    return data;
  },

  async crearReservaDueno(
    restauranteId: string,
    body: {
      fecha: string;
      hora: string;
      cantidadPersonas: number;
      nombreCliente?: string;
      telefonoCliente?: string;
      mesaId?: string;
      pedidosEspeciales?: string;
    },
  ): Promise<Reserva> {
    const { data } = await apiClient.post<Reserva>(
      `/duenos/restaurantes/${restauranteId}/reservas`,
      body,
    );
    return data;
  },

  // Perfil del dueño
  async getPerfil(): Promise<PerfilResponse> {
    const { data } = await apiClient.get<PerfilResponse>("/duenos/perfil");
    return data;
  },

  async actualizarPerfil(body: ActualizarPerfilBody): Promise<PerfilResponse> {
    const { data } = await apiClient.patch<PerfilResponse>(
      "/duenos/perfil",
      body,
    );
    return data;
  },
};
