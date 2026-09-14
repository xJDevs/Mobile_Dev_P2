import { StyleSheet, Text, View } from 'react-native';

import { colors } from './colors';

interface EmptyViewProps {
  title: string;
  message?: string;
}

export function EmptyView({ title, message }: EmptyViewProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 24,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  message: {
    color: colors.textMuted,
    textAlign: 'center',
  },
});
