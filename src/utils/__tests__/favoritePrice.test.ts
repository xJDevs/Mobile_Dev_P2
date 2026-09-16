import type { Favorite } from '../../models/Favorite';
import { resolveFavoritePrice } from '../favoritePrice';

const bitcoin: Favorite = {
  coinId: 'bitcoin',
  name: 'Bitcoin',
  symbol: 'btc',
  imageUrl: null,
  lastPriceUsd: 77220,
  savedAt: 1_000,
};

describe('resolveFavoritePrice', () => {
  it('usa el precio y la variación en vivo cuando llegaron en la respuesta', () => {
    expect(
      resolveFavoritePrice(bitcoin, {
        id: 'bitcoin',
        price: 78010.5,
        priceChangePercentage24h: 1.2,
      })
    ).toEqual({ price: 78010.5, priceChangePercentage24h: 1.2, isSaved: false });
  });

  it('conserva una variación nula del precio en vivo', () => {
    expect(
      resolveFavoritePrice(bitcoin, {
        id: 'bitcoin',
        price: 78010.5,
        priceChangePercentage24h: null,
      })
    ).toEqual({ price: 78010.5, priceChangePercentage24h: null, isSaved: false });
  });

  it('usa el último precio guardado si no hay precio en vivo (petición fallida)', () => {
    expect(resolveFavoritePrice(bitcoin, undefined)).toEqual({
      price: 77220,
      priceChangePercentage24h: null,
      isSaved: true,
    });
  });

  it('usa el último precio guardado si el precio en vivo es nulo', () => {
    expect(
      resolveFavoritePrice(bitcoin, { id: 'bitcoin', price: null, priceChangePercentage24h: 3 })
    ).toEqual({ price: 77220, priceChangePercentage24h: null, isSaved: true });
  });

  it('devuelve precio nulo si tampoco hay precio guardado', () => {
    expect(resolveFavoritePrice({ ...bitcoin, lastPriceUsd: null }, undefined)).toEqual({
      price: null,
      priceChangePercentage24h: null,
      isSaved: true,
    });
  });
});
