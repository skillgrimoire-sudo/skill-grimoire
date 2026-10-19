import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyOtp, hashPassword } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const MAX_FAILED_ATTEMPTS = 4;

/**
 * POST /api/auth/reset-password
 * Body: { email, otp, newPassword, confirmPassword, type?: "RESET" | "FIRST_LOGIN" }
 *
 * Verifies OTP and updates the user's password.
 * Enforces rate limiting, attempt tracking, auto-invalidation after 4 failed attempts,
 * and uniform error reporting.
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const ipLimit = checkRateLimit(`reset_ip_${ip}`, 15, 60 * 1000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute before trying again." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, otp, newPassword, confirmPassword, type = "RESET" } = body as {
      email: string;
      otp: string;
      newPassword: string;
      confirmPassword: string;
      type?: "RESET" | "FIRST_LOGIN";
    };

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: "Email, OTP, and new password are required." }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const emailLimit = checkRateLimit(`reset_email_${normalizedEmail}`, 10, 120 * 1000);
    if (!emailLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests for this account. Please wait a moment." },
        { status: 429 }
      );
    }

    // ── Find OTP token ────────────────────────────────────────────────────────
    const tokenRecord = await prisma.otpToken.findFirst({
      where: { email: normalizedEmail, type },
      orderBy: { createdAt: "desc" },
    });

    if (!tokenRecord) {
      return NextResponse.json({ error: "Invalid or expired verification code. Please request a new one." }, { status: 400 });
    }

    if (new Date() > tokenRecord.expiresAt) {
      await prisma.otpToken.delete({ where: { id: tokenRecord.id } });
      return NextResponse.json({ error: "Invalid or expired verification code. Please request a new one." }, { status: 400 });
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

    if (currentAttempts >= MAX_FAILED_ATTEMPTS) {
      await prisma.otpToken.delete({ where: { id: tokenRecord.id } });
      return NextResponse.json(
        { error: "Too many failed attempts. For security, this verification code has been invalidated. Please request a new one." },
        { status: 429 }
      );
    }

    const isValid = await verifyOtp(otp, tokenRecord.tokenHash);
    if (!isValid) {
      const nextAttempts = currentAttempts + 1;
      if (nextAttempts >= MAX_FAILED_ATTEMPTS) {
        await prisma.otpToken.delete({ where: { id: tokenRecord.id } });
        return NextResponse.json(
          { error: "Too many failed attempts. For security, this verification code has been invalidated. Please request a new one." },
          { status: 429 }
        );
      }

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

    // OTP verified — clean up token
    await prisma.otpToken.delete({ where: { id: tokenRecord.id } });

    // Find the user
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    // Update password
    const newHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newHash,
        mustChangePassword: false,
        emailVerified: true,
      },
    });

    return NextResponse.json({ success: true, message: "Password has been reset successfully. You can now log in." });
  } catch (err) {
    console.error("[POST /api/auth/reset-password]", err);
    return NextResponse.json({ error: "Failed to reset password." }, { status: 500 });
  }
}


   export async function GET(request: NextRequest) {
     return NextResponse.redirect(new URL("/student-login", request.url));
   }