import { StyleSheet, Text, View } from 'react-native';

import { useFavorites } from '../context/useFavorites';

// Marcador de posición de la navegación (tarea 5.1). La pantalla real llega en el grupo 8.
// Lee el estado global para comprobar que el provider está conectado a la app.
export function FavoritesScreen() {
  const { status, favorites } = useFavorites();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favoritos</Text>
      <Text>
        Estado: {status} · {favorites.length} guardados
      </Text>
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
