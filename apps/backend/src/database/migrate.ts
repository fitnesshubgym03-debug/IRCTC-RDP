import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import mysql from "mysql2/promise";
import { loadConfig } from "../config.js";

export async function migrate(pool: mysql.Pool): Promise<string[]> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name VARCHAR(255) NOT NULL PRIMARY KEY,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    "SELECT name FROM schema_migrations",
  );
  const applied = new Set(rows.map((r) => r.name as string));

  const dir = join(process.cwd(), "migrations");
  const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();

  const ran: string[] = [];
  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = readFileSync(join(dir, file), "utf8");
    const statements = sql
      .split(/;\s*(?:\n|$)/)
      .map((s) => s.trim())
      .filter(Boolean);
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      for (const statement of statements) {
        await conn.query(statement);
      }
      await conn.query("INSERT INTO schema_migrations (name) VALUES (?)", [file]);
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw new Error(`Migration ${file} failed: ${(err as Error).message}`);
    } finally {
      conn.release();
    }
    ran.push(file);
  }
  return ran;
}

if (process.argv[1]?.endsWith("migrate.ts") || process.argv[1]?.endsWith("migrate.js")) {
  const config = loadConfig();
  const pool = mysql.createPool({ uri: config.MYSQL_URL, connectionLimit: 2 });
  migrate(pool)
    .then((ran) => {
      console.log(ran.length ? `Applied migrations: ${ran.join(", ")}` : "No pending migrations.");
      return pool.end();
    })
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}