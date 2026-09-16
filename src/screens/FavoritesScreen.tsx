import { router } from 'expo-router';
import { useCallback, useMemo } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
  type ListRenderItem,
} from 'react-native';

import { CoinRow } from '../components/CoinRow';
import { colors } from '../components/colors';
import { EmptyView } from '../components/EmptyView';
import { ErrorView } from '../components/ErrorView';
import { InlineNotice } from '../components/InlineNotice';
import { LoadingView } from '../components/LoadingView';
import { RemoveButton } from '../components/RemoveButton';
import { useFavorites } from '../context/useFavorites';
import { useFavoritePrices } from '../hooks/useFavoritePrices';
import type { Favorite } from '../models/Favorite';
import { getErrorMessage } from '../utils/errorMessages';
import { resolveFavoritePrice } from '../utils/favoritePrice';

const SAVED_PRICE_NOTE = 'Último precio guardado';

export function FavoritesScreen() {
  const { status, favorites, removeFavorite } = useFavorites();
  const ids = useMemo(() => favorites.map((favorite) => favorite.coinId), [favorites]);
  const { data: prices, error, refreshError, isRefreshing, refresh } = useFavoritePrices(ids);

  // Si la última petición de precios falló, todas las filas usan el último precio guardado.
  const priceError = refreshError ?? error;
  const livePrices = useMemo(
    () => new Map((prices ?? []).map((price) => [price.id, price])),
    [prices]
  );

  // Desde Favoritos se elimina con confirmación; el contexto borra primero en SQLite.
  const confirmRemove = useCallback(
    (favorite: Favorite) => {
      const remove = async () => {
        try {
          await removeFavorite(favorite.coinId);
        } catch {
          Alert.alert('No se pudo eliminar el favorito');
        }
      };

      Alert.alert('Eliminar favorito', `¿Eliminar ${favorite.name} de favoritos?`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => void remove() },
      ]);
    },
    [removeFavorite]
  );

  const renderItem = useCallback<ListRenderItem<Favorite>>(
    ({ item }) => {
      const { price, priceChangePercentage24h, isSaved } = resolveFavoritePrice(
        item,
        priceError ? undefined : livePrices.get(item.coinId)
      );

      return (
        <CoinRow
          coin={{
            id: item.coinId,
            name: item.name,
            symbol: item.symbol,
            imageUrl: item.imageUrl,
            price,
            priceChangePercentage24h,
          }}
          priceNote={isSaved ? SAVED_PRICE_NOTE : undefined}
          accessory={
            <RemoveButton
              accessibilityLabel={`Eliminar ${item.name} de favoritos`}
              onPress={() => confirmRemove(item)}
            />
          }
          onPress={() => router.push({ pathname: '/coin/[id]', params: { id: item.coinId } })}
        />
      );
    },
    [priceError, livePrices, confirmRemove]
  );

  if (status === 'loading') {
    return <LoadingView message="Cargando favoritos…" />;
  }

  if (status === 'error') {
    return (
      <ErrorView message="Los favoritos no están disponibles: no se pudo abrir la base de datos del dispositivo" />
    );
  }

  if (favorites.length === 0) {
    return (
      <EmptyView
        title="Todavía no hay favoritos"
        message="Los favoritos se agregan desde el Detalle de una moneda, con la estrella junto al nombre."
      />
    );
  }

  return (
    <View style={styles.container}>
      {priceError ? (
        <InlineNotice
          message={`Los precios pueden estar desactualizados.\n${getErrorMessage(priceError)}`}
        />
      ) : null}
      <FlatList
        data={favorites}
        keyExtractor={(favorite) => favorite.coinId}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
