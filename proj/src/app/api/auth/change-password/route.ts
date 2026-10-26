import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyPassword,
  hashPassword,
  verifyJwt,
  signJwt,
  setSessionCookie,
  revokeAllSessions,
  SESSION_COOKIE,
} from "@/lib/auth";

/**
 * POST /api/auth/change-password
 * Body: { newPassword, confirmPassword, currentPassword? }
 *
 * Two modes:
 *  1. First-login forced change: user already has an active session but
 *     mustChangePassword=true. No currentPassword needed if email was OTP-verified.
 *  2. Normal change: requires currentPassword.
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const payload = await verifyJwt(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid session." }, { status: 401 });
    }

    const body = await request.json();
    const { newPassword, confirmPassword, currentPassword, emailVerified } = body as {
      newPassword: string;
      confirmPassword: string;
      currentPassword?: string;
      emailVerified?: boolean; // true if OTP was already verified for FIRST_LOGIN
    };

    if (!newPassword || !confirmPassword) {
      return NextResponse.json({ error: "New password and confirmation are required." }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // If not a first-login forced change, verify current password
    if (!emailVerified && !user.mustChangePassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password is required." }, { status: 400 });
      }
      const match = await verifyPassword(currentPassword, user.passwordHash);
      if (!match) {
        return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
      }
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

    // Log out every other session, then keep this device logged in.
    const newVersion = await revokeAllSessions(user.id);
    const newToken = await signJwt({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      sv: newVersion,
    });

    const response = NextResponse.json({ success: true, message: "Password updated successfully." });
    return await setSessionCookie(response, newToken);
  } catch (err) {
    console.error("[POST /api/auth/change-password]", err);
    return NextResponse.json({ error: "Failed to change password." }, { status: 500 });
  }
}
