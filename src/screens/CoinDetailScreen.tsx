import { StyleSheet, Text, View } from 'react-native';

// Marcador de posición de la navegación (tarea 5.1). La pantalla real llega en el grupo 7.
export function CoinDetailScreen({ id }: { id: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalle</Text>
      <Text>Moneda: {id}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
});
