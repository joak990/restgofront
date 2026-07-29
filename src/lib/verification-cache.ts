/**
 * Cache en memoria del estado de verificación del dueño.
 * Se limpia al hacer logout o login para forzar re-verificación.
 */
let cached: 'verificado' | 'pendiente' | null = null;

export const verificationCache = {
  get: () => cached,
  set: (value: 'verificado' | 'pendiente') => {
    cached = value;
  },
  clear: () => {
    cached = null;
  },
};
