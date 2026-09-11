// Expo solo reemplaza las variables EXPO_PUBLIC_* cuando se leen con process.env.NOMBRE de forma literal.
const coingeckoApiKey = process.env.EXPO_PUBLIC_COINGECKO_API_KEY?.trim();

export const config = {
  coingeckoApiKey: coingeckoApiKey ? coingeckoApiKey : undefined,
} as const;
