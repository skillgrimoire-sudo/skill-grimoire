import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyOtp, signJwt, setSessionCookie } from "@/lib/auth";

/**
 * POST /api/auth/verify-otp
 * Body: { email, otp, type: "SIGNUP" | "LOGIN" }
 *
 * For SIGNUP: verifies OTP → creates User → sets session cookie
 * For LOGIN:  verifies OTP → looks up User → sets session cookie
 */
export async function POST(request: NextRequest) {
  try {
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

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: "OTP must be a 6-digit number." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ── Find the OTP record ───────────────────────────────────────────────────
    const tokenRecord = await prisma.otpToken.findFirst({
      where: { email: normalizedEmail, type },
      orderBy: { createdAt: "desc" },
    });

    if (!tokenRecord) {
      return NextResponse.json(
        { error: "No verification code found. Please request a new one." },
        { status: 404 }
      );
    }

    // ── Check expiry ──────────────────────────────────────────────────────────
    if (new Date() > tokenRecord.expiresAt) {
      await prisma.otpToken.delete({ where: { id: tokenRecord.id } });
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new one." },
        { status: 410 }
      );
    }

    // ── Verify OTP hash ───────────────────────────────────────────────────────
    const isValid = await verifyOtp(otp, tokenRecord.tokenHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Incorrect verification code. Please try again." },
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

    // OTP verified — delete the used token
    await prisma.otpToken.delete({ where: { id: tokenRecord.id } });

    let user;

    if (type === "SIGNUP") {
      // ── Create the user account ─────────────────────────────────────────────
      if (!tokenRecord.metadata) {
        return NextResponse.json(
          { error: "Signup data not found. Please start the registration process again." },
          { status: 400 }
        );
      }

      const { username, passwordHash, displayUsername } = JSON.parse(
        tokenRecord.metadata
      ) as { username: string; passwordHash: string; displayUsername: string };

      // Double-check uniqueness (edge case: race condition)
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
      // ── LOGIN via OTP — find existing user ──────────────────────────────────
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

    // ── Issue session JWT ─────────────────────────────────────────────────────
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
