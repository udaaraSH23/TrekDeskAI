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
  // Only enable SSL if we are in production AND NOT using a local proxy or Cloud SQL socket
  ssl:
    env.NODE_ENV === "production" &&
    !env.DATABASE_URL.includes("localhost") &&
    !env.DATABASE_URL.includes("127.0.0.1") &&
    !env.DATABASE_URL.includes("host.docker.internal") &&
    !env.DATABASE_URL.includes("/cloudsql/")
      ? { rejectUnauthorized: false }
      : false,
});

/**
 * Re-usable query execution wrapper linked to the central connection pool.
 *
 * @param text - The raw SQL string (parameterized with `$1`, `$2` etc)
 * @param params - The dynamic parameters mapped to the SQL vars.
 */
export const query = (text: string, params?: unknown[]) =>
  pool.query(text, params);

/**
 * Validates the database connection.
 * Used during startup to ensure the backend can reach the PostgreSQL cluster.
 */
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    try {
      await client.query("SELECT 1");
      return true;
    } finally {
      client.release();
    }
  } catch (err) {
    const dbError = new Error("database is not connected");
    // @ts-expect-error - 'cause' is not in ES2020 Error but required by lint
    dbError.cause = err;
    throw dbError;
  }
};

export default pool;
