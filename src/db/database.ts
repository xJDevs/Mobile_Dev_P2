import * as SQLite from 'expo-sqlite';

export const DATABASE_NAME = 'crypto-explorer.db';

type Migration = (db: SQLite.SQLiteDatabase) => Promise<void>;

// El índice del arreglo es la versión: migrations[0] lleva la base de la versión 0 a la 1.
const migrations: Migration[] = [
  async (db) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS favorites (
        coin_id        TEXT PRIMARY KEY NOT NULL,
        name           TEXT NOT NULL,
        symbol         TEXT NOT NULL,
        image_url      TEXT,
        last_price_usd REAL,
        saved_at       INTEGER NOT NULL
      );
    `);
  },
];

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * Conexión única a la base local, ya migrada. Si la apertura falla, la promesa no queda
 * memoizada: el siguiente intento vuelve a abrir.
 */
export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  databasePromise ??= openAndMigrate().catch((error: unknown) => {
    databasePromise = null;
    throw error;
  });

  return databasePromise;
}

async function openAndMigrate(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await db.execAsync('PRAGMA journal_mode = WAL;');

  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = row?.user_version ?? 0;

  for (let version = currentVersion; version < migrations.length; version += 1) {
    await migrations[version](db);
  }

  if (currentVersion < migrations.length) {
    // PRAGMA no acepta parámetros; el valor viene del largo del arreglo, no de datos externos.
    await db.execAsync(`PRAGMA user_version = ${migrations.length};`);
  }

  return db;
}
