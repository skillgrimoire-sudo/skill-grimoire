import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwt, SESSION_COOKIE } from "@/lib/auth";

/**
 * GET /api/auth/me
 * Returns the currently logged-in user from the session cookie.
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const payload = await verifyJwt(token);
    if (!payload) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        studentClass: true,
        dateOfBirth: true,
        avatarUrl: true,
        emailVerified: true,
        mustChangePassword: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (err) {
    console.error("[GET /api/auth/me]", err);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}

/**
 * PATCH /api/auth/me
 * Body: { name }
 * Updates the currently logged-in user's profile.
 */
export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyJwt(token);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { name } = body;

    if (typeof name !== "string") {
      return NextResponse.json({ error: "Name must be a string." }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: { name: name.trim() },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        avatarUrl: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (err) {
    console.error("[PATCH /api/auth/me]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
