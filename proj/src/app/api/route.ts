import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function PUT() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function DELETE() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function PATCH() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
