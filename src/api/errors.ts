export type ApiErrorKind = 'network' | 'timeout' | 'rate_limit' | 'not_found' | 'http' | 'parse';

/** Único tipo de error de la capa de red. Los mensajes para la UI viven en utils/errorMessages. */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | undefined;

  constructor(
    kind: ApiErrorKind,
    message: string,
    options: { status?: number; cause?: unknown } = {}
  ) {
    super(message);
    // Prototipo fijado a mano: con clases transpiladas, instanceof falla al extender Error.
    Object.setPrototypeOf(this, ApiError.prototype);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = options.status;
    this.cause = options.cause;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
