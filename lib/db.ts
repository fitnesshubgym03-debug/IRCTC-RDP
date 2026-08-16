import "server-only"
import mysql from "mysql2/promise"

let pool: mysql.Pool | null = null
let schemaReady: Promise<void> | null = null

export function isDbConfigured(): boolean {
  return Boolean(process.env.MYSQL_URL)
}

/** Lazily creates a shared connection pool from MYSQL_URL. */
export function getPool(): mysql.Pool {
  if (!process.env.MYSQL_URL) {
    throw new Error("MYSQL_URL is not set. Add your MySQL connection string to enable orders.")
  }
  if (!pool) {
    pool = mysql.createPool({
      uri: process.env.MYSQL_URL,
      connectionLimit: 5,
      waitForConnections: true,
      namedPlaceholders: true,
      // Aiven / PlanetScale / most managed MySQL require TLS.
      ssl: process.env.MYSQL_URL.includes("localhost") ? undefined : { rejectUnauthorized: false },
    })
  }
  return pool
}

/** Creates the orders table once per process. */
export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await getPool().query(`
        CREATE TABLE IF NOT EXISTS orders (
          id VARCHAR(40) NOT NULL PRIMARY KEY,
          plan_id VARCHAR(64) NOT NULL,
          plan_name VARCHAR(128) NOT NULL,
          platform VARCHAR(64) NOT NULL,
          region VARCHAR(64) NOT NULL,
          os_image VARCHAR(64) NOT NULL,
          hostname VARCHAR(255) NULL,
          billing_cycle VARCHAR(20) NOT NULL,
          amount_inr INT NOT NULL,
          currency VARCHAR(8) NOT NULL DEFAULT 'INR',
          email VARCHAR(255) NOT NULL,
          status ENUM('pending','paid','failed') NOT NULL DEFAULT 'pending',
          razorpay_order_id VARCHAR(64) NULL,
          razorpay_payment_id VARCHAR(64) NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_email (email),
          INDEX idx_status (status),
          INDEX idx_razorpay_order (razorpay_order_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `)
    })().catch((error) => {
      // Reset so a later request can retry after transient connection failures.
      schemaReady = null
      throw error
    })
  }
  return schemaReady
}
