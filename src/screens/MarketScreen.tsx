import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

// Marcador de posición de la navegación (tarea 5.1). La pantalla real llega en el grupo 6.
export function MarketScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mercado</Text>
      <Pressable
        accessibilityRole="button"
        style={styles.button}
        onPress={() => router.push({ pathname: '/coin/[id]', params: { id: 'bitcoin' } })}>
        <Text style={styles.buttonText}>Abrir detalle de bitcoin</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#208AEF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
