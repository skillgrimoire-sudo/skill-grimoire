import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwt, SESSION_COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
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
      include: {
        enrollments: {
          include: {
            course: true,
          },
        },
        certificates: true,
        scholarships: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const targetClass = student.studentClass;

    const allCourses = await prisma.course.findMany({
      include: {
        domain: true,
      },
      orderBy: {
        enrolledCount: "desc",
      },
    });

    let courses = allCourses;

    // Filter courses by student's class if user is not admin
    if (payload.role !== "ADMIN" && targetClass && targetClass.trim() !== "") {
      const sClass = targetClass.trim().toLowerCase();
      const sClassClean = sClass.replace(/\s+/g, "");

      const filtered = allCourses.filter((course) => {
        if (!course.targetClass || course.targetClass.trim() === "") return true;
        const allowedClasses = course.targetClass
          .split(",")
          .map((c) => c.trim().toLowerCase());
        return (
          allowedClasses.includes("all") ||
          allowedClasses.includes(sClass) ||
          allowedClasses.some((c) => c.replace(/\s+/g, "") === sClassClean)
        );
      });

      if (filtered.length > 0) {
        courses = filtered;
      }
    }

    return NextResponse.json({
      success: true,
      courses,
      student,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
