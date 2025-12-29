import { NextRequest, NextResponse } from "next/server";
import { getStripeClient } from "@shiftly/payments";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Crée un client Supabase côté serveur pour récupérer l'utilisateur
 */
function createServerSupabaseClient(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
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
 * Endpoint pour annuler un abonnement Stripe
 * Met cancel_at_period_end = true pour arrêter la facturation à la fin de la période actuelle
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(req);

    // Récupérer l'utilisateur depuis la session
    const authHeader = req.headers.get("authorization");
    let user = null;

    // Si on a un token dans les headers, l'utiliser
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser(token);
        user = authUser;
      } catch (err) {
        console.error("Erreur lors de la récupération de l'utilisateur avec token:", err);
      }
    }

    // Sinon, essayer avec les cookies
    if (!user) {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
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
        } = await supabase.auth.getSession();
        user = session?.user || null;
      } catch (err) {
        console.error("Erreur lors de la récupération de la session:", err);
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: "Vous devez être connecté" },
        { status: 401 }
      );
    }

    console.log("✅ Utilisateur authentifié pour annulation:", user.id);

    // Récupérer le profil pour obtenir le stripe_subscription_id
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_subscription_id")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Erreur lors de la récupération du profil:", profileError);
      return NextResponse.json(
        { error: "Erreur lors de la récupération du profil" },
        { status: 500 }
      );
    }

    if (!profile?.stripe_subscription_id) {
      return NextResponse.json(
        { error: "Aucun abonnement actif trouvé" },
        { status: 400 }
      );
    }

    // Annuler l'abonnement via l'API Stripe (cancel_at_period_end = true)
    const stripe = getStripeClient();
    const subscription = await stripe.subscriptions.update(
      profile.stripe_subscription_id,
      {
        cancel_at_period_end: true,
      }
    );

    console.log("Abonnement annulé (fin de période):", subscription.id);

    // Le webhook customer.subscription.updated mettra à jour la base de données
    // On retourne immédiatement pour une meilleure UX

    return NextResponse.json({
      success: true,
      message: "Votre abonnement sera annulé à la fin de la période actuelle",
      cancel_at_period_end: subscription.cancel_at_period_end,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    });
  } catch (error) {
    console.error("Erreur lors de l'annulation de l'abonnement:", error);
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

