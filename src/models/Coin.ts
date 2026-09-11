// Modelos de dominio de monedas. Valores monetarios en USD; null cuando el servicio no los reporta.

export interface CoinMarket {
  id: string;
  symbol: string;
  name: string;
  imageUrl: string | null;
  currentPrice: number | null;
  priceChangePercentage24h: number | null;
  marketCap: number | null;
  marketCapRank: number | null;
}

export interface CoinDetail extends CoinMarket {
  totalVolume: number | null;
  high24h: number | null;
  low24h: number | null;
  /** Fecha ISO 8601 de la última actualización reportada por el servicio. */
  lastUpdated: string | null;
}

export interface CoinPrice {
  id: string;
  price: number | null;
  priceChangePercentage24h: number | null;
}
