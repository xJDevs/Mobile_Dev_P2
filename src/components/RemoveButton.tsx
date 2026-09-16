import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet } from 'react-native';

import { colors } from './colors';

interface RemoveButtonProps {
  /** Descripción para lectores de pantalla, p. ej. "Eliminar Bitcoin de favoritos". */
  accessibilityLabel: string;
  onPress: () => void;
}

export function RemoveButton({ accessibilityLabel, onPress }: RemoveButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <SymbolView
        name={{ ios: 'trash', android: 'delete' }}
        size={20}
        tintColor={colors.negative}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingLeft: 4,
    paddingRight: 16,
  },
  pressed: {
    opacity: 0.6,
  },
});
