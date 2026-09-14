import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors } from './colors';

export function LoadingView({ message }: { message?: string }) {
  return (
    <View style={styles.container} accessibilityRole="progressbar">
      <ActivityIndicator size="large" color={colors.primary} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  message: {
    color: colors.textMuted,
    textAlign: 'center',
  },
});
