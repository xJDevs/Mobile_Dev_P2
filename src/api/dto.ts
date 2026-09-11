// Formas del JSON de CoinGecko API v3, solo con los campos que usa la app.
// Todo es opcional o nulo: la API puede omitir campos y los mappers validan en tiempo de ejecución.

/** GET /coins/markets → arreglo de CoinMarketDto. */
export interface CoinMarketDto {
  id?: string | null;
  symbol?: string | null;
  name?: string | null;
  image?: string | null;
  current_price?: number | null;
  market_cap?: number | null;
  market_cap_rank?: number | null;
  total_volume?: number | null;
  high_24h?: number | null;
  low_24h?: number | null;
  price_change_percentage_24h?: number | null;
  last_updated?: string | null;
}

/** Valor expresado por moneda de referencia, p. ej. { usd: 77220, eur: 70000 }. */
export type CurrencyValuesDto = { usd?: number | null } | null;

/** GET /coins/{id} */
export interface CoinDetailDto {
  id?: string | null;
  symbol?: string | null;
  name?: string | null;
  image?: { thumb?: string | null; small?: string | null; large?: string | null } | null;
  market_cap_rank?: number | null;
  last_updated?: string | null;
  market_data?: {
    current_price?: CurrencyValuesDto;
    market_cap?: CurrencyValuesDto;
    total_volume?: CurrencyValuesDto;
    high_24h?: CurrencyValuesDto;
    low_24h?: CurrencyValuesDto;
    price_change_percentage_24h?: number | null;
    last_updated?: string | null;
  } | null;
}

/** GET /simple/price → { [coinId]: { usd, usd_24h_change } } */
export type SimplePriceDto = Record<
  string,
  { usd?: number | null; usd_24h_change?: number | null } | null
>;
