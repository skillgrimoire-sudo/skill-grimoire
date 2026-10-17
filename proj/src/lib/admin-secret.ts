import { prisma } from "@/lib/prisma";
import { DEFAULT_ADMIN_SECRET_FALLBACK, ADMIN_GATE_COOKIE } from "@/lib/admin-constants";
export { DEFAULT_ADMIN_SECRET_FALLBACK, ADMIN_GATE_COOKIE };

/**
 * Retrieves the currently active admin secret key.
 * Checks the database first; falls back to process.env.ADMIN_SECRET_KEY or default.
 */
export async function getAdminSecretKey(): Promise<string> {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "admin_secret_key" },
    });
    if (setting && setting.value) {
      return setting.value.trim();
    }
  } catch (err) {
    console.error("[getAdminSecretKey] Error fetching setting from DB, using fallback:", err);
  }

  return (process.env.ADMIN_SECRET_KEY || DEFAULT_ADMIN_SECRET_FALLBACK).trim();
}

/**
 * Updates the admin secret key in the database.
 */
export async function setAdminSecretKey(newKey: string): Promise<string> {
  const trimmed = newKey.trim();
  if (!trimmed || trimmed.length < 6) {
    throw new Error("Secret key must be at least 6 characters long.");
  }

  await prisma.systemSetting.upsert({
    where: { key: "admin_secret_key" },
    update: { value: trimmed },
    create: { key: "admin_secret_key", value: trimmed },
  });

  return trimmed;
}
