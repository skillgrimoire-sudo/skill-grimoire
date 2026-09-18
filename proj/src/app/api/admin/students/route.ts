import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-auth";
import { sendWelcomeEmail } from "@/lib/email";

/**
 * GET /api/admin/students — List all students
 * POST /api/admin/students — Create a new student
 */

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  try {
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        emailVerified: true,
        mustChangePassword: true,
        createdAt: true,
        studentClass: true,
        gender: true,
        dateOfBirth: true,
        enrollments: {
          select: { id: true, status: true, progressPercent: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, students });
  } catch (err) {
    console.error("[GET /api/admin/students]", err);
    return NextResponse.json({ error: "Failed to fetch students." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const {
      name,
      email,
      username,
      temporaryPassword,
      dateOfBirth,      // ISO string e.g. "2010-04-01"
      studentClass,     // e.g. "10A"
      gender,
      sendEmail = true,
    } = body as {
      name: string;
      email: string;
      username?: string;
      temporaryPassword?: string;
      dateOfBirth?: string;
      studentClass?: string;
      gender?: string;
      sendEmail?: boolean;
    };

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    // Derive password: explicit > DOB (DDMMYYYY) > error
    let resolvedPassword = temporaryPassword;
    if (!resolvedPassword && dateOfBirth) {
      const dob = new Date(dateOfBirth);
      const dd = String(dob.getDate()).padStart(2, "0");
      const mm = String(dob.getMonth() + 1).padStart(2, "0");
      const yyyy = dob.getFullYear();
      resolvedPassword = `${dd}${mm}${yyyy}`;
    }
    if (!resolvedPassword || resolvedPassword.length < 6) {
      return NextResponse.json(
        { error: "A password is required (or provide date of birth — DDMMYYYY will be used)." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Auto-generate username from name + random suffix if not provided
    let normalizedUsername = username
      ? username.toLowerCase().trim()
      : name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "") +
        "_" +
        Math.random().toString(36).slice(2, 6);

    // Check uniqueness
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: normalizedEmail }, { username: normalizedUsername }] },
    });

    if (existing) {
      if (existing.email === normalizedEmail) {
        return NextResponse.json({ error: "A student with this email already exists." }, { status: 409 });
      }
      // Username collision — append suffix
      normalizedUsername = normalizedUsername + "_" + Math.random().toString(36).slice(2, 5);
    }

    const passwordHash = await hashPassword(resolvedPassword);

    const student = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        username: normalizedUsername,
        passwordHash,
        emailVerified: false,
        mustChangePassword: true,
        role: "STUDENT",
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        studentClass: studentClass || undefined,
        gender: gender || undefined,
        avatarUrl: gender === "Male" ? "/images/avatar_male.jpg" : gender === "Female" ? "/images/avatar_female.jpg" : undefined,
      },
    });

    // Send welcome email with credentials
    if (sendEmail) {
      try {
        await sendWelcomeEmail(normalizedEmail, name, resolvedPassword);
      } catch (emailErr) {
        console.error("Failed to send welcome email:", emailErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        student: {
          id: student.id,
          name: student.name,
          email: student.email,
          username: student.username,
          mustChangePassword: true,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/admin/students]", err);
    return NextResponse.json({ error: "Failed to create student." }, { status: 500 });
  }
}
