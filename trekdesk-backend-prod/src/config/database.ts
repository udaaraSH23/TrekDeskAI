/**
 * @file database.ts
 * @description PostgreSQL connection pool management and query wrapper.
 */
import { Pool } from "pg";
import { env } from "./env";

/**
 * PostgreSQL Connection Pool.
 * Automatically provisions a cluster pool using the validated `DATABASE_URL`.
 * Dynamically enforces SSL based on the active Node environment.
 */
const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

/**
 * Re-usable query execution wrapper linked to the central connection pool.
 *
 * @param text - The raw SQL string (parameterized with `$1`, `$2` etc)
 * @param params - The dynamic parameters mapped to the SQL vars.
 */
export const query = (text: string, params?: unknown[]) =>
  pool.query(text, params);

export default pool;
