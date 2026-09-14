import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from './colors';

interface ErrorViewProps {
  message: string;
  /** Texto del botón, p. ej. "Reintentar" o "Volver". Sin actionLabel u onAction no hay botón. */
  actionLabel?: string;
  onAction?: () => void;
}

export function ErrorView({ message, actionLabel, onAction }: ErrorViewProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.message} accessibilityRole="alert">
        {message}
      </Text>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  message: {
    color: colors.text,
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: colors.onPrimary,
    fontWeight: '600',
  },
});
