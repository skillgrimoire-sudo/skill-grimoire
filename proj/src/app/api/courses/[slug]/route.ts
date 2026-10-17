import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwt, SESSION_COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const token =
      request.cookies.get(SESSION_COOKIE)?.value ||
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload = await verifyJwt(token);
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const student = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const targetClass = student.studentClass;
    const { slug } = await params;

    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        domain: true,
        lessons: {
          where: { isPublished: true },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 });
    }

    // Verify course class restriction if applicable (admins bypass)
    if (payload.role !== "ADMIN" && course.targetClass && course.targetClass.trim() !== "") {
      if (!targetClass) {
        return NextResponse.json({ success: false, error: "Unauthorized for this class" }, { status: 403 });
      }
      const allowedClasses = course.targetClass
        .split(",")
        .map((c) => c.trim().toLowerCase());
      const sClass = targetClass.trim().toLowerCase();
      const sClassClean = sClass.replace(/\s+/g, "");

      const isAllowed =
        allowedClasses.includes("all") ||
        allowedClasses.includes(sClass) ||
        allowedClasses.some((c) => c.replace(/\s+/g, "") === sClassClean);

      if (!isAllowed) {
        return NextResponse.json({ success: false, error: "Unauthorized for this class" }, { status: 403 });
      }
    }

    return NextResponse.json({
      success: true,
      course,
    });
  } catch (error) {
    console.error("[GET /api/courses/[slug]] error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
