import { isApiError, type ApiErrorKind } from '../api/errors';

export const GENERIC_ERROR_MESSAGE = 'Ocurrió un error al consultar el servicio';

// Textos de las specs coin-market-list y coin-detail.
const MESSAGES: Record<ApiErrorKind, string> = {
  network: 'Sin conexión a internet',
  timeout: 'Tiempo de espera agotado: el servicio no respondió',
  rate_limit:
    'Se alcanzó el límite de consultas del servicio. Hace falta esperar un momento antes de reintentar.',
  not_found: 'La moneda solicitada no existe',
  http: GENERIC_ERROR_MESSAGE,
  parse: GENERIC_ERROR_MESSAGE,
};

/** Mensaje en español para cualquier error; los que no son ApiError usan el genérico. */
export function getErrorMessage(error: unknown): string {
  return isApiError(error) ? MESSAGES[error.kind] : GENERIC_ERROR_MESSAGE;
}

/** Un recurso inexistente no se reintenta; cualquier otro fallo sí. */
export function canRetry(error: unknown): boolean {
  return !(isApiError(error) && error.kind === 'not_found');
}
