import type { CoinDetail, CoinMarket, CoinPrice } from '../models/Coin';
import { getJson } from './client';
import { mapCoinDetail, mapCoinMarkets, mapSimplePrices } from './mappers';

export const MARKET_LIST_SIZE = 50;

export async function getMarkets(signal?: AbortSignal): Promise<CoinMarket[]> {
  const json = await getJson(
    '/coins/markets',
    {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: MARKET_LIST_SIZE,
      page: 1,
      sparkline: false,
      price_change_percentage: '24h',
    },
    signal
  );
  return mapCoinMarkets(json);
}

export async function getCoinDetail(id: string, signal?: AbortSignal): Promise<CoinDetail> {
  const json = await getJson(
    `/coins/${encodeURIComponent(id)}`,
    {
      localization: false,
      tickers: false,
      market_data: true,
      community_data: false,
      developer_data: false,
      sparkline: false,
    },
    signal
  );
  return mapCoinDetail(json);
}

/** Precios de varias monedas en una sola petición. Sin ids no hay petición. */
export async function getPrices(
  ids: readonly string[],
  signal?: AbortSignal
): Promise<CoinPrice[]> {
  if (ids.length === 0) {
    return [];
  }
  const json = await getJson(
    '/simple/price',
    { ids: ids.join(','), vs_currencies: 'usd', include_24hr_change: true },
    signal
  );
  return mapSimplePrices(json);
}
