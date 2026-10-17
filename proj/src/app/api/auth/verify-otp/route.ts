import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyOtp, signJwt, setSessionCookie } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const MAX_FAILED_ATTEMPTS = 4;

/**
 * POST /api/auth/verify-otp
 * Body: { email, otp, type: "SIGNUP" | "LOGIN" | "RESET" | "FIRST_LOGIN" }
 *
 * Enforces rate limiting, attempt tracking, auto-invalidation after 4 failed attempts,
 * and uniform error reporting to prevent state enumeration.
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    
    // ── 1. Global IP Rate Limit (15 req / min) ──────────────────────────────
    const ipLimit = checkRateLimit(`verify_ip_${ip}`, 15, 60 * 1000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute before trying again." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, otp, type } = body as {
      email: string;
      otp: string;
      type: "SIGNUP" | "LOGIN" | "RESET" | "FIRST_LOGIN";
    };

    if (!email || !otp || !type) {
      return NextResponse.json(
        { error: "Email, OTP, and type are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ── 2. Per-Email Rate Limit (10 req / 2 min) ────────────────────────────
    const emailLimit = checkRateLimit(`verify_email_${normalizedEmail}`, 10, 120 * 1000);
    if (!emailLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests for this account. Please wait a moment." },
        { status: 429 }
      );
    }

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: "OTP must be a 6-digit number." },
        { status: 400 }
      );
    }

    // ── 3. Find the OTP record ──────────────────────────────────────────────
    const tokenRecord = await prisma.otpToken.findFirst({
      where: { email: normalizedEmail, type },
      orderBy: { createdAt: "desc" },
    });

    // Uniform response if missing or expired (mitigates oracle state enumeration)
    if (!tokenRecord) {
      return NextResponse.json(
        { error: "Invalid or expired verification code. Please request a new one." },
        { status: 400 }
      );
    }

    if (new Date() > tokenRecord.expiresAt) {
      await prisma.otpToken.delete({ where: { id: tokenRecord.id } });
      return NextResponse.json(
        { error: "Invalid or expired verification code. Please request a new one." },
        { status: 400 }
      );
    }

    // Parse metadata for attempt tracking
    let parsedMetadata: Record<string, any> = {};
    try {
      if (tokenRecord.metadata) {
        parsedMetadata = JSON.parse(tokenRecord.metadata);
      }
    } catch {
      parsedMetadata = {};
    }

    const currentAttempts = typeof parsedMetadata.attempts === "number" ? parsedMetadata.attempts : 0;

    // ── 4. Check if max failed attempts already reached ─────────────────────
    if (currentAttempts >= MAX_FAILED_ATTEMPTS) {
      await prisma.otpToken.delete({ where: { id: tokenRecord.id } });
      return NextResponse.json(
        { error: "Too many failed attempts. For security, this verification code has been invalidated. Please request a new one." },
        { status: 429 }
      );
    }

    // ── 5. Verify OTP hash ──────────────────────────────────────────────────
    const isValid = await verifyOtp(otp, tokenRecord.tokenHash);
    if (!isValid) {
      const nextAttempts = currentAttempts + 1;
      
      // Auto-invalidate code if max attempts reached
      if (nextAttempts >= MAX_FAILED_ATTEMPTS) {
        await prisma.otpToken.delete({ where: { id: tokenRecord.id } });
        return NextResponse.json(
          { error: "Too many failed attempts. For security, this verification code has been invalidated. Please request a new one." },
          { status: 429 }
        );
      }

      // Record incremented attempt count in metadata
      await prisma.otpToken.update({
        where: { id: tokenRecord.id },
        data: {
          metadata: JSON.stringify({ ...parsedMetadata, attempts: nextAttempts }),
        },
      });

      const remaining = MAX_FAILED_ATTEMPTS - nextAttempts;
      return NextResponse.json(
        { error: `Incorrect verification code. ${remaining} ${remaining === 1 ? "attempt" : "attempts"} remaining before code is invalidated.` },
        { status: 401 }
      );
    }

    // For password reset / first login flows, confirm OTP validity without deleting,
    // allowing reset-password endpoint to perform final check and consumption.
    if (type === "RESET" || type === "FIRST_LOGIN") {
      return NextResponse.json({
        success: true,
        message: "Verification code confirmed successfully.",
      });
    }

    // OTP verified for login/signup — delete the used token
    await prisma.otpToken.delete({ where: { id: tokenRecord.id } });

    let user;

    if (type === "SIGNUP") {
      if (!tokenRecord.metadata) {
        return NextResponse.json(
          { error: "Signup data not found. Please start the registration process again." },
          { status: 400 }
        );
      }

      const { username, passwordHash, displayUsername } = JSON.parse(
        tokenRecord.metadata
      ) as { username: string; passwordHash: string; displayUsername: string };

      const existing = await prisma.user.findFirst({
        where: { OR: [{ email: normalizedEmail }, { username }] },
      });
      if (existing) {
        return NextResponse.json(
          { error: "Email or username already taken. Please sign up again." },
          { status: 409 }
        );
      }

      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          username,
          passwordHash,
          name: displayUsername,
          emailVerified: true,
          role: "STUDENT",
        },
      });
    } else {
      user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!user) {
        return NextResponse.json(
          { error: "Account not found." },
          { status: 404 }
        );
      }
    }

    // ── Issue session JWT ───────────────────────────────────────────────────
    const token = await signJwt({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
      },
      isNewUser: type === "SIGNUP",
    });

    return setSessionCookie(response, token);
  } catch (err) {
    console.error("[POST /api/auth/verify-otp]", err);
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}
