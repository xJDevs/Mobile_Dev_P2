import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CoinIcon } from '../components/CoinIcon';
import { colorForChange, colors } from '../components/colors';
import { ErrorView } from '../components/ErrorView';
import { FavoriteButton } from '../components/FavoriteButton';
import { InlineNotice } from '../components/InlineNotice';
import { LoadingView } from '../components/LoadingView';
import { StatRow } from '../components/StatRow';
import { useFavorites } from '../context/useFavorites';
import { useCoinDetail } from '../hooks/useCoinDetail';
import type { CoinDetail } from '../models/Coin';
import { canRetry, getErrorMessage } from '../utils/errorMessages';
import {
  EMPTY_VALUE,
  formatCompactUsd,
  formatDateTime,
  formatPercent,
  formatUsd,
} from '../utils/format';

function goBack() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/');
  }
}

export function CoinDetailScreen({ id }: { id: string }) {
  const { data, error, refreshError, isLoading, isRefreshing, reload, refresh } = useCoinDetail(id);

  if (isLoading) {
    return <LoadingView message="Cargando moneda…" />;
  }

  if (data === null) {
    // Una moneda inexistente no se reintenta: se ofrece volver (spec coin-detail).
    const retryable = canRetry(error);
    return (
      <ErrorView
        message={getErrorMessage(error)}
        actionLabel={retryable ? 'Reintentar' : 'Volver'}
        onAction={retryable ? reload : goBack}
      />
    );
  }

  return (
    <CoinDetailContent
      coin={data}
      isRefreshing={isRefreshing}
      refreshError={refreshError}
      onRefresh={refresh}
    />
  );
}

interface CoinDetailContentProps {
  coin: CoinDetail;
  isRefreshing: boolean;
  refreshError: unknown;
  onRefresh: () => void;
}

function CoinDetailContent({
  coin,
  isRefreshing,
  refreshError,
  onRefresh,
}: CoinDetailContentProps) {
  const { status: favoritesStatus, isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [isSaving, setIsSaving] = useState(false);
  const favorite = isFavorite(coin.id);

  // El contexto escribe primero en SQLite; si falla, el estado no cambia y se avisa.
  const toggleFavorite = async () => {
    setIsSaving(true);
    try {
      if (favorite) {
        await removeFavorite(coin.id);
      } else {
        await addFavorite(coin);
      }
    } catch {
      Alert.alert(favorite ? 'No se pudo eliminar el favorito' : 'No se pudo guardar el favorito');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: coin.name }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}>
        {refreshError ? <InlineNotice message={getErrorMessage(refreshError)} /> : null}

        <View style={styles.header}>
          <CoinIcon uri={coin.imageUrl} size={56} />
          <View style={styles.identity}>
            <Text style={styles.name}>{coin.name}</Text>
            <Text style={styles.symbol}>{coin.symbol.toUpperCase()}</Text>
          </View>
          {/* Sin base local disponible no se muestra el control (spec favorites). */}
          {favoritesStatus === 'ready' ? (
            <FavoriteButton
              isFavorite={favorite}
              disabled={isSaving}
              onPress={() => void toggleFavorite()}
            />
          ) : null}
        </View>

        <View style={styles.priceBlock}>
          <Text style={styles.price}>{formatUsd(coin.currentPrice)}</Text>
          <Text style={[styles.change, { color: colorForChange(coin.priceChangePercentage24h) }]}>
            {formatPercent(coin.priceChangePercentage24h)} en 24 h
          </Text>
        </View>

        <View style={styles.stats}>
          <StatRow
            label="Ranking"
            value={coin.marketCapRank === null ? EMPTY_VALUE : `#${coin.marketCapRank}`}
          />
          <StatRow label="Capitalización de mercado" value={formatCompactUsd(coin.marketCap)} />
          <StatRow label="Volumen 24 h" value={formatCompactUsd(coin.totalVolume)} />
          <StatRow label="Máximo 24 h" value={formatUsd(coin.high24h)} />
          <StatRow label="Mínimo 24 h" value={formatUsd(coin.low24h)} />
          <StatRow label="Última actualización" value={formatDateTime(coin.lastUpdated)} />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingVertical: 16,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  identity: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  symbol: {
    color: colors.textMuted,
    fontSize: 15,
  },
  priceBlock: {
    paddingHorizontal: 16,
    gap: 4,
  },
  price: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '700',
  },
  change: {
    fontSize: 16,
    fontWeight: '600',
  },
  stats: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
});
