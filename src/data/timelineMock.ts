// filepath: src/data/timelineMock.ts
// Datos mockeados para la vista timeline (/demo/timeline).
// Modelo simplificado, independiente del floor plan de /demo/reservas:
//
//   • Varias mesas como filas
//   • Una fila "Sin asignar" para reservas sin mesa
//   • Turnos: almuerzo | cena  (sin lunch / sin brunch)
//   • Una reserva se posiciona por hora de inicio + duración

export type TableShape = "rect" | "round" | "square";

export type ReservationEstado =
  | "Confirmada"
  | "Pendiente"
  | "Sentada"
  | "Cancelada";

export type Turno = "almuerzo" | "cena";

export interface TimelineTable {
  id: string;
  numero: string;
  capacidad: number;
  forma: TableShape;
  /** zonas de la mesa (ej: Salón, Terraza) */
  zona: string;
}

export interface TimelineReservation {
  id: string;
  turno: Turno;
  /** HH:MM — hora de inicio */
  hora: string;
  /** duración en minutos (define el ancho del bloque) */
  duracionMin: number;
  partySize: number;
  nombre: string;
  /** mesa asignada (id) o null si va a la fila "Sin asignar" */
  mesaId: string | null;
  estado: ReservationEstado;
  /** Notas opcionales */
  nota?: string;
  /** Tag visual (🎉, 📞, etc) */
  tag?: string;
  /** Teléfono opcional */
  telefono?: string;
}

// --- Configuración del eje de horas del timeline ---
// Un solo eje corrido para todo el día (sin separar almuerzo / cena):
//   12:00 -> 23:30, con un gap "Cerrado" entre el fin del almuerzo y el
//   inicio de la cena.
export const HORA_INICIO = 12;
export const HORA_FIN = 23;
// Ventana entre turnos (se renderiza como zona "Cerrado")
export const GAP_INICIO = 15.5; // fin del almuerzo
export const GAP_FIN = 20.0; // inicio de la cena

// Fracción de hora (en px) por cada minuto — define el "zoom" del timeline.
export const PX_POR_HORA = 180;

export const mesasTimelineMock: TimelineTable[] = [
  { id: "m-1", numero: "1", capacidad: 2, forma: "square", zona: "Salón" },
  { id: "m-2", numero: "2", capacidad: 4, forma: "rect", zona: "Salón" },
  { id: "m-3", numero: "3", capacidad: 4, forma: "rect", zona: "Salón" },
  { id: "m-4", numero: "4", capacidad: 6, forma: "round", zona: "Terraza" },
  { id: "m-5", numero: "5", capacidad: 8, forma: "round", zona: "Terraza" },
  { id: "m-6", numero: "6", capacidad: 2, forma: "square", zona: "Salón" },
  { id: "m-7", numero: "7", capacidad: 4, forma: "rect", zona: "Salón" },
  { id: "m-8", numero: "8", capacidad: 6, forma: "round", zona: "Terraza" },
  { id: "m-9", numero: "9", capacidad: 4, forma: "rect", zona: "Barra" },
  { id: "m-10", numero: "10", capacidad: 2, forma: "square", zona: "Barra" },
];

