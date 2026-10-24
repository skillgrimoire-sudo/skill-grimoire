import { prisma } from "@/lib/prisma";

/**
 * Database-backed rate limiting.
 *
 * On Netlify every request can run in a different short-lived serverless
 * instance, so an in-memory counter resets constantly and cannot stop a
 * brute-force attack. Counters are therefore stored in Postgres (table
 * "RateLimit"), and every instance sees the same count.
 *
 * Each call to checkRateLimit() atomically adds one attempt and tells you
 * whether the caller is still under the limit. Use refundRateLimit() to
 * give an attempt back (e.g. after a successful login) so that many
 * students on one shared school/college network are not blocked by
 * their own successful logins.
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInSec: number;
}

// ── Table bootstrap ──────────────────────────────────────────────────────────
// Mirrors `model RateLimit` in prisma/schema.prisma, so the table exists even
// if `prisma db push` has not been run against the production database yet.
let tableReady: Promise<void> | null = null;

function ensureTable(): Promise<void> {
  if (!tableReady) {
    tableReady = (async () => {
      await prisma.$executeRawUnsafe(
        `CREATE TABLE IF NOT EXISTS "RateLimit" (
          "key" TEXT NOT NULL,
          "count" INTEGER NOT NULL DEFAULT 0,
          "resetAt" TIMESTAMPTZ(3) NOT NULL,
          CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("key")
        )`
      );
      await prisma.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "RateLimit_resetAt_idx" ON "RateLimit"("resetAt")`
      );
    })().catch((err) => {
      tableReady = null; // retry on the next request
      throw err;
    });
  }
  return tableReady;
}

// ── In-memory fallback (only used if the database is unreachable) ───────────
const memoryMap = new Map<string, { count: number; resetAt: number }>();

function memoryCheck(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const record = memoryMap.get(key);
  if (!record || now > record.resetAt) {
    memoryMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetInSec: Math.ceil(windowMs / 1000) };
  }
  record.count += 1;
  const resetInSec = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
  return { allowed: record.count <= limit, remaining: Math.max(0, limit - record.count), resetInSec };
}

/**
 * Records one attempt for `key` and reports whether it is within `limit`
 * attempts per `windowMs`. The count is shared across all server instances.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  try {
    await ensureTable();

    const rows = await prisma.$queryRaw<{ count: number; resetInSec: number }[]>`
      INSERT INTO "RateLimit" ("key", "count", "resetAt")
      VALUES (${key}, 1, NOW() + (${windowMs}::int * INTERVAL '1 millisecond'))
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE WHEN "RateLimit"."resetAt" <= NOW() THEN 1
                       ELSE "RateLimit"."count" + 1 END,
        "resetAt" = CASE WHEN "RateLimit"."resetAt" <= NOW() THEN EXCLUDED."resetAt"
                         ELSE "RateLimit"."resetAt" END
      RETURNING "count",
        GREATEST(1, CEIL(EXTRACT(EPOCH FROM ("resetAt" - NOW()))))::int AS "resetInSec"
    `;

    // Occasionally clear out long-expired rows so the table stays small.
    if (Math.random() < 0.02) {
      prisma
        .$executeRaw`DELETE FROM "RateLimit" WHERE "resetAt" < NOW() - INTERVAL '1 day'`
        .catch(() => {});
    }

    const count = Number(rows[0]?.count ?? 1);
    const resetInSec = Number(rows[0]?.resetInSec ?? Math.ceil(windowMs / 1000));
    return { allowed: count <= limit, remaining: Math.max(0, limit - count), resetInSec };
  } catch (err) {
    console.error("[rate-limit] database unavailable, using in-memory fallback", err);
    return memoryCheck(key, limit, windowMs);
  }
}

/**
 * Gives back one attempt for `key` (e.g. after a successful login).
 */
export async function refundRateLimit(key: string): Promise<void> {
  try {
    await prisma.$executeRaw`
      UPDATE "RateLimit" SET "count" = GREATEST("count" - 1, 0) WHERE "key" = ${key}
    `;
  } catch {
    const record = memoryMap.get(key);
    if (record) record.count = Math.max(0, record.count - 1);
  }
}

/**
 * Extracts the real client IP address.
 *
 * On Netlify, `x-nf-client-connection-ip` is set by Netlify's edge and
 * cannot be forged by the visitor. `x-forwarded-for` CAN be sent by the
 * visitor themselves, so it is only used as a fallback (e.g. local dev).
 */
export function getClientIp(req: Request): string {
  const netlifyIp = req.headers.get("x-nf-client-connection-ip");
  if (netlifyIp) return netlifyIp.trim();

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  return "unknown";
}
