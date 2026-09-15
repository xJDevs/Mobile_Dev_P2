import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { colors } from './colors';

interface CoinIconProps {
  uri: string | null;
  size?: number;
}

/** Ícono de la moneda. Sin URL, o si la imagen no carga, muestra un símbolo genérico. */
export function CoinIcon({ uri, size = 36 }: CoinIconProps) {
  const [failed, setFailed] = useState(false);
  const shape = { width: size, height: size, borderRadius: size / 2 };

  if (!uri || failed) {
    return (
      <View style={[shape, styles.fallback]}>
        <SymbolView
          name={{ ios: 'bitcoinsign.circle', android: 'toll' }}
          size={Math.round(size * 0.6)}
          tintColor={colors.textMuted}
        />
      </View>
    );
  }

  return <Image source={{ uri }} style={shape} onError={() => setFailed(true)} />;
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
});
