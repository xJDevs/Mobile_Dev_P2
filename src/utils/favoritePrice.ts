import type { CoinPrice } from '../models/Coin';
import type { Favorite } from '../models/Favorite';

export interface FavoritePrice {
  price: number | null;
  priceChangePercentage24h: number | null;
  /** true cuando se muestra el último precio guardado en lugar del precio en vivo. */
  isSaved: boolean;
}

/**
 * Precio a mostrar de un favorito (spec favorites). Con precio en vivo se usan el precio y la
 * variación de la respuesta; sin él (petición fallida, moneda ausente en la respuesta o precio
 * nulo) se usa el último precio guardado, sin variación.
 */
export function resolveFavoritePrice(
  favorite: Favorite,
  live: CoinPrice | undefined
): FavoritePrice {
  if (live !== undefined && live.price !== null) {
    return {
      price: live.price,
      priceChangePercentage24h: live.priceChangePercentage24h,
      isSaved: false,
    };
  }

  return { price: favorite.lastPriceUsd, priceChangePercentage24h: null, isSaved: true };
}
