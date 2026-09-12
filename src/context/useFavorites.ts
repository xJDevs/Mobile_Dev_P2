import { useContext } from 'react';

import { FavoritesContext, type FavoritesContextValue } from './FavoritesContext';

/** Acceso al estado global de favoritos. Solo funciona dentro de <FavoritesProvider>. */
export function useFavorites(): FavoritesContextValue {
  const value = useContext(FavoritesContext);

  if (value === null) {
    throw new Error('useFavorites necesita estar dentro de <FavoritesProvider>');
  }

  return value;
}
