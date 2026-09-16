import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';

import { getPrices } from '../api/coingecko';
import { useFavorites } from '../context/useFavorites';
import type { CoinPrice } from '../models/Coin';
import { useRemoteResource, type RemoteResource } from './useRemoteResource';

/**
 * Precios en vivo de los favoritos (design D7): una sola petición a /simple/price al enfocar la
 * pantalla y en cada refresco, y ninguna si no hay ids. Con respuesta exitosa se guarda el último
 * precio de cada favorito en la base local.
 */
export function useFavoritePrices(ids: readonly string[]): RemoteResource<CoinPrice[]> {
  const { updateLastPrices } = useFavorites();

  // Los ids se leen al momento de pedir: agregar o eliminar favoritos no dispara otra petición.
  const idsRef = useRef(ids);
  useEffect(() => {
    idsRef.current = ids;
  }, [ids]);

  const load = useCallback(
    async (signal: AbortSignal) => {
      const prices = await getPrices(idsRef.current, signal);
      // Si falla la escritura del último precio, los precios en vivo se muestran igual.
      await updateLastPrices(prices).catch(() => undefined);
      return prices;
    },
    [updateLastPrices]
  );

  const resource = useRemoteResource(load, { loadOnMount: false });
  const { refresh } = resource;
  const hasIds = ids.length > 0;

  // Corre al enfocar la pantalla y, ya enfocada, cuando la lista deja de estar vacía
  // (la base local puede terminar de cargar con la pantalla abierta).
  useFocusEffect(
    useCallback(() => {
      if (hasIds) {
        refresh();
      }
    }, [hasIds, refresh])
  );

  return resource;
}
