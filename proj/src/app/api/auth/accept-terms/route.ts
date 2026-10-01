import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwt, SESSION_COOKIE } from "@/lib/auth";

/**
 * POST /api/auth/accept-terms
 * Records the user's acceptance of Terms & Conditions and Privacy Policy.
 * Requires an active session.
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyJwt(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, termsAcceptedAt: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // If already accepted, return success without updating
    if (user.termsAcceptedAt) {
      return NextResponse.json({
        success: true,
        alreadyAccepted: true,
        termsAcceptedAt: user.termsAcceptedAt,
      });
    }

    // Record acceptance
    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: { termsAcceptedAt: new Date() },
      select: { id: true, termsAcceptedAt: true },
    });

    return NextResponse.json({
      success: true,
      termsAcceptedAt: updatedUser.termsAcceptedAt,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/auth/accept-terms]", err);
    return NextResponse.json(
      { error: "Failed to record acceptance.", details: message },
      { status: 500 }
    );
  }
}
