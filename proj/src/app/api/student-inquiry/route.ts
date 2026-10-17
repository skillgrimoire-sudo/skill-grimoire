import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(
    { error: "Forbidden. Inquiries via this endpoint are disabled." },
    { status: 403 }
  );
}

export async function GET() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
