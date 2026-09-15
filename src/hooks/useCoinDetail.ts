import { useCallback } from 'react';

import { getCoinDetail } from '../api/coingecko';
import type { CoinDetail } from '../models/Coin';
import { useRemoteResource, type RemoteResource } from './useRemoteResource';

/** Detalle de una moneda: carga al montar y cuando cambia el id; se refresca a pedido. */
export function useCoinDetail(id: string): RemoteResource<CoinDetail> {
  const load = useCallback((signal: AbortSignal) => getCoinDetail(id, signal), [id]);

  return useRemoteResource(load);
}
