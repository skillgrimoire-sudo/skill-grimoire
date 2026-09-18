import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-auth";

/**
 * PUT /api/admin/students/[id] — Update student
 * DELETE /api/admin/students/[id] — Delete student
 */

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, username, studentClass, gender, dateOfBirth, newPassword, resetPassword } = body as {
      name?: string;
      email?: string;
      username?: string;
      studentClass?: string;
      gender?: string;
      dateOfBirth?: string;
      newPassword?: string;
      resetPassword?: boolean;
    };

    const updateData: Record<string, unknown> = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase().trim();
    if (username) updateData.username = username.toLowerCase().trim();
    if (studentClass !== undefined) updateData.studentClass = studentClass;
    if (dateOfBirth !== undefined) {
      updateData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    }
    if (gender !== undefined) {
      updateData.gender = gender;
      if (gender === "Male") {
        updateData.avatarUrl = "/images/avatar_male.jpg";
      } else if (gender === "Female") {
        updateData.avatarUrl = "/images/avatar_female.jpg";
      } else {
        updateData.avatarUrl = null;
      }
    }
    if (newPassword) {
      updateData.passwordHash = await hashPassword(newPassword);
      updateData.mustChangePassword = true; // Force student to change again
    }
    if (resetPassword) {
      updateData.mustChangePassword = true;
      updateData.emailVerified = false;
    }

    const student = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        dateOfBirth: true,
        mustChangePassword: true,
        emailVerified: true,
      },
    });

    return NextResponse.json({ success: true, student });
  } catch (err) {
    console.error("[PUT /api/admin/students/[id]]", err);
    return NextResponse.json({ error: "Failed to update student." }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Student deleted." });
  } catch (err) {
    console.error("[DELETE /api/admin/students/[id]]", err);
    return NextResponse.json({ error: "Failed to delete student." }, { status: 500 });
  }
}
