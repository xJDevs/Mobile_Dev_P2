/**
 * Filtro local por nombre o símbolo, sin distinguir mayúsculas. Un texto vacío o solo con
 * espacios devuelve la lista completa. Conserva el orden original.
 */
export function filterCoins<T extends { name: string; symbol: string }>(
  coins: readonly T[],
  query: string
): readonly T[] {
  const normalized = query.trim().toLowerCase();
  if (normalized === '') {
    return coins;
  }

  return coins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(normalized) || coin.symbol.toLowerCase().includes(normalized)
  );
}