export const reservasTimelineMock: TimelineReservation[] = [
  // --- Almuerzo ---
  { id: "tr-1", turno: "almuerzo", hora: "12:00", duracionMin: 90, partySize: 2, nombre: "Jessica Leiser", mesaId: "m-1", estado: "Confirmada", tag: "🎉", nota: "Aniversario" },
  { id: "tr-2", turno: "almuerzo", hora: "12:30", duracionMin: 90, partySize: 4, nombre: "Ronald Bryant", mesaId: "m-2", estado: "Confirmada", tag: "📞", nota: "Confirmó por teléfono" },
  { id: "tr-3", turno: "almuerzo", hora: "13:00", duracionMin: 120, partySize: 4, nombre: "Elizabeth Grosvenor", mesaId: "m-3", estado: "Pendiente" },
  { id: "tr-4", turno: "almuerzo", hora: "13:00", duracionMin: 120, partySize: 6, nombre: "Carol Kirkland", mesaId: "m-4", estado: "Confirmada", tag: "🎂", nota: "Cumpleaños · pastel" },
  { id: "tr-5", turno: "almuerzo", hora: "13:30", duracionMin: 90, partySize: 2, nombre: "Charlie Webb", mesaId: "m-1", estado: "Sentada" },
  { id: "tr-6", turno: "almuerzo", hora: "14:00", duracionMin: 90, partySize: 8, nombre: "Mariana Vázquez", mesaId: "m-5", estado: "Confirmada", tag: "👶", nota: "Sillas altas" },
  { id: "tr-7", turno: "almuerzo", hora: "14:30", duracionMin: 60, partySize: 2, nombre: "Diego Salazar", mesaId: "m-2", estado: "Pendiente" },
  { id: "tr-8", turno: "almuerzo", hora: "12:15", duracionMin: 90, partySize: 3, nombre: "Paula Méndez", mesaId: "m-6", estado: "Confirmada", nota: "Prefiere terraza" },
  { id: "tr-9", turno: "almuerzo", hora: "13:45", duracionMin: 90, partySize: 4, nombre: "Tomás Aguirre", mesaId: "m-7", estado: "Pendiente", tag: "🥗", nota: "Vegano" },
  { id: "tr-10", turno: "almuerzo", hora: "14:15", duracionMin: 60, partySize: 2, nombre: "Lucía Fernández", mesaId: "m-10", estado: "Cancelada" },
  { id: "tr-21", turno: "almuerzo", hora: "12:30", duracionMin: 90, partySize: 4, nombre: "Hugo Mendoza", mesaId: "m-8", estado: "Confirmada", nota: "Cumpleaños" },
  { id: "tr-22", turno: "almuerzo", hora: "13:15", duracionMin: 90, partySize: 2, nombre: "Valeria Cruz", mesaId: "m-9", estado: "Sentada", tag: "🥂" },
  { id: "tr-23", turno: "almuerzo", hora: "14:00", duracionMin: 60, partySize: 2, nombre: "Nicolás Bravo", mesaId: "m-6", estado: "Pendiente" },

  // --- Cena ---
  { id: "tr-11", turno: "cena", hora: "20:00", duracionMin: 120, partySize: 2, nombre: "Sofía Romero", mesaId: "m-1", estado: "Confirmada" },
  { id: "tr-12", turno: "cena", hora: "20:00", duracionMin: 120, partySize: 4, nombre: "Andrés Quintero", mesaId: "m-3", estado: "Confirmada", tag: "🥂" },
  { id: "tr-13", turno: "cena", hora: "20:30", duracionMin: 120, partySize: 6, nombre: "Tomás Aguirre", mesaId: "m-4", estado: "Pendiente", nota: "Mesa exterior" },
  { id: "tr-14", turno: "cena", hora: "21:00", duracionMin: 90, partySize: 4, nombre: "Lucía Fernández", mesaId: "m-2", estado: "Confirmada" },
  { id: "tr-15", turno: "cena", hora: "21:00", duracionMin: 150, partySize: 8, nombre: "Andrés Quintero", mesaId: "m-5", estado: "Confirmada", tag: "🎉", nota: "Cena de fin de curso" },
  { id: "tr-16", turno: "cena", hora: "21:30", duracionMin: 90, partySize: 2, nombre: "Paula Méndez", mesaId: "m-1", estado: "Pendiente" },
  { id: "tr-17", turno: "cena", hora: "22:00", duracionMin: 90, partySize: 4, nombre: "Diego Salazar", mesaId: "m-3", estado: "Confirmada", nota: "Postre de cortesía" },
  { id: "tr-18", turno: "cena", hora: "20:15", duracionMin: 90, partySize: 2, nombre: "Mariana Vázquez", mesaId: "m-7", estado: "Confirmada" },
  { id: "tr-19", turno: "cena", hora: "21:15", duracionMin: 120, partySize: 3, nombre: "Ronald Bryant", mesaId: "m-8", estado: "Pendiente" },
  { id: "tr-20", turno: "cena", hora: "22:15", duracionMin: 60, partySize: 2, nombre: "Carol Kirkland", mesaId: "m-10", estado: "Confirmada", tag: "🎂" },
  { id: "tr-24", turno: "cena", hora: "20:45", duracionMin: 90, partySize: 2, nombre: "Sara Domínguez", mesaId: "m-9", estado: "Confirmada", nota: "Mesa interior" },
  { id: "tr-25", turno: "cena", hora: "21:30", duracionMin: 90, partySize: 4, nombre: "Federico Lima", mesaId: "m-6", estado: "Pendiente" },
];
