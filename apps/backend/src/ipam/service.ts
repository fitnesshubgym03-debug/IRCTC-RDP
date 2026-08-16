import type { Pool } from "../database/pool.js";
import { Errors } from "../errors.js";
import type { RegionId } from "@irctcrdp/contracts";

export interface IpAllocation {
  id: number;
  ipv4: string;
  gateway: string;
  prefixLen: number;
  dnsPrimary: string;
  dnsSecondary: string;
}

/**
 * Reserve a free IP in the region using SELECT ... FOR UPDATE inside a
 * transaction — two concurrent allocations can never receive the same IP.
 */
export async function reserveIp(db: Pool, region: RegionId): Promise<IpAllocation> {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.execute<import("mysql2/promise").RowDataPacket[]>(
      `SELECT id, ipv4, gateway, prefix_len, dns_primary, dns_secondary
       FROM ip_addresses
       WHERE region = ? AND status = 'free'
       ORDER BY id ASC
       LIMIT 1
       FOR UPDATE`,
      [region],
    );
    const row = rows[0];
    if (!row) {
      await conn.rollback();
      throw Errors.conflict(`No IP addresses available in region ${region}`);
    }
    await conn.execute("UPDATE ip_addresses SET status = 'reserved', allocated_at = NOW(), server_id = NULL WHERE id = ?", [
      row.id,
    ]);
    await conn.commit();
    return {
      id: row.id as number,
      ipv4: row.ipv4 as string,
      gateway: row.gateway as string,
      prefixLen: row.prefix_len as number,
      dnsPrimary: row.dns_primary as string,
      dnsSecondary: row.dns_secondary as string,
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function allocateIp(db: Pool, ipId: number, serverId: string): Promise<void> {
  await db.execute("UPDATE ip_addresses SET status = 'allocated', server_id = ? WHERE id = ?", [serverId, ipId]);
}

export async function releaseIp(db: Pool, ipId: number): Promise<void> {
  await db.execute(
    "UPDATE ip_addresses SET status = 'free', server_id = NULL, released_at = NOW() WHERE id = ?",
    [ipId],
  );
}

export async function getReservedByJobResult(db: Pool, result: string | null): Promise<IpAllocation | null> {
  if (!result) return null;
  try {
    const parsed = JSON.parse(result) as { ipId?: number };
    if (!parsed.ipId) return null;
    const [rows] = await db.query<import("mysql2/promise").RowDataPacket[]>(
      "SELECT id, ipv4, gateway, prefix_len, dns_primary, dns_secondary FROM ip_addresses WHERE id = ? LIMIT 1",
      [parsed.ipId],
    );
    const row = rows[0];
    if (!row || (row.status as string) !== "reserved") return null;
    return {
      id: row.id as number,
      ipv4: row.ipv4 as string,
      gateway: row.gateway as string,
      prefixLen: row.prefix_len as number,
      dnsPrimary: row.dns_primary as string,
      dnsSecondary: row.dns_secondary as string,
    };
  } catch {
    return null;
  }
}

/**
 * Idempotent seed of the simulated IP pools (private ranges per region).
 * In production, replace/extend these with your public IP ranges via SQL.
 */
export async function seedIpPools(db: Pool): Promise<void> {
  const pools: Array<{ region: RegionId; base: string; count: number; gateway: string; prefix: number }> = [
    { region: "mumbai", base: "10.10.0", count: 50, gateway: "10.10.0.1", prefix: 24 },
    { region: "delhi", base: "10.20.0", count: 50, gateway: "10.20.0.1", prefix: 24 },
    { region: "bangalore", base: "10.30.0", count: 50, gateway: "10.30.0.1", prefix: 24 },
    { region: "hyderabad", base: "10.40.0", count: 50, gateway: "10.40.0.1", prefix: 24 },
  ];
  for (const pool of pools) {
    for (let i = 0; i < pool.count; i++) {
      await db.execute(
        `INSERT IGNORE INTO ip_addresses (region, ipv4, gateway, prefix_len) VALUES (?, ?, ?, ?)`,
        [pool.region, `${pool.base}.${i + 2}`, pool.gateway, pool.prefix],
      );
    }
  }
}