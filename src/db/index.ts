import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL is not set. Database features might not work properly.");
}

const connectionString = process.env.DATABASE_URL || "postgres://localhost/placeholder";

const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 5000, // 5 detik timeout koneksi
  query_timeout: 5000,           // 5 detik timeout kueri
  ssl: connectionString.includes("placeholder") ? false : { rejectUnauthorized: false }
});

export const db = drizzle(pool, { schema });
export type DbClient = typeof db;
