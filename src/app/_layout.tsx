import { Stack } from 'expo-router';

import { FavoritesProvider } from '../context/FavoritesContext';

export default function RootLayout() {
  return (
    <FavoritesProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="coin/[id]" options={{ title: 'Detalle', headerBackTitle: 'Volver' }} />
      </Stack>
    </FavoritesProvider>
  );
}
