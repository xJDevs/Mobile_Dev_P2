import { StyleSheet, Text, View } from 'react-native';

import { colors } from './colors';

/** Aviso no bloqueante: se muestra sobre el contenido sin reemplazarlo. */
export function InlineNotice({ message }: { message: string }) {
  return (
    <View style={styles.container} accessibilityRole="alert">
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.noticeBackground,
  },
  message: {
    color: colors.noticeText,
    fontSize: 13,
  },
});
