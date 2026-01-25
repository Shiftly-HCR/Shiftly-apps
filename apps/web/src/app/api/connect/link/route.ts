import { NextRequest, NextResponse } from "next/server";
import { createAccountLink, createConnectAccount } from "@shiftly/payments";
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
 * POST /api/connect/link
 * Crée un lien d'onboarding Stripe Connect pour l'utilisateur
 * - Crée le compte Connect s'il n'existe pas
 * - Retourne l'URL de redirection vers l'onboarding Stripe
 */
export async function POST(req: NextRequest) {
  console.log("📥 POST /api/connect/link");

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
        { error: "Seuls les freelances et commerciaux peuvent accéder à l'onboarding Connect" },
        { status: 403 }
      );
    }

    let stripeAccountId = profile.stripe_account_id;

    // Si pas de compte Connect, en créer un
    if (!stripeAccountId) {
      console.log("🔄 Création du compte Connect...");
      const { accountId } = await createConnectAccount({
        email: profile.email || user.email || "",
        country: "FR",
        businessType: "individual",
        metadata: {
          user_id: user.id,
          role: profile.role,
        },
      });

      stripeAccountId = accountId;

      // Sauvegarder l'ID dans le profil
      await supabaseService
        .from("profiles")
        .update({
          stripe_account_id: accountId,
          connect_onboarding_status: "pending",
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      console.log(`✅ Compte Connect créé: ${accountId}`);
    }

    // Configurer les URLs de retour
    const origin = req.headers.get("origin") ?? req.nextUrl.origin;
    const returnUrl =
      process.env.STRIPE_CONNECT_RETURN_URL ||
      `${origin}/settings/payments?status=success`;
    const refreshUrl =
      process.env.STRIPE_CONNECT_REFRESH_URL ||
      `${origin}/settings/payments?status=refresh`;

    // Créer le lien d'onboarding
    const { url } = await createAccountLink({
      accountId: stripeAccountId,
      returnUrl,
      refreshUrl,
      type: "account_onboarding",
    });

    console.log(`✅ Lien onboarding créé pour ${stripeAccountId}`);

    return NextResponse.json({
      url,
      stripe_account_id: stripeAccountId,
    });
  } catch (error) {
    console.error("❌ Erreur lors de la création du lien onboarding:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de la création du lien onboarding",
      },
      { status: 500 }
    );
  }
}
