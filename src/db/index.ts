import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL is not set. Database features might not work properly.");
}

const connectionString = process.env.DATABASE_URL || "postgres://localhost/placeholder";
const sql = neon(connectionString);

export const db = drizzle(sql, { schema });
