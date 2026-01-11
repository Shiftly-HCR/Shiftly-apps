import { NextRequest, NextResponse } from "next/server";
import { createTransfer, calculateFundDistribution } from "@shiftly/payments";
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

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/missions/[id]/release
 * Libère les fonds vers le freelance et le commercial (si applicable)
 * - Vérifie que le paiement est complété
 * - Vérifie que les comptes Connect sont actifs
 * - Crée les transferts Stripe
 * - Enregistre les transfers dans mission_transfers
 */
export async function POST(req: NextRequest, context: RouteContext) {
  const { id: missionId } = await context.params;
  console.log(`📥 POST /api/missions/${missionId}/release`);

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

    const supabaseService = getSupabaseServiceRole();

    // Récupérer le profil pour vérifier si admin ou recruteur
    const { data: userProfile } = await supabaseService
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // Récupérer la mission avec les informations nécessaires
    const { data: mission, error: missionError } = await supabaseService
      .from("missions")
      .select(`
        id,
        title,
        recruiter_id,
        establishment_id
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

    // Vérifier les permissions (admin ou recruteur de la mission)
    const isAdmin = userProfile?.role === "admin";
    const isRecruiter = mission.recruiter_id === user.id;

    if (!isAdmin && !isRecruiter) {
      console.warn(`⚠️ Utilisateur ${user.id} non autorisé`);
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à libérer les fonds de cette mission" },
        { status: 403 }
      );
    }

    // Récupérer le paiement complété
    const { data: payment, error: paymentError } = await supabaseService
      .from("mission_payments")
      .select("*")
      .eq("mission_id", missionId)
      .eq("status", "paid")
      .single();

    if (paymentError || !payment) {
      console.error("❌ Aucun paiement complété trouvé");
      return NextResponse.json(
        { error: "Aucun paiement complété trouvé pour cette mission" },
        { status: 400 }
      );
    }

    // Récupérer les informations financières
    const { data: finance, error: financeError } = await supabaseService
      .from("mission_finance")
      .select("*")
      .eq("mission_payment_id", payment.id)
      .single();

    if (financeError || !finance) {
      console.error("❌ Informations financières introuvables");
      return NextResponse.json(
        { error: "Informations financières introuvables" },
        { status: 400 }
      );
    }

    // Vérifier si les fonds ont déjà été libérés
    if (finance.status === "funds_released") {
      return NextResponse.json(
        { error: "Les fonds ont déjà été libérés" },
        { status: 400 }
      );
    }

    // Récupérer le freelance assigné à la mission
    // On cherche l'application acceptée
    const { data: acceptedApplication } = await supabaseService
      .from("mission_applications")
      .select("user_id")
      .eq("mission_id", missionId)
      .eq("status", "accepted")
      .single();

    if (!acceptedApplication) {
      return NextResponse.json(
        { error: "Aucun freelance accepté pour cette mission" },
        { status: 400 }
      );
    }

    const freelancerId = acceptedApplication.user_id;

    // Récupérer le profil du freelance avec son compte Connect
    const { data: freelanceProfile, error: freelanceError } = await supabaseService
      .from("profiles")
      .select("id, stripe_account_id, connect_payouts_enabled")
      .eq("id", freelancerId)
      .single();

    if (freelanceError || !freelanceProfile) {
      console.error("❌ Profil freelance introuvable");
      return NextResponse.json(
        { error: "Profil freelance introuvable" },
        { status: 400 }
      );
    }

    if (!freelanceProfile.stripe_account_id) {
      return NextResponse.json(
        { error: "Le freelance n'a pas de compte Stripe Connect configuré" },
        { status: 400 }
      );
    }

    if (!freelanceProfile.connect_payouts_enabled) {
      return NextResponse.json(
        { error: "Le compte Connect du freelance n'est pas encore activé pour les virements" },
        { status: 400 }
      );
    }

    const transfers: Array<{
      type: "freelancer_payout" | "commercial_commission";
      profileId: string;
      accountId: string;
      amount: number;
      transferId?: string;
      status: "created" | "failed";
      error?: string;
    }> = [];

    // Créer le transfert vers le freelance
    console.log(`🔄 Création du transfert freelance: ${finance.freelancer_amount} centimes`);
    try {
      const { transferId } = await createTransfer({
        amount: finance.freelancer_amount,
        currency: "eur",
        destinationAccountId: freelanceProfile.stripe_account_id,
        description: `Paiement mission ${missionId}`,
        metadata: {
          mission_id: missionId,
          mission_payment_id: payment.id,
          type: "freelancer_payout",
        },
        sourceTransaction: payment.stripe_payment_intent_id || undefined,
      });

      transfers.push({
        type: "freelancer_payout",
        profileId: freelanceProfile.id,
        accountId: freelanceProfile.stripe_account_id,
        amount: finance.freelancer_amount,
        transferId,
        status: "created",
      });

      // Enregistrer le transfert
      await supabaseService.from("mission_transfers").insert({
        mission_id: missionId,
        mission_payment_id: payment.id,
        mission_finance_id: finance.id,
        destination_profile_id: freelanceProfile.id,
        destination_stripe_account_id: freelanceProfile.stripe_account_id,
        type: "freelancer_payout",
        amount: finance.freelancer_amount,
        currency: "eur",
        status: "created",
        stripe_transfer_id: transferId,
        transferred_at: new Date().toISOString(),
      });

      console.log(`✅ Transfert freelance créé: ${transferId}`);
    } catch (error) {
      console.error("❌ Erreur transfert freelance:", error);
      transfers.push({
        type: "freelancer_payout",
        profileId: freelanceProfile.id,
        accountId: freelanceProfile.stripe_account_id,
        amount: finance.freelancer_amount,
        status: "failed",
        error: error instanceof Error ? error.message : "Erreur inconnue",
      });

      // Enregistrer l'échec
      await supabaseService.from("mission_transfers").insert({
        mission_id: missionId,
        mission_payment_id: payment.id,
        mission_finance_id: finance.id,
        destination_profile_id: freelanceProfile.id,
        destination_stripe_account_id: freelanceProfile.stripe_account_id,
        type: "freelancer_payout",
        amount: finance.freelancer_amount,
        currency: "eur",
        status: "failed",
        error_message: error instanceof Error ? error.message : "Erreur inconnue",
      });
    }

    // Si commercial, créer le transfert vers le commercial
    if (finance.commercial_id && finance.commercial_fee_amount > 0) {
      const { data: commercialProfile, error: commercialError } = await supabaseService
        .from("profiles")
        .select("id, stripe_account_id, connect_payouts_enabled")
        .eq("id", finance.commercial_id)
        .single();

      if (commercialProfile?.stripe_account_id && commercialProfile.connect_payouts_enabled) {
        console.log(`🔄 Création du transfert commercial: ${finance.commercial_fee_amount} centimes`);
        try {
          const { transferId } = await createTransfer({
            amount: finance.commercial_fee_amount,
            currency: "eur",
            destinationAccountId: commercialProfile.stripe_account_id,
            description: `Commission mission ${missionId}`,
            metadata: {
              mission_id: missionId,
              mission_payment_id: payment.id,
              type: "commercial_commission",
            },
            sourceTransaction: payment.stripe_payment_intent_id || undefined,
          });

          transfers.push({
            type: "commercial_commission",
            profileId: commercialProfile.id,
            accountId: commercialProfile.stripe_account_id,
            amount: finance.commercial_fee_amount,
            transferId,
            status: "created",
          });

          // Enregistrer le transfert
          await supabaseService.from("mission_transfers").insert({
            mission_id: missionId,
            mission_payment_id: payment.id,
            mission_finance_id: finance.id,
            destination_profile_id: commercialProfile.id,
            destination_stripe_account_id: commercialProfile.stripe_account_id,
            type: "commercial_commission",
            amount: finance.commercial_fee_amount,
            currency: "eur",
            status: "created",
            stripe_transfer_id: transferId,
            transferred_at: new Date().toISOString(),
          });

          console.log(`✅ Transfert commercial créé: ${transferId}`);
        } catch (error) {
          console.error("❌ Erreur transfert commercial:", error);
          transfers.push({
            type: "commercial_commission",
            profileId: commercialProfile.id,
            accountId: commercialProfile.stripe_account_id,
            amount: finance.commercial_fee_amount,
            status: "failed",
            error: error instanceof Error ? error.message : "Erreur inconnue",
          });

          // Enregistrer l'échec
          await supabaseService.from("mission_transfers").insert({
            mission_id: missionId,
            mission_payment_id: payment.id,
            mission_finance_id: finance.id,
            destination_profile_id: commercialProfile.id,
            destination_stripe_account_id: commercialProfile.stripe_account_id,
            type: "commercial_commission",
            amount: finance.commercial_fee_amount,
            currency: "eur",
            status: "failed",
            error_message: error instanceof Error ? error.message : "Erreur inconnue",
          });
        }
      } else {
        console.warn(`⚠️ Commercial ${finance.commercial_id} n'a pas de compte Connect valide`);
      }
    }

    // Mettre à jour le statut de mission_finance
    const allSuccess = transfers.every((t) => t.status === "created");
    const anySuccess = transfers.some((t) => t.status === "created");

    let newStatus: "funds_released" | "partially_released" = "partially_released";
    if (allSuccess) {
      newStatus = "funds_released";
    }

    await supabaseService
      .from("mission_finance")
      .update({ status: newStatus })
      .eq("id", finance.id);

    console.log(`✅ Fonds libérés (status: ${newStatus})`);

    return NextResponse.json({
      success: true,
      status: newStatus,
      transfers: transfers.map((t) => ({
        type: t.type,
        amount: t.amount,
        status: t.status,
        transfer_id: t.transferId,
        error: t.error,
      })),
    });
  } catch (error) {
    console.error("❌ Erreur lors de la libération des fonds:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de la libération des fonds",
      },
      { status: 500 }
    );
  }
}
