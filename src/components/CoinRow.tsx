import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { formatPercent, formatUsd } from '../utils/format';
import { colors } from './colors';

/** Datos que muestra una fila; Mercado y Favoritos adaptan sus modelos a esta forma. */
export interface CoinRowData {
  id: string;
  name: string;
  symbol: string;
  imageUrl: string | null;
  price: number | null;
  priceChangePercentage24h: number | null;
}

interface CoinRowProps {
  coin: CoinRowData;
  /** Sin valor no se muestra indicador; con true se muestra la estrella activa. */
  isFavorite?: boolean;
  onPress?: () => void;
}

function CoinIcon({ uri }: { uri: string | null }) {
  const [failed, setFailed] = useState(false);

  if (!uri || failed) {
    return (
      <View style={[styles.icon, styles.iconFallback]}>
        <SymbolView
          name={{ ios: 'bitcoinsign.circle', android: 'toll' }}
          size={22}
          tintColor={colors.textMuted}
        />
      </View>
    );
  }

  return <Image source={{ uri }} style={styles.icon} onError={() => setFailed(true)} />;
}

function changeColor(change: number | null): string {
  if (change === null) {
    return colors.textMuted;
  }
  return change >= 0 ? colors.positive : colors.negative;
}

export function CoinRow({ coin, isFavorite, onPress }: CoinRowProps) {
  const symbol = coin.symbol.toUpperCase();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${coin.name}, ${symbol}, ${formatUsd(coin.price)}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      <CoinIcon uri={coin.imageUrl} />

      <View style={styles.identity}>
        <Text style={styles.name} numberOfLines={1}>
          {coin.name}
        </Text>
        <Text style={styles.symbol}>{symbol}</Text>
      </View>

      <View style={styles.values}>
        <Text style={styles.price}>{formatUsd(coin.price)}</Text>
        <Text style={[styles.change, { color: changeColor(coin.priceChangePercentage24h) }]}>
          {formatPercent(coin.priceChangePercentage24h)}
        </Text>
      </View>

      {isFavorite ? (
        <SymbolView
          name={{ ios: 'star.fill', android: 'star' }}
          size={18}
          tintColor={colors.favorite}
          accessibilityLabel="En favoritos"
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowPressed: {
    backgroundColor: colors.surface,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  iconFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  identity: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  symbol: {
    color: colors.textMuted,
    fontSize: 13,
  },
  values: {
    alignItems: 'flex-end',
    gap: 2,
  },
  price: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  change: {
    fontSize: 13,
    fontWeight: '500',
  },
});
