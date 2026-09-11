import { config } from '../config';
import { ApiError } from './errors';

export const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
export const REQUEST_TIMEOUT_MS = 15_000;

export type QueryParams = Record<string, string | number | boolean | undefined>;

// Query armada a mano: URLSearchParams en React Native no implementa toda la API.
export function buildUrl(path: string, params: QueryParams = {}): string {
  const query = Object.entries(params)
    .filter((entry): entry is [string, string | number | boolean] => entry[1] !== undefined)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');

  return query ? `${COINGECKO_BASE_URL}${path}?${query}` : `${COINGECKO_BASE_URL}${path}`;
}

/**
 * GET a CoinGecko. Devuelve el JSON sin validar (`unknown`); la validación es de los mappers.
 * Todo fallo sale como ApiError, salvo la cancelación desde `signal`: esa se propaga con el
 * error de aborto original para que quien llama la ignore.
 */
export async function getJson(
  path: string,
  params?: QueryParams,
  signal?: AbortSignal
): Promise<unknown> {
  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);
  const abortFromCaller = () => controller.abort();

  if (signal?.aborted) {
    controller.abort();
  } else {
    signal?.addEventListener('abort', abortFromCaller);
  }

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (config.coingeckoApiKey) {
    headers['x-cg-demo-api-key'] = config.coingeckoApiKey;
  }

  const toRequestError = (error: unknown): unknown => {
    if (timedOut) {
      return new ApiError('timeout', 'La petición superó el tiempo de espera', { cause: error });
    }
    if (signal?.aborted) {
      return error;
    }
    return new ApiError('network', 'Sin conexión con el servicio', { cause: error });
  };

  try {
    let response: Response;
    try {
      response = await fetch(buildUrl(path, params), { headers, signal: controller.signal });
    } catch (error) {
      throw toRequestError(error);
    }

    if (response.status === 429) {
      throw new ApiError('rate_limit', 'Límite de peticiones excedido', { status: 429 });
    }
    if (response.status === 404) {
      throw new ApiError('not_found', 'Recurso no encontrado', { status: 404 });
    }
    if (!response.ok) {
      throw new ApiError('http', `Respuesta HTTP ${response.status}`, { status: response.status });
    }

    let body: string;
    try {
      body = await response.text();
    } catch (error) {
      throw toRequestError(error);
    }

    try {
      return JSON.parse(body) as unknown;
    } catch (error) {
      throw new ApiError('parse', 'La respuesta no es JSON válido', { cause: error });
    }
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', abortFromCaller);
  }
}
