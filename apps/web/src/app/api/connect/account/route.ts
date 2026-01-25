import { NextRequest, NextResponse } from "next/server";
import { createConnectAccount } from "@shiftly/payments";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Client Supabase avec service role pour les opérations backend
 */
function getSupabaseServiceRole() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Configuration Supabase manquante");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Crée un client Supabase pour authentification
 */
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
      headers: {
        Cookie: req.headers.get("cookie") || "",
      },
    },
  });
}

/**
 * POST /api/connect/account
 * Crée un compte Stripe Connect Express pour l'utilisateur authentifié
 * - Vérifie que l'utilisateur est un freelance ou commercial
 * - Crée le compte si nécessaire
 * - Sauvegarde l'ID dans le profil
 */
export async function POST(req: NextRequest) {
  console.log("📥 POST /api/connect/account");

  try {
    // Récupérer l'utilisateur authentifié
    const supabase = createServerSupabaseClient(req);
    const authHeader = req.headers.get("authorization");
    let user = null;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabase.auth.getUser(token);
      user = data?.user;
    }

    if (!user) {
      const { data } = await supabase.auth.getUser();
      user = data?.user;
    }

    if (!user) {
      return NextResponse.json(
        { error: "Vous devez être connecté" },
        { status: 401 }
      );
    }

    console.log(`👤 Utilisateur: ${user.id}`);

    // Récupérer le profil avec service role
    const supabaseService = getSupabaseServiceRole();
    const { data: profile, error: profileError } = await supabaseService
      .from("profiles")
      .select("id, email, role, stripe_account_id, connect_onboarding_status")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("❌ Profil introuvable:", profileError);
      return NextResponse.json(
        { error: "Profil introuvable" },
        { status: 404 }
      );
    }

    // Vérifier le rôle (freelance ou commercial)
    if (profile.role !== "freelance" && profile.role !== "commercial") {
      console.warn(`⚠️ Rôle non autorisé: ${profile.role}`);
      return NextResponse.json(
        { error: "Seuls les freelances et commerciaux peuvent créer un compte Connect" },
        { status: 403 }
      );
    }

    // Si le compte existe déjà, le retourner
    if (profile.stripe_account_id) {
      console.log(`ℹ️ Compte Connect existant: ${profile.stripe_account_id}`);
      return NextResponse.json({
        stripe_account_id: profile.stripe_account_id,
        connect_onboarding_status: profile.connect_onboarding_status,
        message: "Compte Connect existant",
      });
    }

    // Créer le compte Stripe Connect
    const { accountId } = await createConnectAccount({
      email: profile.email || user.email || "",
      country: "FR",
      businessType: "individual",
      metadata: {
        user_id: user.id,
        role: profile.role,
      },
    });

    // Sauvegarder l'ID dans le profil
    const { error: updateError } = await supabaseService
      .from("profiles")
      .update({
        stripe_account_id: accountId,
        connect_onboarding_status: "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("❌ Erreur lors de la mise à jour du profil:", updateError);
      return NextResponse.json(
        { error: "Erreur lors de la sauvegarde du compte" },
        { status: 500 }
      );
    }

    console.log(`✅ Compte Connect créé: ${accountId}`);

    return NextResponse.json({
      stripe_account_id: accountId,
      connect_onboarding_status: "pending",
      message: "Compte Connect créé avec succès",
    });
  } catch (error) {
    console.error("❌ Erreur lors de la création du compte Connect:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de la création du compte Connect",
      },
      { status: 500 }
    );
  }
}
