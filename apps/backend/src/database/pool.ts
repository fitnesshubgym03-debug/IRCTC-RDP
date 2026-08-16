import mysql from "mysql2/promise";
import type { Config } from "../config.js";

export type Pool = mysql.Pool;

export function createPool(config: Config): Pool {
  return mysql.createPool({
    uri: config.MYSQL_URL,
    connectionLimit: config.DB_POOL_SIZE,
    namedPlaceholders: false,
    charset: "utf8mb4_unicode_ci",
  });
}