import { NextRequest, NextResponse } from "next/server";
import { createMissionCheckoutSession } from "@shiftly/payments";
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
 * Calcule le montant à payer en centimes pour une mission
 */
function calculateMissionAmount(mission: {
  total_salary?: number | null;
  daily_rate?: number | null;
  hourly_rate?: number | null;
  start_date?: string | null;
  end_date?: string | null;
}): number {
  // Priorité 1: total_salary (déjà en euros, convertir en centimes)
  if (mission.total_salary && mission.total_salary > 0) {
    return Math.round(mission.total_salary * 100);
  }

  // Priorité 2: daily_rate × nombre de jours
  if (mission.daily_rate && mission.daily_rate > 0 && mission.start_date && mission.end_date) {
    const startDate = new Date(mission.start_date);
    const endDate = new Date(mission.end_date);
    const days = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    return Math.round(mission.daily_rate * days * 100);
  }

  // Priorité 3: hourly_rate × 8h × nombre de jours (estimation)
  if (mission.hourly_rate && mission.hourly_rate > 0 && mission.start_date && mission.end_date) {
    const startDate = new Date(mission.start_date);
    const endDate = new Date(mission.end_date);
    const days = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    const hoursPerDay = 8;
    return Math.round(mission.hourly_rate * hoursPerDay * days * 100);
  }

  // Fallback: daily_rate seul (1 jour)
  if (mission.daily_rate && mission.daily_rate > 0) {
    return Math.round(mission.daily_rate * 100);
  }

  return 0;
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/missions/[id]/checkout
 * Crée une session de checkout Stripe pour payer une mission
 * - Vérifie que l'utilisateur est le recruteur de la mission
 * - Calcule le montant à payer
 * - Crée la session Stripe Checkout
 * - Crée un enregistrement mission_payments en status pending
 */
export async function POST(req: NextRequest, context: RouteContext) {
  const { id: missionId } = await context.params;
  console.log(`📥 POST /api/missions/${missionId}/checkout`);

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

    console.log(`👤 Recruteur: ${user.id}`);

    const supabaseService = getSupabaseServiceRole();

    // Récupérer la mission avec l'établissement
    const { data: mission, error: missionError } = await supabaseService
      .from("missions")
      .select(`
        id,
        title,
        recruiter_id,
        establishment_id,
        total_salary,
        daily_rate,
        hourly_rate,
        start_date,
        end_date,
        status
      `)
      .eq("id", missionId)
      .single();

    if (missionError || !mission) {
      console.error("❌ Mission introuvable:", missionError);
      return NextResponse.json(
        { error: "Mission introuvable" },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est le recruteur
    if (mission.recruiter_id !== user.id) {
      console.warn(`⚠️ Utilisateur ${user.id} n'est pas le recruteur de la mission`);
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à payer cette mission" },
        { status: 403 }
      );
    }

    // Vérifier qu'il n'y a pas déjà un paiement en cours ou complété
    const { data: existingPayment } = await supabaseService
      .from("mission_payments")
      .select("id, status")
      .eq("mission_id", missionId)
      .in("status", ["pending", "paid"])
      .single();

    if (existingPayment) {
      if (existingPayment.status === "paid") {
        return NextResponse.json(
          { error: "Cette mission a déjà été payée" },
          { status: 400 }
        );
      }
      // Si pending, on pourrait retourner l'ancienne session ou en créer une nouvelle
      // Pour simplifier, on crée une nouvelle session
    }

    // Calculer le montant
    const amount = calculateMissionAmount(mission);
    if (amount <= 0) {
      return NextResponse.json(
        { error: "Impossible de calculer le montant de la mission. Vérifiez les tarifs." },
        { status: 400 }
      );
    }

    console.log(`💰 Montant calculé: ${amount} centimes (${amount / 100} EUR)`);

    // Récupérer le profil du recruteur pour le customer_id
    const { data: recruiterProfile } = await supabaseService
      .from("profiles")
      .select("stripe_customer_id, email")
      .eq("id", user.id)
      .single();

    // Configurer les URLs
    const origin = req.headers.get("origin") ?? req.nextUrl.origin;
    const successUrl =
      process.env.STRIPE_CHECKOUT_SUCCESS_URL ||
      `${origin}/missions/${missionId}?payment=success`;
    const cancelUrl =
      process.env.STRIPE_CHECKOUT_CANCEL_URL ||
      `${origin}/missions/${missionId}?payment=cancelled`;

    // Créer la session Stripe Checkout
    const { url, sessionId } = await createMissionCheckoutSession({
      amount,
      currency: "eur",
      missionId,
      missionTitle: mission.title,
      recruiterId: user.id,
      establishmentId: mission.establishment_id || undefined,
      successUrl,
      cancelUrl,
      customerEmail: recruiterProfile?.email || user.email || undefined,
      customerId: recruiterProfile?.stripe_customer_id || undefined,
    });

    // Créer l'enregistrement mission_payments
    const { error: paymentError } = await supabaseService
      .from("mission_payments")
      .insert({
        mission_id: missionId,
        recruiter_id: user.id,
        amount,
        currency: "eur",
        status: "pending",
        stripe_checkout_session_id: sessionId,
      });

    if (paymentError) {
      console.error("❌ Erreur lors de la création du paiement:", paymentError);
      // On continue quand même car la session Stripe est créée
    }

    console.log(`✅ Session checkout créée: ${sessionId}`);

    return NextResponse.json({
      url,
      session_id: sessionId,
      amount,
    });
  } catch (error) {
    console.error("❌ Erreur lors de la création du checkout:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de la création du checkout",
      },
      { status: 500 }
    );
  }
}
