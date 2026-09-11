export interface Favorite {
  coinId: string;
  name: string;
  symbol: string;
  imageUrl: string | null;
  /** Último precio conocido en USD, usado cuando no hay conexión. */
  lastPriceUsd: number | null;
  /** Momento en que se guardó, en milisegundos desde epoch. */
  savedAt: number;
}
