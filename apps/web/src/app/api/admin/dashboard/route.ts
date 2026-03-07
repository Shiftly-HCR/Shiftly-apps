import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type {
  AdminDashboardResponse,
  RecruiterDashboardRow,
  EstablishmentDashboardRow,
} from "@/types/adminDashboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSupabaseServiceRole() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Configuration Supabase manquante");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function createServerSupabaseClient(req: NextRequest) {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "";

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Configuration Supabase manquante");
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: { Cookie: req.headers.get("cookie") || "" },
    },
  });
}

function normalizeCount(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

interface RecruiterDashboardRawRow {
  recruiter_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  is_premium: boolean | null;
  establishments_count: number | string | null;
  missions_count: number | string | null;
}

interface EstablishmentDashboardRawRow {
  establishment_id: string;
  name: string | null;
  city: string | null;
  postal_code: string | null;
  recruiter_id: string | null;
  recruiter_first_name: string | null;
  recruiter_last_name: string | null;
  recruiter_email: string | null;
  commercial_id: string | null;
  commercial_first_name: string | null;
  commercial_last_name: string | null;
  commercial_email: string | null;
  missions_count: number | string | null;
}

export async function GET(req: NextRequest) {
  try {
    const supabaseAnon = createServerSupabaseClient(req);
    const authHeader = req.headers.get("authorization");
    let user = null;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseAnon.auth.getUser(token);
      user = data?.user;
    }

    if (!user) {
      const { data } = await supabaseAnon.auth.getUser();
      user = data?.user;
    }

    if (!user) {
      return NextResponse.json(
        { error: "Vous devez etre connecte" },
        { status: 401 },
      );
    }

    const supabase = getSupabaseServiceRole();

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
    }

    if (profile.role !== "admin") {
      return NextResponse.json(
        { error: "Acces reserve aux administrateurs" },
        { status: 403 },
      );
    }

    const [
      { data: recruitersRaw, error: recruitersError },
      { data: establishmentsRaw, error: establishmentsError },
    ] = await Promise.all([
      supabase
        .from("admin_dashboard_recruiters_v")
        .select("*")
        .order("missions_count", { ascending: false }),
      supabase
        .from("admin_dashboard_establishments_v")
        .select("*")
        .order("missions_count", { ascending: false }),
    ]);

    if (recruitersError) {
      console.error("Erreur lecture vue recruiters:", recruitersError);
      return NextResponse.json(
        { error: "Erreur lors de la lecture des recruiters" },
        { status: 500 },
      );
    }

    if (establishmentsError) {
      console.error("Erreur lecture vue establishments:", establishmentsError);
      return NextResponse.json(
        { error: "Erreur lors de la lecture des etablissements" },
        { status: 500 },
      );
    }

    const recruitersRows = (recruitersRaw || []) as RecruiterDashboardRawRow[];
    const recruiters: RecruiterDashboardRow[] = recruitersRows.map((row) => ({
        recruiter_id: row.recruiter_id,
        first_name: row.first_name ?? null,
        last_name: row.last_name ?? null,
        email: row.email ?? null,
        is_premium: row.is_premium ?? false,
        establishments_count: normalizeCount(row.establishments_count),
        missions_count: normalizeCount(row.missions_count),
      }));

    const establishmentsRows = (establishmentsRaw ||
      []) as EstablishmentDashboardRawRow[];
    const establishments: EstablishmentDashboardRow[] = establishmentsRows.map(
      (row) => ({
      establishment_id: row.establishment_id,
      name: row.name ?? "Etablissement sans nom",
      city: row.city ?? null,
      postal_code: row.postal_code ?? null,
      recruiter_id: row.recruiter_id ?? null,
      recruiter_first_name: row.recruiter_first_name ?? null,
      recruiter_last_name: row.recruiter_last_name ?? null,
      recruiter_email: row.recruiter_email ?? null,
      commercial_id: row.commercial_id ?? null,
      commercial_first_name: row.commercial_first_name ?? null,
      commercial_last_name: row.commercial_last_name ?? null,
      commercial_email: row.commercial_email ?? null,
      missions_count: normalizeCount(row.missions_count),
      }),
    );

    const payload: AdminDashboardResponse = { recruiters, establishments };
    return NextResponse.json(payload);
  } catch (error) {
    console.error("Erreur API admin dashboard:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}
