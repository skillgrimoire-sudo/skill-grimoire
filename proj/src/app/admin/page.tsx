import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getAdminSecretKey, ADMIN_GATE_COOKIE } from "@/lib/admin-secret";
import { verifyJwt, SESSION_COOKIE } from "@/lib/auth";
import AdminLoginClient from "./AdminLoginClient";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;
  const gateCookie = cookieStore.get(ADMIN_GATE_COOKIE)?.value;
  const activeKey = await getAdminSecretKey();

  let isAuthorized = false;

  // 1. If user already has valid admin session JWT, they are authorized
  if (sessionToken) {
    const payload = await verifyJwt(sessionToken);
    if (payload?.role === "ADMIN") {
      isAuthorized = true;
    }
  }

  // 2. If valid secret key query parameter was passed
  let keyMatched = false;
  if (!isAuthorized && key && key.trim() === activeKey) {
    isAuthorized = true;
    keyMatched = true;
  }

  // 3. If gate cookie exists and matches the current active key
  if (!isAuthorized && gateCookie && decodeURIComponent(gateCookie).trim() === activeKey) {
    isAuthorized = true;
  }

  // If unauthorized, return 404 Not Found to completely hide the admin login surface
  if (!isAuthorized) {
    notFound();
  }

  return <AdminLoginClient activeKey={keyMatched || gateCookie ? activeKey : undefined} />;
}
