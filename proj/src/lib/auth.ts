import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import type { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SALT_ROUNDS = 12;
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-dev-secret-change-in-production"
);
const SESSION_COOKIE = "sg_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// ── Password ─────────────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ── OTP ──────────────────────────────────────────────────────────────────────

export function generateOtp(): string {
  // 6-digit numeric OTP, zero-padded
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function hashOtp(otp: string): Promise<string> {
  return bcrypt.hash(otp, 10);
}

export async function verifyOtp(otp: string, hash: string): Promise<boolean> {
  return bcrypt.compare(otp, hash);
}

// ── Session versions (logout everywhere on password change) ─────────────────
//
// Every session token carries the user's current "session version" (sv).
// Changing / resetting a password bumps the version, so every token issued
// before the change is rejected by verifyJwt() on its next use — on every
// device. Tokens issued before this feature existed count as version 0.

let sessionTableReady: Promise<void> | null = null;

function ensureSessionVersionTable(): Promise<void> {
  if (!sessionTableReady) {
    // Mirrors `model SessionVersion` in prisma/schema.prisma.
    sessionTableReady = (async () => {
      await prisma.$executeRawUnsafe(
        `CREATE TABLE IF NOT EXISTS "SessionVersion" (
          "userId" TEXT NOT NULL,
          "version" INTEGER NOT NULL DEFAULT 0,
          "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "SessionVersion_pkey" PRIMARY KEY ("userId")
        )`
      );
    })().catch((err: unknown) => {
      sessionTableReady = null; // retry on the next request
      throw err;
    });
  }
  return sessionTableReady;
}

/** Current session version for a user (0 if never changed). */
export async function getSessionVersion(userId: string): Promise<number> {
  await ensureSessionVersionTable();
  const rows = await prisma.$queryRaw<{ version: number }[]>`
    SELECT "version" FROM "SessionVersion" WHERE "userId" = ${userId}
  `;
  return Number(rows[0]?.version ?? 0);
}

/**
 * Invalidates ALL existing sessions of a user. Call this whenever the
 * user's password is changed or reset. Returns the new version.
 */
export async function revokeAllSessions(userId: string): Promise<number> {
  await ensureSessionVersionTable();
  const rows = await prisma.$queryRaw<{ version: number }[]>`
    INSERT INTO "SessionVersion" ("userId", "version", "updatedAt")
    VALUES (${userId}, 1, NOW())
    ON CONFLICT ("userId") DO UPDATE SET
      "version" = "SessionVersion"."version" + 1,
      "updatedAt" = NOW()
    RETURNING "version"
  `;
  return Number(rows[0]?.version ?? 1);
}

// ── JWT / Session ─────────────────────────────────────────────────────────────

export interface SessionPayload {
  userId: string;
  email: string;
  username: string;
  role: string;
  sv?: number; // session version — filled in automatically by signJwt()
}

export async function signJwt(payload: SessionPayload): Promise<string> {
  const sv = payload.sv ?? (await getSessionVersion(payload.userId));
  return new SignJWT({ ...payload, sv })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(JWT_SECRET);
}

export async function verifyJwt(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const session = payload as unknown as SessionPayload;
    if (!session.userId) return null;

    // Reject tokens issued before the user's last password change.
    const currentVersion = await getSessionVersion(session.userId);
    if ((session.sv ?? 0) !== currentVersion) return null;

    return session;
  } catch {
    return null;
  }
}

import { cookies } from "next/headers";

export async function setSessionCookie(
  res: NextResponse,
  token: string
): Promise<NextResponse> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}

export async function clearSessionCookie(res: NextResponse): Promise<NextResponse> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return res;
}

export { SESSION_COOKIE };
