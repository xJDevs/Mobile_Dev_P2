import { ApiError } from '../errors';
import { mapCoinDetail, mapCoinMarkets, mapSimplePrices } from '../mappers';

function captureError(fn: () => unknown): unknown {
  try {
    fn();
  } catch (error) {
    return error;
  }
  throw new Error('La función no lanzó ningún error');
}

function expectParseError(fn: () => unknown) {
  const error = captureError(fn);
  expect(error).toBeInstanceOf(ApiError);
  expect(error).toMatchObject({ kind: 'parse' });
}

const bitcoinMarket = {
  id: 'bitcoin',
  symbol: 'btc',
  name: 'Bitcoin',
  image: 'https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png',
  current_price: 77220,
  market_cap: 1550770566304,
  market_cap_rank: 1,
  total_volume: 29817938065,
  price_change_percentage_24h: -1.43973,
  last_updated: '2026-09-11T06:47:20.000Z',
};

const bitcoinDetail = {
  id: 'bitcoin',
  symbol: 'btc',
  name: 'Bitcoin',
  image: {
    thumb: 'https://coin-images.coingecko.com/coins/images/1/thumb/bitcoin.png',
    small: 'https://coin-images.coingecko.com/coins/images/1/small/bitcoin.png',
    large: 'https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png',
  },
  market_cap_rank: 1,
  last_updated: '2026-09-11T06:46:50.000Z',
  market_data: {
    current_price: { usd: 77220, eur: 70000 },
    market_cap: { usd: 1550751774308 },
    total_volume: { usd: 29838710286 },
    high_24h: { usd: 78405 },
    low_24h: { usd: 76546 },
    price_change_percentage_24h: -1.41826,
  },
};

describe('mapCoinMarkets', () => {
  it('convierte una respuesta válida a CoinMarket', () => {
    expect(mapCoinMarkets([bitcoinMarket])).toEqual([
      {
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        imageUrl: 'https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png',
        currentPrice: 77220,
        priceChangePercentage24h: -1.43973,
        marketCap: 1550770566304,
        marketCapRank: 1,
      },
    ]);
  });

  it('usa null para campos nulos, ausentes o con tipo inesperado', () => {
    const [coin] = mapCoinMarkets([
      {
        ...bitcoinMarket,
        image: null,
        current_price: null,
        price_change_percentage_24h: undefined,
        market_cap: 'n/a',
      },
    ]);

    expect(coin).toMatchObject({
      id: 'bitcoin',
      imageUrl: null,
      currentPrice: null,
      priceChangePercentage24h: null,
      marketCap: null,
    });
  });

  it('descarta elementos sin id, nombre o símbolo y conserva el resto en orden', () => {
    const coins = mapCoinMarkets([
      { ...bitcoinMarket, id: undefined },
      { ...bitcoinMarket, id: 'ethereum', name: '' },
      null,
      'texto',
      { ...bitcoinMarket, id: 'tether', symbol: 'usdt', name: 'Tether' },
      { ...bitcoinMarket, id: 'solana', symbol: null },
      { ...bitcoinMarket, id: 'bnb', symbol: 'bnb', name: 'BNB' },
    ]);

    expect(coins.map((coin) => coin.id)).toEqual(['tether', 'bnb']);
  });

  it('devuelve un arreglo vacío si la respuesta es un arreglo vacío', () => {
    expect(mapCoinMarkets([])).toEqual([]);
  });

  it('lanza ApiError parse si la raíz no es un arreglo', () => {
    expectParseError(() => mapCoinMarkets({ error: 'coin not found' }));
    expectParseError(() => mapCoinMarkets(null));
    expectParseError(() => mapCoinMarkets('texto'));
  });
});

describe('mapCoinDetail', () => {
  it('convierte una respuesta válida a CoinDetail', () => {
    expect(mapCoinDetail(bitcoinDetail)).toEqual({
      id: 'bitcoin',
      symbol: 'btc',
      name: 'Bitcoin',
      imageUrl: 'https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png',
      currentPrice: 77220,
      priceChangePercentage24h: -1.41826,
      marketCap: 1550751774308,
      marketCapRank: 1,
      totalVolume: 29838710286,
      high24h: 78405,
      low24h: 76546,
      lastUpdated: '2026-09-11T06:46:50.000Z',
    });
  });

  it('usa null en los campos numéricos cuando falta market_data', () => {
    expect(mapCoinDetail({ ...bitcoinDetail, market_data: null })).toMatchObject({
      id: 'bitcoin',
      currentPrice: null,
      priceChangePercentage24h: null,
      marketCap: null,
      totalVolume: null,
      high24h: null,
      low24h: null,
    });
  });

  it('usa null solo en el campo ausente', () => {
    const detail = mapCoinDetail({
      ...bitcoinDetail,
      market_data: { ...bitcoinDetail.market_data, high_24h: {} },
    });

    expect(detail.high24h).toBeNull();
    expect(detail.low24h).toBe(76546);
  });

  it('usa la imagen small o thumb si falta large', () => {
    const detail = mapCoinDetail({
      ...bitcoinDetail,
      image: { thumb: 'https://example.com/thumb.png', small: null },
    });

    expect(detail.imageUrl).toBe('https://example.com/thumb.png');
  });

  it('lanza ApiError parse si la raíz no es un objeto o faltan id, nombre o símbolo', () => {
    expectParseError(() => mapCoinDetail([bitcoinDetail]));
    expectParseError(() => mapCoinDetail(null));
    expectParseError(() => mapCoinDetail({ ...bitcoinDetail, name: undefined }));
  });
});

describe('mapSimplePrices', () => {
  it('convierte una respuesta válida a CoinPrice', () => {
    expect(
      mapSimplePrices({
        bitcoin: { usd: 77220, usd_24h_change: -1.4397 },
        ethereum: { usd: 2465.87, usd_24h_change: -0.5046 },
      })
    ).toEqual([
      { id: 'bitcoin', price: 77220, priceChangePercentage24h: -1.4397 },
      { id: 'ethereum', price: 2465.87, priceChangePercentage24h: -0.5046 },
    ]);
  });

  it('usa null para valores ausentes y omite entradas inválidas', () => {
    expect(mapSimplePrices({ bitcoin: { usd: 77220 }, ethereum: null })).toEqual([
      { id: 'bitcoin', price: 77220, priceChangePercentage24h: null },
    ]);
  });

  it('lanza ApiError parse si la raíz no es un objeto', () => {
    expectParseError(() => mapSimplePrices([]));
    expectParseError(() => mapSimplePrices(null));
  });
});
