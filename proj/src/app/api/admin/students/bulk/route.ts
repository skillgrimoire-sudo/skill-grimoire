import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-auth";
import { sendWelcomeEmail } from "@/lib/email";

/**
 * POST /api/admin/students/bulk
 * Body: { students: Array<{ name, email, studentClass, dateOfBirth, username? }>, sendEmail?: boolean }
 * Returns: { success, created, skipped, errors }
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const { students, sendEmail = true } = body as {
      students: {
        name: string;
        email: string;
        studentClass?: string;
        dateOfBirth?: string;
        username?: string;
        gender?: string;
      }[];
      sendEmail?: boolean;
    };

    if (!Array.isArray(students) || students.length === 0) {
      return NextResponse.json({ error: "No students provided." }, { status: 400 });
    }

    let created = 0;
    let skipped = 0;
    const errors: { row: number; name: string; email: string; reason: string }[] = [];
    const emailPromises: Promise<unknown>[] = [];

    for (let i = 0; i < students.length; i++) {
      const { name, email, studentClass, dateOfBirth, username, gender } = students[i];

      if (!name || !email) {
        errors.push({ row: i + 1, name: name || "", email: email || "", reason: "Name and email are required." });
        continue;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push({ row: i + 1, name, email, reason: "Invalid email address." });
        continue;
      }

      let resolvedPassword: string | undefined;
      if (dateOfBirth) {
        const match = String(dateOfBirth).match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (match) {
          resolvedPassword = `${match[3]}${match[2]}${match[1]}`;
        } else {
          const dob = new Date(dateOfBirth);
          if (!isNaN(dob.getTime())) {
            const dd = String(dob.getDate()).padStart(2, "0");
            const mm = String(dob.getMonth() + 1).padStart(2, "0");
            const yyyy = dob.getFullYear();
            resolvedPassword = `${dd}${mm}${yyyy}`;
          }
        }
      }

      if (!resolvedPassword) {
        errors.push({ row: i + 1, name, email, reason: "A valid date of birth is required to set password." });
        continue;
      }

      const normalizedEmail = email.toLowerCase().trim();

      let normalizedUsername = username
        ? username.toLowerCase().trim()
        : name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "") +
          "_" +
          Math.random().toString(36).slice(2, 6);

      const existingEmail = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (existingEmail) {
        skipped++;
        continue;
      }

      const existingUsername = await prisma.user.findUnique({ where: { username: normalizedUsername } });
      if (existingUsername) {
        normalizedUsername = normalizedUsername + "_" + Math.random().toString(36).slice(2, 5);
      }

      try {
        const passwordHash = await hashPassword(resolvedPassword);
        await prisma.user.create({
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
        created++;

        if (sendEmail) {
          emailPromises.push(
            sendWelcomeEmail(normalizedEmail, name, resolvedPassword).catch((emailErr) => {
              console.error(`Failed to send welcome email to ${normalizedEmail}:`, emailErr);
            })
          );
        }
      } catch {
        errors.push({ row: i + 1, name, email, reason: "Database error - possibly duplicate entry." });
      }
    }

    if (emailPromises.length > 0) {
      await Promise.allSettled(emailPromises);
    }

    return NextResponse.json({ success: true, created, skipped, errors });
  } catch (err) {
    console.error("[POST /api/admin/students/bulk]", err);
    return NextResponse.json({ error: "Failed to process bulk import." }, { status: 500 });
  }
}
