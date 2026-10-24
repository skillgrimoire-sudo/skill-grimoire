import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signJwt, setSessionCookie } from "@/lib/auth";
import { checkRateLimit, refundRateLimit, getClientIp } from "@/lib/rate-limit";

// Brute-force protection: max 10 login attempts per IP address every 5 minutes.
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 60 * 60 * 1000;

/**
 * POST /api/auth/login
 * Body: { email, password }
 *
 * Returns mustChangePassword=true if the user must set a new password on first login.
 * Session is still issued so the /change-password page can work.
 */
export async function POST(request: NextRequest) {
  try {
    // ── IP rate limit (checked before touching the database or passwords) ──
    const ip = getClientIp(request);
    const rateKey = `login_ip_${ip}`;
    const ipLimit = await checkRateLimit(rateKey, LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS);
    if (!ipLimit.allowed) {
      const minutes = Math.ceil(ipLimit.resetInSec / 60);
      return NextResponse.json(
        {
          error: `Too many login attempts. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
        },
        { status: 429, headers: { "Retry-After": String(ipLimit.resetInSec) } }
      );
    }

    const body = await request.json();
    const { email, password } = body as { email: string; password: string };

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Admin login check
    if (user.role === "ADMIN") {
      const passwordMatch = await verifyPassword(password, user.passwordHash);
      if (!passwordMatch) {
        return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
      }

      const token = await signJwt({
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      });

      const response = NextResponse.json({
        success: true,
        user: { id: user.id, email: user.email, username: user.username, name: user.name, role: user.role },
        isAdmin: true,
      });

      await refundRateLimit(rateKey); // successful login doesn't count
      return await setSessionCookie(response, token);
    }

    // Verify password for students
    const passwordMatch = await verifyPassword(password, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Issue session JWT (even for mustChangePassword users so they can use the change-password page)
    const token = await signJwt({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      mustChangePassword: user.mustChangePassword,
      termsAccepted: !!user.termsAcceptedAt,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
        termsAccepted: !!user.termsAcceptedAt,
      },
    });

    await refundRateLimit(rateKey); // successful login doesn't count
    return await setSessionCookie(response, token);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/auth/login]", err);
    return NextResponse.json(
      { error: "Login failed. Please try again.", details: message },
      { status: 500 }
    );
  }
}
