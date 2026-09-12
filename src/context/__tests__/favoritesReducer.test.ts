import type { Favorite } from '../../models/Favorite';
import { favoritesReducer, initialFavoritesState, type FavoritesState } from '../favoritesReducer';

const bitcoin: Favorite = {
  coinId: 'bitcoin',
  name: 'Bitcoin',
  symbol: 'btc',
  imageUrl: 'https://example.com/bitcoin.png',
  lastPriceUsd: 77220,
  savedAt: 1_000,
};

const ethereum: Favorite = {
  coinId: 'ethereum',
  name: 'Ethereum',
  symbol: 'eth',
  imageUrl: null,
  lastPriceUsd: 2465.87,
  savedAt: 2_000,
};

const ready: FavoritesState = {
  status: 'ready',
  favorites: [ethereum, bitcoin],
  error: null,
};

describe('favoritesReducer', () => {
  it('empieza en estado de carga y sin favoritos', () => {
    expect(initialFavoritesState).toEqual({ status: 'loading', favorites: [], error: null });
  });

  describe('LOAD_SUCCESS', () => {
    it('pasa a ready y ordena del más reciente al más antiguo', () => {
      const state = favoritesReducer(initialFavoritesState, {
        type: 'LOAD_SUCCESS',
        favorites: [bitcoin, ethereum],
      });

      expect(state.status).toBe('ready');
      expect(state.error).toBeNull();
      expect(state.favorites.map((favorite) => favorite.coinId)).toEqual(['ethereum', 'bitcoin']);
    });
  });

  describe('LOAD_ERROR', () => {
    it('pasa a error, guarda el mensaje y deja la lista vacía', () => {
      const state = favoritesReducer(initialFavoritesState, {
        type: 'LOAD_ERROR',
        error: 'base no disponible',
      });

      expect(state).toEqual({ status: 'error', favorites: [], error: 'base no disponible' });
    });
  });

  describe('ADDED', () => {
    it('agrega el favorito nuevo de primero por ser el más reciente', () => {
      const nuevo: Favorite = { ...bitcoin, coinId: 'solana', name: 'Solana', savedAt: 3_000 };
      const state = favoritesReducer(ready, { type: 'ADDED', favorite: nuevo });

      expect(state.favorites.map((favorite) => favorite.coinId)).toEqual([
        'solana',
        'ethereum',
        'bitcoin',
      ]);
    });

    it('no duplica una moneda ya guardada y conserva su savedAt original', () => {
      const state = favoritesReducer(ready, {
        type: 'ADDED',
        favorite: { ...bitcoin, name: 'Bitcoin actualizado', savedAt: 9_000 },
      });

      expect(state.favorites).toHaveLength(2);
      expect(state.favorites.map((favorite) => favorite.coinId)).toEqual(['ethereum', 'bitcoin']);
      expect(state.favorites.find((favorite) => favorite.coinId === 'bitcoin')).toMatchObject({
        name: 'Bitcoin actualizado',
        savedAt: 1_000,
      });
    });
  });

  describe('REMOVED', () => {
    it('quita la moneda indicada', () => {
      const state = favoritesReducer(ready, { type: 'REMOVED', coinId: 'ethereum' });

      expect(state.favorites.map((favorite) => favorite.coinId)).toEqual(['bitcoin']);
    });

    it('deja la lista igual si la moneda no está guardada', () => {
      const state = favoritesReducer(ready, { type: 'REMOVED', coinId: 'solana' });

      expect(state.favorites).toHaveLength(2);
    });
  });

  describe('PRICES_UPDATED', () => {
    it('actualiza el último precio de las monedas guardadas', () => {
      const state = favoritesReducer(ready, {
        type: 'PRICES_UPDATED',
        prices: [
          { id: 'bitcoin', price: 80000, priceChangePercentage24h: 2 },
          { id: 'ethereum', price: 2500, priceChangePercentage24h: 1 },
        ],
      });

      expect(state.favorites.map((favorite) => favorite.lastPriceUsd)).toEqual([2500, 80000]);
    });

    it('ignora los precios nulos y las monedas que no están guardadas', () => {
      const state = favoritesReducer(ready, {
        type: 'PRICES_UPDATED',
        prices: [
          { id: 'bitcoin', price: null, priceChangePercentage24h: null },
          { id: 'solana', price: 150, priceChangePercentage24h: 3 },
        ],
      });

      expect(state.favorites).toEqual(ready.favorites);
    });
  });

  it('no modifica el estado ni la lista que recibe', () => {
    const favorites = [ethereum, bitcoin];
    const state: FavoritesState = { status: 'ready', favorites, error: null };

    favoritesReducer(state, { type: 'REMOVED', coinId: 'bitcoin' });
    favoritesReducer(state, { type: 'ADDED', favorite: { ...bitcoin, savedAt: 5_000 } });

    expect(favorites.map((favorite) => favorite.coinId)).toEqual(['ethereum', 'bitcoin']);
    expect(state.favorites).toHaveLength(2);
  });
});
