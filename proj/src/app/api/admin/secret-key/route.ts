import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminSecretKey, setAdminSecretKey } from "@/lib/admin-secret";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/secret-key
 * Returns current secret key and full portal URL (Admin only)
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  try {
    const secretKey = await getAdminSecretKey();
    const host = request.headers.get("host") || "skillgrimoire.com";
    const protocol = host.includes("localhost") ? "http" : "https";
    const accessUrl = `${protocol}://${host}/admin?key=${secretKey}`;

    return NextResponse.json({
      success: true,
      secretKey,
      accessUrl,
    });
  } catch (err: any) {
    console.error("[GET /api/admin/secret-key]", err);
    return NextResponse.json({ error: "Failed to retrieve secret key." }, { status: 500 });
  }
}

/**
 * POST /api/admin/secret-key
 * Updates the secret key in the database (Admin only)
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const { secretKey } = body;

    if (!secretKey || typeof secretKey !== "string" || secretKey.trim().length < 6) {
      return NextResponse.json(
        { error: "Secret key must be a string of at least 6 characters." },
        { status: 400 }
      );
    }

    const updatedKey = await setAdminSecretKey(secretKey);
    const host = request.headers.get("host") || "skillgrimoire.com";
    const protocol = host.includes("localhost") ? "http" : "https";
    const accessUrl = `${protocol}://${host}/admin?key=${updatedKey}`;

    return NextResponse.json({
      success: true,
      secretKey: updatedKey,
      accessUrl,
      message: "Admin secret key updated successfully.",
    });
  } catch (err: any) {
    console.error("[POST /api/admin/secret-key]", err);
    return NextResponse.json(
      { error: err?.message || "Failed to update secret key." },
      { status: 500 }
    );
  }
}
