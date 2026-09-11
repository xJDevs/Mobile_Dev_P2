import { buildUrl, COINGECKO_BASE_URL, getJson, REQUEST_TIMEOUT_MS } from '../client';
import { ApiError } from '../errors';

const mockConfig: { coingeckoApiKey: string | undefined } = { coingeckoApiKey: undefined };

// Getter: el mock se evalúa antes de inicializar mockConfig y se lee recién al usarse.
jest.mock('../../config', () => ({
  get config() {
    return mockConfig;
  },
}));

const fetchMock = jest.fn<Promise<Response>, [string, RequestInit]>();
const originalFetch = globalThis.fetch;

function fakeResponse(status: number, body: string): Response {
  return { ok: status >= 200 && status < 300, status, text: async () => body } as Response;
}

beforeEach(() => {
  fetchMock.mockReset();
  mockConfig.coingeckoApiKey = undefined;
  globalThis.fetch = fetchMock as unknown as typeof fetch;
});

afterEach(() => {
  jest.useRealTimers();
});

afterAll(() => {
  globalThis.fetch = originalFetch;
});

describe('buildUrl', () => {
  it('arma la URL con parámetros codificados y omite los undefined', () => {
    expect(
      buildUrl('/simple/price', {
        ids: 'bitcoin,ethereum',
        include_24hr_change: true,
        page: undefined,
      })
    ).toBe(`${COINGECKO_BASE_URL}/simple/price?ids=bitcoin%2Cethereum&include_24hr_change=true`);
  });

  it('no agrega "?" sin parámetros', () => {
    expect(buildUrl('/ping')).toBe(`${COINGECKO_BASE_URL}/ping`);
  });
});

describe('getJson', () => {
  it('devuelve el JSON de una respuesta exitosa', async () => {
    fetchMock.mockResolvedValue(fakeResponse(200, '[{"id":"bitcoin"}]'));

    await expect(getJson('/coins/markets', { page: 1 })).resolves.toEqual([{ id: 'bitcoin' }]);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${COINGECKO_BASE_URL}/coins/markets?page=1`);
    expect(init.headers).toEqual({ Accept: 'application/json' });
  });

  it('envía la demo key cuando está configurada', async () => {
    mockConfig.coingeckoApiKey = 'demo-key';
    fetchMock.mockResolvedValue(fakeResponse(200, '{}'));

    await getJson('/ping');

    expect(fetchMock.mock.calls[0][1].headers).toMatchObject({ 'x-cg-demo-api-key': 'demo-key' });
  });

  it('convierte un fallo de red en ApiError network', async () => {
    fetchMock.mockRejectedValue(new TypeError('Network request failed'));

    const error = await getJson('/coins/markets').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ kind: 'network' });
  });

  it('cancela la petición y lanza ApiError timeout a los 15 segundos', async () => {
    jest.useFakeTimers();
    fetchMock.mockImplementation(
      (_url, init) =>
        new Promise<Response>((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => reject(new Error('Aborted')));
        })
    );

    const result = getJson('/coins/markets').catch((e: unknown) => e);
    jest.advanceTimersByTime(REQUEST_TIMEOUT_MS - 1);
    expect(fetchMock.mock.calls[0][1].signal?.aborted).toBe(false);
    jest.advanceTimersByTime(1);

    const error = await result;
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ kind: 'timeout' });
  });

  it.each([
    [429, 'rate_limit'],
    [404, 'not_found'],
    [500, 'http'],
    [503, 'http'],
  ])('convierte HTTP %i en ApiError %s', async (status, kind) => {
    fetchMock.mockResolvedValue(fakeResponse(status, '{"error":"x"}'));

    const error = await getJson('/coins/bitcoin').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ kind, status });
  });

  it('convierte un cuerpo que no es JSON en ApiError parse', async () => {
    fetchMock.mockResolvedValue(fakeResponse(200, '<html>Mantenimiento</html>'));

    const error = await getJson('/coins/markets').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ kind: 'parse' });
  });

  it('propaga la cancelación del llamador sin convertirla en ApiError', async () => {
    fetchMock.mockImplementation((_url, init) =>
      init.signal?.aborted
        ? Promise.reject(new Error('Aborted'))
        : Promise.resolve(fakeResponse(200, '{}'))
    );
    const controller = new AbortController();
    controller.abort();

    const error = await getJson('/coins/markets', undefined, controller.signal).catch(
      (e: unknown) => e
    );

    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(ApiError);
  });
});
