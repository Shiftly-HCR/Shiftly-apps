import { NextRequest, NextResponse } from "next/server";
import { createTransfer, getStripeClient } from "@shiftly/payments";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

/**
 * Attendre un délai (en ms)
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
 * Récupère le Charge ID depuis un PaymentIntent
 */
async function getChargeIdFromPaymentIntent(
  paymentIntentId: string | null | undefined
): Promise<string | undefined> {
  if (!paymentIntentId) {
    return undefined;
  }

  try {
    const stripe = getStripeClient();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    const chargeId =
      typeof paymentIntent.latest_charge === "string"
        ? paymentIntent.latest_charge
        : (paymentIntent.latest_charge as Stripe.Charge)?.id;

    return chargeId;
  } catch (error) {
    console.error("❌ [RetryTransfer] Erreur récupération Charge ID:", error);
    return undefined;
  }
}

/**
 * POST /api/payments/retry-transfer
 * Permet à un freelance ou commercial de relancer un transfert skippé
 *
 * Body: { missionPaymentId: string }
 */
export async function POST(req: NextRequest) {
  console.log("📥 POST /api/payments/retry-transfer");

  try {
    // Récupérer le body
    const body = await req.json();
    const { missionPaymentId } = body;

    if (!missionPaymentId) {
      return NextResponse.json(
        { error: "missionPaymentId requis" },
        { status: 400 }
      );
    }

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

    // Récupérer le profil de l'utilisateur
    const { data: userProfile, error: profileError } = await supabaseService
      .from("profiles")
      .select("id, role, stripe_account_id, connect_payouts_enabled")
      .eq("id", user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: "Profil introuvable" },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est freelance ou commercial
    if (userProfile.role !== "freelance" && userProfile.role !== "commercial") {
      return NextResponse.json(
        { error: "Seuls les freelances et commerciaux peuvent utiliser cette fonctionnalité" },
        { status: 403 }
      );
    }

    // Vérifier que l'utilisateur a un compte Stripe configuré
    if (!userProfile.stripe_account_id) {
      return NextResponse.json(
        { error: "Vous devez configurer votre compte Stripe avant de recevoir des paiements" },
        { status: 400 }
      );
    }

    if (!userProfile.connect_payouts_enabled) {
      return NextResponse.json(
        { error: "Votre compte Stripe n'est pas encore activé pour les virements" },
        { status: 400 }
      );
    }

    // Récupérer le paiement et vérifier que l'utilisateur est bien le destinataire
    const { data: finance, error: financeError } = await supabaseService
      .from("mission_finance")
      .select(
        `
        id,
        mission_id,
        mission_payment_id,
        freelancer_id,
        freelancer_amount,
        commercial_id,
        commercial_fee_amount,
        status
      `
      )
      .eq("mission_payment_id", missionPaymentId)
      .single();

    if (financeError || !finance) {
      return NextResponse.json(
        { error: "Paiement introuvable" },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est bien le destinataire
    let isDestination = false;
    let transferType: "freelancer_payout" | "commercial_commission" | null =
      null;
    let amount: number | null = null;

    if (userProfile.role === "freelance" && finance.freelancer_id === user.id) {
      isDestination = true;
      transferType = "freelancer_payout";
      amount = finance.freelancer_amount;
    } else if (
      userProfile.role === "commercial" &&
      finance.commercial_id === user.id
    ) {
      isDestination = true;
      transferType = "commercial_commission";
      amount = finance.commercial_fee_amount;
    }

    if (!isDestination || !transferType || amount == null) {
      return NextResponse.json(
        { error: "Vous n'êtes pas le destinataire de ce paiement" },
        { status: 403 }
      );
    }

    // Vérifier qu'il n'y a pas déjà un transfert réussi
    const { data: existingTransfer } = await supabaseService
      .from("mission_transfers")
      .select("id, status, stripe_transfer_id")
      .eq("mission_payment_id", missionPaymentId)
      .eq("destination_profile_id", user.id)
      .eq("status", "created")
      .maybeSingle();

    if (existingTransfer) {
      return NextResponse.json(
        { error: "Ce paiement a déjà été transféré", transferId: existingTransfer.stripe_transfer_id },
        { status: 400 }
      );
    }

    // Récupérer le payment pour avoir le PaymentIntent ID
    const { data: payment, error: paymentError } = await supabaseService
      .from("mission_payments")
      .select("id, stripe_payment_intent_id, status")
      .eq("id", missionPaymentId)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: "Paiement introuvable" },
        { status: 404 }
      );
    }

    // Vérifier que le paiement est bien en status distributed ou received
    if (payment.status !== "distributed" && payment.status !== "received") {
      return NextResponse.json(
        { error: "Ce paiement n'est pas disponible pour un transfert" },
        { status: 400 }
      );
    }

    // Récupérer la mission pour le titre
    const { data: mission } = await supabaseService
      .from("missions")
      .select("id, title")
      .eq("id", finance.mission_id)
      .single();

    // Récupérer le Charge ID
    const chargeId = await getChargeIdFromPaymentIntent(
      payment.stripe_payment_intent_id
    );

    if (!chargeId) {
      return NextResponse.json(
        { error: "Impossible de récupérer les informations de paiement Stripe" },
        { status: 500 }
      );
    }

    console.log(`✅ [RetryTransfer] Charge ID: ${chargeId}`);
    console.log(
      `🔄 [RetryTransfer] Transfert ${transferType}: ${amount} centimes vers ${userProfile.stripe_account_id}`
    );

    // Effectuer le transfert avec retry
    let lastError: Error | null = null;
    let transferId: string | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(
          `🔄 [RetryTransfer] Tentative ${attempt}/${MAX_RETRIES}...`
        );

        const result = await createTransfer({
          amount,
          currency: "eur",
          destinationAccountId: userProfile.stripe_account_id,
          description: `${transferType === "freelancer_payout" ? "Paiement" : "Commission"} mission: ${mission?.title || finance.mission_id}`,
          metadata: {
            mission_id: finance.mission_id,
            mission_payment_id: missionPaymentId,
            type: transferType,
            retry: "true",
          },
          sourceTransaction: chargeId,
        });

        transferId = result.transferId;
        console.log(
          `✅ [RetryTransfer] Transfert réussi (tentative ${attempt}): ${transferId}`
        );
        break;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Erreur inconnue");
        console.error(
          `❌ [RetryTransfer] Tentative ${attempt}/${MAX_RETRIES} échouée:`,
          lastError.message
        );

        if (attempt < MAX_RETRIES) {
          await delay(RETRY_DELAY_MS);
        }
      }
    }

    if (!transferId) {
      // Enregistrer l'échec
      await supabaseService.from("mission_transfers").insert({
        mission_id: finance.mission_id,
        mission_payment_id: missionPaymentId,
        mission_finance_id: finance.id,
        destination_profile_id: user.id,
        destination_stripe_account_id: userProfile.stripe_account_id,
        type: transferType,
        amount,
        currency: "eur",
        status: "failed",
        error_message: lastError?.message || "Erreur après 3 tentatives",
      });

      return NextResponse.json(
        { error: `Échec du transfert: ${lastError?.message}` },
        { status: 500 }
      );
    }

    // Enregistrer le succès
    await supabaseService.from("mission_transfers").insert({
      mission_id: finance.mission_id,
      mission_payment_id: missionPaymentId,
      mission_finance_id: finance.id,
      destination_profile_id: user.id,
      destination_stripe_account_id: userProfile.stripe_account_id,
      type: transferType,
      amount,
      currency: "eur",
      status: "created",
      stripe_transfer_id: transferId,
      transferred_at: new Date().toISOString(),
    });

    // Mettre à jour le statut de mission_finance si tous les transferts sont faits
    // Vérifier combien de transferts sont attendus et combien sont faits
    const expectedTransfers = [];
    if (finance.freelancer_id && finance.freelancer_amount > 0) {
      expectedTransfers.push("freelancer_payout");
    }
    if (finance.commercial_id && finance.commercial_fee_amount > 0) {
      expectedTransfers.push("commercial_commission");
    }

    const { data: completedTransfers } = await supabaseService
      .from("mission_transfers")
      .select("type")
      .eq("mission_payment_id", missionPaymentId)
      .eq("status", "created");

    const completedTypes = completedTransfers?.map((t: { type: string }) => t.type) || [];
    const allCompleted = expectedTransfers.every((type) =>
      completedTypes.includes(type)
    );

    if (allCompleted) {
      await supabaseService
        .from("mission_finance")
        .update({ status: "funds_released" })
        .eq("id", finance.id);

      console.log(`✅ [RetryTransfer] Tous les transferts complétés`);
    }

    return NextResponse.json({
      success: true,
      transferId,
      amount,
      message: "Transfert effectué avec succès",
    });
  } catch (error) {
    console.error("❌ [RetryTransfer] Erreur:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Erreur lors du transfert",
      },
      { status: 500 }
    );
  }
}
