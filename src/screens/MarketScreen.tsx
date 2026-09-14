import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View, type ListRenderItem } from 'react-native';

import { CoinRow } from '../components/CoinRow';
import { colors } from '../components/colors';
import { EmptyView } from '../components/EmptyView';
import { ErrorView } from '../components/ErrorView';
import { InlineNotice } from '../components/InlineNotice';
import { LoadingView } from '../components/LoadingView';
import { SearchField } from '../components/SearchField';
import { useFavorites } from '../context/useFavorites';
import { useCoinMarkets } from '../hooks/useCoinMarkets';
import type { CoinMarket } from '../models/Coin';
import { getErrorMessage } from '../utils/errorMessages';
import { filterCoins } from '../utils/filterCoins';

export function MarketScreen() {
  const { data, error, refreshError, isLoading, isRefreshing, reload, refresh } = useCoinMarkets();
  const { status: favoritesStatus, isFavorite } = useFavorites();
  const [query, setQuery] = useState('');

  const coins = useMemo(() => (data ? filterCoins(data, query) : []), [data, query]);
  const trimmedQuery = query.trim();

  const renderItem = useCallback<ListRenderItem<CoinMarket>>(
    ({ item }) => (
      <CoinRow
        coin={{
          id: item.id,
          name: item.name,
          symbol: item.symbol,
          imageUrl: item.imageUrl,
          price: item.currentPrice,
          priceChangePercentage24h: item.priceChangePercentage24h,
        }}
        // Sin base local disponible no se muestra el indicador (spec favorites).
        isFavorite={favoritesStatus === 'ready' ? isFavorite(item.id) : undefined}
        onPress={() => router.push({ pathname: '/coin/[id]', params: { id: item.id } })}
      />
    ),
    [favoritesStatus, isFavorite]
  );

  if (isLoading) {
    return <LoadingView message="Cargando mercado…" />;
  }

  if (data === null) {
    return (
      <ErrorView message={getErrorMessage(error)} actionLabel="Reintentar" onAction={reload} />
    );
  }

  return (
    <View style={styles.container}>
      <SearchField value={query} onChangeText={setQuery} />
      {refreshError ? <InlineNotice message={getErrorMessage(refreshError)} /> : null}
      <FlatList
        data={coins}
        keyExtractor={(coin) => coin.id}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} />}
        contentContainerStyle={coins.length === 0 ? styles.emptyContent : undefined}
        ListEmptyComponent={
          trimmedQuery ? (
            <EmptyView title={`No se encontraron monedas para «${trimmedQuery}»`} />
          ) : (
            <EmptyView title="No hay monedas para mostrar" />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  emptyContent: {
    flexGrow: 1,
  },
});
