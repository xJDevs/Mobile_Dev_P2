import { createContext, useCallback, useEffect, useMemo, useReducer, type ReactNode } from 'react';

import { getDatabase } from '../db/database';
import * as favoritesRepository from '../db/favoritesRepository';
import type { CoinPrice } from '../models/Coin';
import type { Favorite } from '../models/Favorite';
import { favoritesReducer, initialFavoritesState, type FavoritesStatus } from './favoritesReducer';

/** Datos mínimos para guardar una moneda; los cumplen tanto CoinMarket como CoinDetail. */
export interface FavoriteInput {
  id: string;
  name: string;
  symbol: string;
  imageUrl: string | null;
  currentPrice: number | null;
}

export interface FavoritesContextValue {
  status: FavoritesStatus;
  favorites: Favorite[];
  error: string | null;
  isFavorite: (coinId: string) => boolean;
  addFavorite: (coin: FavoriteInput) => Promise<void>;
  removeFavorite: (coinId: string) => Promise<void>;
  updateLastPrices: (prices: readonly CoinPrice[]) => Promise<void>;
}

export const FavoritesContext = createContext<FavoritesContextValue | null>(null);

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Estado único de favoritos, cargado de la base local al iniciar la app.
 * Cada operación escribe primero en SQLite y solo despacha si la escritura tuvo éxito;
 * si falla, la promesa se rechaza y el estado queda como estaba.
 */
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(favoritesReducer, initialFavoritesState);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const db = await getDatabase();
        const favorites = await favoritesRepository.getAll(db);
        if (!cancelled) {
          dispatch({ type: 'LOAD_SUCCESS', favorites });
        }
      } catch (error) {
        if (!cancelled) {
          dispatch({ type: 'LOAD_ERROR', error: toMessage(error) });
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const addFavorite = useCallback(async (coin: FavoriteInput) => {
    const favorite: Favorite = {
      coinId: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      imageUrl: coin.imageUrl,
      lastPriceUsd: coin.currentPrice,
      savedAt: Date.now(),
    };

    const db = await getDatabase();
    await favoritesRepository.add(db, favorite);
    dispatch({ type: 'ADDED', favorite });
  }, []);

  const removeFavorite = useCallback(async (coinId: string) => {
    const db = await getDatabase();
    await favoritesRepository.remove(db, coinId);
    dispatch({ type: 'REMOVED', coinId });
  }, []);

  const updateLastPrices = useCallback(async (prices: readonly CoinPrice[]) => {
    const db = await getDatabase();
    await favoritesRepository.updatePrices(db, prices);
    dispatch({ type: 'PRICES_UPDATED', prices });
  }, []);

  const favoriteIds = useMemo(
    () => new Set(state.favorites.map((favorite) => favorite.coinId)),
    [state.favorites]
  );
  const isFavorite = useCallback((coinId: string) => favoriteIds.has(coinId), [favoriteIds]);

  const value = useMemo<FavoritesContextValue>(
    () => ({
      status: state.status,
      favorites: state.favorites,
      error: state.error,
      isFavorite,
      addFavorite,
      removeFavorite,
      updateLastPrices,
    }),
    [state, isFavorite, addFavorite, removeFavorite, updateLastPrices]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}
