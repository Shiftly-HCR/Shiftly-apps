"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Registration page is temporarily disabled until the app is ready.
 * Redirects to login. Restore original form when reopening signups.
 */
export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return null;
}
