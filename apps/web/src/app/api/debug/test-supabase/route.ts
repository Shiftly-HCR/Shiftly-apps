import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Route de test pour vérifier la connexion Supabase avec service role
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      {
        error: "Variables manquantes",
        supabaseUrl: !!supabaseUrl,
        serviceRoleKey: !!serviceRoleKey,
      },
      { status: 400 }
    );
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Test simple : essayer de lire la table profiles (avec service role, ça devrait fonctionner)
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          serviceRoleKeyFormat: serviceRoleKey.substring(0, 20) + "...",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Connexion Supabase réussie avec service role",
      profilesCount: data?.length || 0,
      serviceRoleKeyFormat: serviceRoleKey.substring(0, 20) + "...",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
        serviceRoleKeyFormat: serviceRoleKey.substring(0, 20) + "...",
      },
      { status: 500 }
    );
  }
}

