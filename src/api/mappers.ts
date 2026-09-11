import type { CoinDetail, CoinMarket, CoinPrice } from '../models/Coin';
import type { CoinDetailDto, CoinMarketDto, SimplePriceDto } from './dto';
import { ApiError } from './errors';

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function toText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value : null;
}

function toUsd(value: unknown): number | null {
  return isRecord(value) ? toNumber(value.usd) : null;
}

function mapCoinMarket(item: unknown): CoinMarket | null {
  if (!isRecord(item)) {
    return null;
  }
  const dto = item as CoinMarketDto;
  const id = toText(dto.id);
  const symbol = toText(dto.symbol);
  const name = toText(dto.name);
  if (!id || !symbol || !name) {
    return null;
  }

  return {
    id,
    symbol,
    name,
    imageUrl: toText(dto.image),
    currentPrice: toNumber(dto.current_price),
    priceChangePercentage24h: toNumber(dto.price_change_percentage_24h),
    marketCap: toNumber(dto.market_cap),
    marketCapRank: toNumber(dto.market_cap_rank),
  };
}

/** /coins/markets: descarta elementos sin id, nombre o símbolo y conserva el orden del servicio. */
export function mapCoinMarkets(json: unknown): CoinMarket[] {
  if (!Array.isArray(json)) {
    throw new ApiError('parse', 'Se esperaba un arreglo en /coins/markets');
  }
  return json.flatMap((item) => {
    const coin = mapCoinMarket(item);
    return coin ? [coin] : [];
  });
}

/** /coins/{id}: sin id, nombre o símbolo la respuesta completa es inválida. */
export function mapCoinDetail(json: unknown): CoinDetail {
  if (!isRecord(json)) {
    throw new ApiError('parse', 'Se esperaba un objeto en /coins/{id}');
  }
  const dto = json as CoinDetailDto;
  const id = toText(dto.id);
  const symbol = toText(dto.symbol);
  const name = toText(dto.name);
  if (!id || !symbol || !name) {
    throw new ApiError('parse', 'Detalle de moneda sin id, nombre o símbolo');
  }

  const image = isRecord(dto.image) ? dto.image : null;
  const marketData = isRecord(dto.market_data) ? dto.market_data : null;

  return {
    id,
    symbol,
    name,
    imageUrl: toText(image?.large) ?? toText(image?.small) ?? toText(image?.thumb),
    currentPrice: toUsd(marketData?.current_price),
    priceChangePercentage24h: toNumber(marketData?.price_change_percentage_24h),
    marketCap: toUsd(marketData?.market_cap),
    marketCapRank: toNumber(dto.market_cap_rank),
    totalVolume: toUsd(marketData?.total_volume),
    high24h: toUsd(marketData?.high_24h),
    low24h: toUsd(marketData?.low_24h),
    lastUpdated: toText(dto.last_updated) ?? toText(marketData?.last_updated),
  };
}

/** /simple/price: una entrada por moneda presente en la respuesta. */
export function mapSimplePrices(json: unknown): CoinPrice[] {
  if (!isRecord(json)) {
    throw new ApiError('parse', 'Se esperaba un objeto en /simple/price');
  }
  const dto = json as SimplePriceDto;

  return Object.entries(dto).flatMap(([id, value]) =>
    isRecord(value)
      ? [
          {
            id,
            price: toNumber(value.usd),
            priceChangePercentage24h: toNumber(value.usd_24h_change),
          },
        ]
      : []
  );
}
