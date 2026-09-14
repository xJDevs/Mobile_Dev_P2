import { ApiError } from '../../api/errors';
import { canRetry, GENERIC_ERROR_MESSAGE, getErrorMessage } from '../errorMessages';

describe('getErrorMessage', () => {
  it.each([
    ['network', 'Sin conexión a internet'],
    ['timeout', 'Tiempo de espera agotado: el servicio no respondió'],
    [
      'rate_limit',
      'Se alcanzó el límite de consultas del servicio. Hace falta esperar un momento antes de reintentar.',
    ],
    ['not_found', 'La moneda solicitada no existe'],
    ['http', GENERIC_ERROR_MESSAGE],
    ['parse', GENERIC_ERROR_MESSAGE],
  ] as const)('traduce ApiError %s', (kind, message) => {
    expect(getErrorMessage(new ApiError(kind, 'detalle técnico'))).toBe(message);
  });

  it('usa el mensaje genérico para errores que no son ApiError', () => {
    expect(getErrorMessage(new Error('otro'))).toBe(GENERIC_ERROR_MESSAGE);
    expect(getErrorMessage('texto')).toBe(GENERIC_ERROR_MESSAGE);
  });
});

describe('canRetry', () => {
  it('no permite reintentar una moneda inexistente', () => {
    expect(canRetry(new ApiError('not_found', 'x', { status: 404 }))).toBe(false);
  });

  it('permite reintentar el resto de fallos', () => {
    expect(canRetry(new ApiError('network', 'x'))).toBe(true);
    expect(canRetry(new ApiError('rate_limit', 'x', { status: 429 }))).toBe(true);
    expect(canRetry(new Error('otro'))).toBe(true);
  });
});
