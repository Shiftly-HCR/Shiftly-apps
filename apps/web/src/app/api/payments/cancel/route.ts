import { NextRequest, NextResponse } from "next/server";
import { getStripeClient } from "@shiftly/payments";
import { createClient } from "@supabase/supabase-js";
import { trackServerEvent } from "@/analytics/server";
import { ANALYTICS_EVENTS } from "@/analytics/events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Crée un client Supabase côté serveur pour récupérer l'utilisateur
 */
function createServerSupabaseClient(req: NextRequest) {
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
      headers: {
        Cookie: req.headers.get("cookie") || "",
      },
    },
  });

  return client;
}

/**
 * Client Supabase "admin" (service role) côté serveur, pour les requêtes DB.
 * Permet d'éviter les 404/erreurs liés au RLS quand on lit/écrit en API.
 */
function createAdminSupabaseClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE ||
    "";

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Configuration Supabase manquante (SUPABASE_SERVICE_ROLE_KEY requis côté serveur)"
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

/**
 * Endpoint pour annuler un abonnement Stripe
 * Met cancel_at_period_end = true pour arrêter la facturation à la fin de la période actuelle
 */
export async function POST(req: NextRequest) {
  const requestId = req.headers.get("x-request-id") || crypto.randomUUID();
  const endpoint = "/api/payments/cancel";
  try {
    const supabaseAuth = createServerSupabaseClient(req);

    // Récupérer l'utilisateur depuis la session
    const authHeader = req.headers.get("authorization");
    let user = null;

    // Si on a un token dans les headers, l'utiliser
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      try {
        const {
          data: { user: authUser },
        } = await supabaseAuth.auth.getUser(token);
        user = authUser;
      } catch (err) {
        console.error(
          "Erreur lors de la récupération de l'utilisateur avec token:",
          err
        );
      }
    }

    // Sinon, essayer avec les cookies
    if (!user) {
      try {
        const {
          data: { user: authUser },
        } = await supabaseAuth.auth.getUser();
        user = authUser;
      } catch (err) {
        console.error("Erreur lors de la récupération de l'utilisateur:", err);
      }
    }

    // Si getUser() échoue, essayer getSession()
    if (!user) {
      try {
        const {
          data: { session },
        } = await supabaseAuth.auth.getSession();
        user = session?.user || null;
      } catch (err) {
        console.error("Erreur lors de la récupération de la session:", err);
      }
    }

    if (!user) {
      trackServerEvent({
        event: ANALYTICS_EVENTS.apiRequestFailed,
        properties: {
          endpoint,
          request_id: requestId,
          status_code: 401,
          error_code: "unauthenticated",
        },
      });
      return NextResponse.json(
        { error: "Vous devez être connecté" },
        { status: 401 }
      );
    }

    console.log("✅ Utilisateur authentifié pour annulation:", user.id);

    // Client admin pour les requêtes DB (bypass RLS)
    const supabaseAdmin = createAdminSupabaseClient();

    // Récupérer le profil pour obtenir le stripe_subscription_id
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("stripe_subscription_id, stripe_customer_id, subscription_status")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("Erreur lors de la récupération du profil:", profileError);
      trackServerEvent({
        event: ANALYTICS_EVENTS.apiRequestFailed,
        distinctId: user.id,
        properties: {
          endpoint,
          request_id: requestId,
          status_code: 404,
          error_code: "profile_not_found",
          user_id: user.id,
        },
      });
      return NextResponse.json(
        {
          error: "Profil introuvable",
          code: "PROFILE_NOT_FOUND",
          details: profileError?.message ?? null,
        },
        { status: 404 }
      );
    }

    console.log("📋 Profil récupéré:", {
      stripe_subscription_id: profile.stripe_subscription_id,
      stripe_customer_id: profile.stripe_customer_id,
      subscription_status: profile.subscription_status,
    });

    if (!profile.stripe_subscription_id) {
      console.warn("⚠️ Aucun stripe_subscription_id trouvé dans le profil");
      trackServerEvent({
        event: ANALYTICS_EVENTS.apiRequestFailed,
        distinctId: user.id,
        properties: {
          endpoint,
          request_id: requestId,
          status_code: 404,
          error_code: "subscription_id_missing",
          user_id: user.id,
        },
      });
      return NextResponse.json(
        {
          error: "Aucun abonnement actif trouvé",
          code: "SUBSCRIPTION_ID_MISSING",
        },
        { status: 404 }
      );
    }

    // Annuler l'abonnement via l'API Stripe (cancel_at_period_end = true)
    const stripe = getStripeClient();

    try {
      const subscription = await stripe.subscriptions.update(
        profile.stripe_subscription_id,
        {
          cancel_at_period_end: true,
        }
      );

      console.log("Abonnement annulé (fin de période):", subscription.id);

      // Le webhook customer.subscription.updated mettra à jour la base de données
      // On retourne immédiatement pour une meilleure UX
      trackServerEvent({
        event: ANALYTICS_EVENTS.apiRequestSuccess,
        distinctId: user.id,
        properties: {
          endpoint,
          request_id: requestId,
          status_code: 200,
          user_id: user.id,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Votre abonnement sera annulé à la fin de la période actuelle",
        cancel_at_period_end: subscription.cancel_at_period_end,
        current_period_end: new Date(
          subscription.current_period_end * 1000
        ).toISOString(),
      });
    } catch (stripeError: any) {
      console.error("Erreur Stripe lors de l'annulation:", stripeError);

      // Si l'abonnement n'existe pas dans Stripe, retourner 404
      if (stripeError?.code === "resource_missing") {
        trackServerEvent({
          event: ANALYTICS_EVENTS.apiRequestFailed,
          distinctId: user.id,
          properties: {
            endpoint,
            request_id: requestId,
            status_code: 404,
            error_code: "stripe_resource_missing",
            user_id: user.id,
          },
        });
        return NextResponse.json(
          {
            error: "Abonnement introuvable dans Stripe",
            code: "STRIPE_RESOURCE_MISSING",
          },
          { status: 404 }
        );
      }

      // Pour les autres erreurs Stripe, retourner 400 (requête invalide)
      trackServerEvent({
        event: ANALYTICS_EVENTS.apiRequestFailed,
        distinctId: user.id,
        properties: {
          endpoint,
          request_id: requestId,
          status_code: 400,
          error_code: stripeError?.code || "stripe_error",
          user_id: user.id,
        },
      });
      return NextResponse.json(
        {
          error:
            stripeError?.message ||
            "Erreur lors de l'annulation de l'abonnement",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Erreur lors de l'annulation de l'abonnement:", error);
    trackServerEvent({
      event: ANALYTICS_EVENTS.apiRequestFailed,
      properties: {
        endpoint,
        request_id: requestId,
        status_code: 500,
        error_code: "exception",
      },
    });
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de l'annulation de l'abonnement",
      },
      { status: 500 }
    );
  }
}
