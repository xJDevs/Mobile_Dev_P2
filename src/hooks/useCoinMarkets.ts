import { getMarkets } from '../api/coingecko';
import type { CoinMarket } from '../models/Coin';
import { useRemoteResource, type RemoteResource } from './useRemoteResource';

/** Listado de mercado: carga al montar y solo se refresca a pedido (sin polling). */
export function useCoinMarkets(): RemoteResource<CoinMarket[]> {
  return useRemoteResource(getMarkets);
}
