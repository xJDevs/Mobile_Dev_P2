import type { SQLiteDatabase } from 'expo-sqlite';

import type { CoinPrice } from '../models/Coin';
import type { Favorite } from '../models/Favorite';

interface FavoriteRow {
  coin_id: string;
  name: string;
  symbol: string;
  image_url: string | null;
  last_price_usd: number | null;
  saved_at: number;
}

function toFavorite(row: FavoriteRow): Favorite {
  return {
    coinId: row.coin_id,
    name: row.name,
    symbol: row.symbol,
    imageUrl: row.image_url,
    lastPriceUsd: row.last_price_usd,
    savedAt: row.saved_at,
  };
}

/** Favoritos guardados, del más reciente al más antiguo. */
export async function getAll(db: SQLiteDatabase): Promise<Favorite[]> {
  const rows = await db.getAllAsync<FavoriteRow>(
    'SELECT coin_id, name, symbol, image_url, last_price_usd, saved_at FROM favorites ORDER BY saved_at DESC'
  );

  return rows.map(toFavorite);
}

/**
 * Guarda un favorito. La clave primaria evita duplicados: si la moneda ya está,
 * se actualizan sus datos y se conserva el saved_at original.
 */
export async function add(db: SQLiteDatabase, favorite: Favorite): Promise<void> {
  await db.runAsync(
    `INSERT INTO favorites (coin_id, name, symbol, image_url, last_price_usd, saved_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(coin_id) DO UPDATE SET
       name = excluded.name,
       symbol = excluded.symbol,
       image_url = excluded.image_url,
       last_price_usd = excluded.last_price_usd`,
    [
      favorite.coinId,
      favorite.name,
      favorite.symbol,
      favorite.imageUrl,
      favorite.lastPriceUsd,
      favorite.savedAt,
    ]
  );
}

export async function remove(db: SQLiteDatabase, coinId: string): Promise<void> {
  await db.runAsync('DELETE FROM favorites WHERE coin_id = ?', [coinId]);
}

/** Guarda el último precio conocido. Ignora los precios nulos y las monedas que no están guardadas. */
export async function updatePrices(
  db: SQLiteDatabase,
  prices: readonly CoinPrice[]
): Promise<void> {
  const withPrice = prices.filter((price) => price.price !== null);
  if (withPrice.length === 0) {
    return;
  }

  await db.withTransactionAsync(async () => {
    for (const price of withPrice) {
      await db.runAsync('UPDATE favorites SET last_price_usd = ? WHERE coin_id = ?', [
        price.price,
        price.id,
      ]);
    }
  });
}
