import type { AdminDashboardResponse } from "@/types/adminDashboard";
import { supabase } from "@shiftly/data";

export async function getAdminDashboardData(): Promise<AdminDashboardResponse> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch("/api/admin/dashboard", {
    method: "GET",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    let message = "Erreur lors du chargement du dashboard admin";

    try {
      const body = (await response.json()) as { error?: string };
      if (body?.error) {
        message = body.error;
      }
    } catch {
      // Garder le message par défaut si le body n'est pas un JSON valide
    }

    throw new Error(message);
  }

  return (await response.json()) as AdminDashboardResponse;
}
