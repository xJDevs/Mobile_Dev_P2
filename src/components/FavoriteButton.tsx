import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet } from 'react-native';

import { colors } from './colors';

interface FavoriteButtonProps {
  isFavorite: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export function FavoriteButton({ isFavorite, onPress, disabled = false }: FavoriteButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      accessibilityState={{ selected: isFavorite, disabled }}
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}>
      <SymbolView
        name={
          isFavorite
            ? { ios: 'star.fill', android: 'star' }
            : { ios: 'star', android: 'star_border' }
        }
        size={24}
        tintColor={isFavorite ? colors.favorite : colors.textMuted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 6,
  },
  pressed: {
    opacity: 0.6,
  },
  disabled: {
    opacity: 0.4,
  },
});
