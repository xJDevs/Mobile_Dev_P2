import type { CoinPrice } from '../models/Coin';
import type { Favorite } from '../models/Favorite';

export type FavoritesStatus = 'loading' | 'ready' | 'error';

export interface FavoritesState {
  status: FavoritesStatus;
  favorites: Favorite[];
  error: string | null;
}

export type FavoritesAction =
  | { type: 'LOAD_SUCCESS'; favorites: Favorite[] }
  | { type: 'LOAD_ERROR'; error: string }
  | { type: 'ADDED'; favorite: Favorite }
  | { type: 'REMOVED'; coinId: string }
  | { type: 'PRICES_UPDATED'; prices: readonly CoinPrice[] };

export const initialFavoritesState: FavoritesState = {
  status: 'loading',
  favorites: [],
  error: null,
};

/** Del más reciente al más antiguo, igual que el orden que devuelve el repositorio. */
function sortByNewest(favorites: Favorite[]): Favorite[] {
  return [...favorites].sort((a, b) => b.savedAt - a.savedAt);
}

export function favoritesReducer(state: FavoritesState, action: FavoritesAction): FavoritesState {
  switch (action.type) {
    case 'LOAD_SUCCESS':
      return { status: 'ready', favorites: sortByNewest(action.favorites), error: null };

    case 'LOAD_ERROR':
      return { status: 'error', favorites: [], error: action.error };

    case 'ADDED': {
      // Una moneda ya guardada conserva su savedAt original, como hace el upsert del repositorio.
      const existing = state.favorites.find(
        (favorite) => favorite.coinId === action.favorite.coinId
      );
      const favorite = existing
        ? { ...action.favorite, savedAt: existing.savedAt }
        : action.favorite;
      const rest = state.favorites.filter((item) => item.coinId !== favorite.coinId);

      return { ...state, favorites: sortByNewest([...rest, favorite]) };
    }

    case 'REMOVED':
      return {
        ...state,
        favorites: state.favorites.filter((favorite) => favorite.coinId !== action.coinId),
      };

    case 'PRICES_UPDATED': {
      // Los precios nulos y las monedas que no están guardadas se ignoran.
      const priceById = new Map<string, number>();
      for (const price of action.prices) {
        if (price.price !== null) {
          priceById.set(price.id, price.price);
        }
      }
      if (priceById.size === 0) {
        return state;
      }

      return {
        ...state,
        favorites: state.favorites.map((favorite) => {
          const price = priceById.get(favorite.coinId);
          return price === undefined ? favorite : { ...favorite, lastPriceUsd: price };
        }),
      };
    }

    default:
      return state;
  }
}
