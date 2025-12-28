import { NextRequest, NextResponse } from "next/server";
import { getStripeClient } from "@shiftly/payments";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Crée un client Supabase côté serveur qui utilise les cookies pour l'authentification
 * Note: Supabase stocke les tokens dans des cookies avec un préfixe basé sur l'URL du projet
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

  // Créer un client qui peut lire les cookies de la requête
  const cookieStore = cookies();
  
  // Supabase stocke les cookies avec des noms spécifiques
  // On crée un client avec les headers de la requête pour passer les cookies
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        // Passer les cookies de la requête
        Cookie: req.headers.get("cookie") || "",
      },
    },
  });

  return client;
}

/**
 * Endpoint pour créer une session Stripe Billing Portal
 * Permet aux utilisateurs de gérer leur abonnement (changer de plan, mettre à jour la carte, annuler, etc.)
 *
 * Utilisation côté client:
 *   const response = await fetch('/api/payments/portal', { 
 *     method: 'POST',
 *     credentials: 'include' 
 *   });
 *   const { url } = await response.json();
 *   window.location.href = url;
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(req);

    // Récupérer l'utilisateur depuis la session
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      // Si l'authentification via cookies ne fonctionne pas, essayer via header Authorization
      const authHeader = req.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.replace("Bearer ", "");
        const { data: userData, error: tokenError } = await supabase.auth.getUser(token);
        
        if (tokenError || !userData.user) {
          return NextResponse.json(
            { error: "Utilisateur non authentifié" },
            { status: 401 }
          );
        }

        // Utiliser service role pour récupérer le profil (bypass RLS)
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;
        if (!serviceRoleKey) {
          return NextResponse.json(
            { error: "Configuration serveur manquante" },
            { status: 500 }
          );
        }

        const serviceSupabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || "",
          serviceRoleKey,
          {
            auth: { autoRefreshToken: false, persistSession: false },
          }
        );

        const { data: profile, error: profileError } = await serviceSupabase
          .from("profiles")
          .select("stripe_customer_id")
          .eq("id", userData.user.id)
          .single();

        if (profileError || !profile) {
          return NextResponse.json(
            { error: "Profil introuvable" },
            { status: 404 }
          );
        }

        if (!profile.stripe_customer_id) {
          return NextResponse.json(
            { error: "Aucun abonnement actif. Veuillez d'abord vous abonner." },
            { status: 400 }
          );
        }

        const stripe = getStripeClient();
        const origin = req.headers.get("origin") ?? req.nextUrl.origin;
        const returnUrl = `${origin}/subscription`;

        const portalSession = await stripe.billingPortal.sessions.create({
          customer: profile.stripe_customer_id,
          return_url: returnUrl,
        });

        return NextResponse.json({ url: portalSession.url });
      }

      return NextResponse.json(
        { error: "Utilisateur non authentifié" },
        { status: 401 }
      );
    }

    // Récupérer le profil (RLS permettra à l'utilisateur de lire son propre profil)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Profil introuvable" },
        { status: 404 }
      );
    }

    if (!profile.stripe_customer_id) {
      return NextResponse.json(
        { error: "Aucun abonnement actif. Veuillez d'abord vous abonner." },
        { status: 400 }
      );
    }

    // Créer une session Billing Portal
    const stripe = getStripeClient();
    const origin = req.headers.get("origin") ?? req.nextUrl.origin;
    const returnUrl = `${origin}/subscription`;

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Erreur lors de la création de la session Billing Portal:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de la création de la session de gestion",
      },
      { status: 500 }
    );
  }
}

