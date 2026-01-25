import { NextRequest, NextResponse } from "next/server";
import {
  createCheckoutSession,
  subscriptionPlansById,
  type SubscriptionPlanId,
} from "@shiftly/payments";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Crée un client Supabase côté serveur pour récupérer l'utilisateur
 * Utilise les cookies de Next.js ou un token depuis les headers
 */
function createServerSupabaseClient(req?: NextRequest) {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_API_KEY ||
    "";

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Configuration Supabase manquante");
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: req
        ? {
            Cookie: req.headers.get("cookie") || "",
          }
        : {},
    },
  });

  return client;
}

/**
 * Endpoint pour créer une session de checkout Stripe
 * Récupère automatiquement l'utilisateur connecté pour l'associer à la session
 */
export async function POST(req: NextRequest) {
  console.log("📥 Requête POST /api/payments/checkout reçue");

  try {
    const body = await req.json().catch((err) => {
      console.error("Erreur lors du parsing du body:", err);
      return null;
    });

    console.log("Body parsé:", body);

    const planId = body?.planId as SubscriptionPlanId | undefined;
    const customerEmail = body?.customerEmail as string | undefined;

    if (!planId || !subscriptionPlansById[planId]) {
      console.error("Plan invalide:", planId);
      return NextResponse.json(
        { error: "Plan d'abonnement invalide" },
        { status: 400 }
      );
    }

    console.log("Plan valide:", planId);

    // Récupérer l'utilisateur connecté
    // Essayer d'abord via header Authorization, puis via cookies
    const authHeader = req.headers.get("authorization");
    let user = null;
    let userError = null;

    const supabase = createServerSupabaseClient(req);

    // Si on a un token dans les headers, l'utiliser
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      try {
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser(token);
        user = authUser;
        userError = authError;
      } catch (err) {
        console.error(
          "Erreur lors de la récupération de l'utilisateur avec token:",
          err
        );
      }
    }

    // Si pas de token ou échec, essayer avec les cookies (getUser sans token)
    if (!user) {
      try {
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();
        user = authUser;
        userError = authError;
      } catch (err) {
        console.error("Erreur lors de la récupération de l'utilisateur:", err);
        userError = err as Error;
      }
    }

    // Si getUser() échoue, essayer getSession()
    if (!user) {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (!sessionError && session?.user) {
          user = session.user;
          console.log("✅ Utilisateur récupéré via getSession():", user.id);
        }
      } catch (err) {
        console.error("Erreur lors de la récupération de la session:", err);
      }
    }

    if (!user) {
      console.error("❌ Utilisateur non authentifié.");
      console.error(
        "Cookies reçus:",
        req.headers.get("cookie") ? "Oui" : "Non"
      );
      console.error("Auth header:", authHeader ? "Oui" : "Non");
      return NextResponse.json(
        { error: "Vous devez être connecté pour vous abonner" },
        { status: 401 }
      );
    }

    console.log("✅ Utilisateur authentifié:", user.id);

    // Si on a un customer_id existant, l'utiliser
    let customerId: string | undefined;
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle(); // Utiliser maybeSingle() pour ne pas erreur si le profil n'existe pas

    if (profileError && profileError.code !== "PGRST116") {
      // PGRST116 = not found, c'est OK (le profil sera créé par le trigger)
      console.warn("Erreur lors de la récupération du profil:", profileError);
    }

    if (profile?.stripe_customer_id) {
      customerId = profile.stripe_customer_id;
      console.log("Customer ID existant trouvé:", customerId);
    } else {
      console.log(
        "Aucun customer ID existant, un nouveau sera créé par Stripe"
      );
    }

    const origin = req.headers.get("origin") ?? req.nextUrl.origin;
    const successUrl = `${origin}/subscription?status=success&plan=${planId}`;
    const cancelUrl = `${origin}/subscription?status=cancelled&plan=${planId}`;

    console.log("Création de la session Stripe...");
    console.log("Plan:", planId);
    console.log("Success URL:", successUrl);

    // Créer la session avec userId dans les metadata pour les webhooks
    const { url } = await createCheckoutSession({
      planId,
      successUrl,
      cancelUrl,
      customerEmail: customerEmail || user.email || undefined,
      customerId: customerId,
      userId: user.id, // Important: pour lier l'utilisateur dans les webhooks
    });

    if (!url) {
      console.error("❌ Aucune URL retournée par createCheckoutSession");
      return NextResponse.json(
        { error: "Impossible de générer l'URL de paiement Stripe" },
        { status: 500 }
      );
    }

    console.log("✅ Session Stripe créée avec succès, URL:", url);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("❌ Erreur lors de la création de la session Stripe:", error);
    console.error("Stack trace:", error instanceof Error ? error.stack : "N/A");
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Impossible de créer la session de paiement",
      },
      { status: 500 }
    );
  }
}
