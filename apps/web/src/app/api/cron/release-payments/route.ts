import { NextRequest, NextResponse } from "next/server";
import { createTransfer, getStripeClient } from "@shiftly/payments";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

// Secret partagé pour sécuriser l'endpoint CRON
const CRON_SECRET = process.env.CRON_SECRET || "";

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
    console.error("❌ [Cron] Erreur récupération Charge ID:", error);
    return undefined;
  }
}

/**
 * Tente un transfert avec retry
 */
async function attemptTransferWithRetry(params: {
  amount: number;
  currency: string;
  destinationAccountId: string;
  description: string;
  metadata: Record<string, string>;
  sourceTransaction?: string;
}): Promise<{ success: boolean; transferId?: string; error?: string }> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { transferId } = await createTransfer({
        amount: params.amount,
        currency: params.currency,
        destinationAccountId: params.destinationAccountId,
        description: params.description,
        metadata: params.metadata,
        sourceTransaction: params.sourceTransaction,
      });

      return { success: true, transferId };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Erreur inconnue");
      if (attempt < MAX_RETRIES) {
        await delay(RETRY_DELAY_MS);
      }
    }
  }

  return {
    success: false,
    error: lastError?.message || "Erreur après 3 tentatives",
  };
}

/**
 * POST /api/cron/release-payments
 *
 * Endpoint appelé par Vercel Cron pour libérer automatiquement les fonds.
 * Schedule: 0 6 * * * (tous les jours à 6h UTC).
 *
 * Sécurité: Vérifie Authorization: Bearer <CRON_SECRET> (env CRON_SECRET sur Vercel).
 * Retourne 401 si header absent ou secret incorrect.
 *
 * Idempotence: release_due_payments() filtre sur released_at IS NULL et utilise
 * FOR UPDATE SKIP LOCKED; chaque paiement est re-vérifié (released_at) avant transfert.
 */
export async function POST(req: NextRequest) {
  console.log("📥 POST /api/cron/release-payments");

  const authHeader = req.headers.get("authorization");
  const providedSecret =
    authHeader?.replace(/^Bearer\s+/i, "").trim() ?? "";

  if (!CRON_SECRET || providedSecret !== CRON_SECRET) {
    console.warn("⚠️ [Cron] Tentative d'accès non autorisée");
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const supabase = getSupabaseServiceRole();
  const results = {
    processed: 0,
    successful: 0,
    failed: 0,
    skipped: 0,
    errors: [] as string[],
  };

  try {
    // Appeler la fonction SQL qui retourne les paiements éligibles (avec verrouillage)
    const { data: eligiblePayments, error: functionError } = await supabase.rpc(
      "release_due_payments"
    );

    if (functionError) {
      console.error("❌ [Cron] Erreur fonction SQL:", functionError);
      return NextResponse.json(
        { error: "Erreur lors de la récupération des paiements éligibles" },
        { status: 500 }
      );
    }

    if (!eligiblePayments || eligiblePayments.length === 0) {
      console.log("ℹ️ [Cron] Aucun paiement éligible pour libération");
      return NextResponse.json({
        success: true,
        message: "Aucun paiement éligible",
        results,
      });
    }

    console.log(
      `🔄 [Cron] ${eligiblePayments.length} paiement(s) éligible(s) à traiter`
    );

    // Traiter chaque paiement
    for (const payment of eligiblePayments) {
      results.processed++;

      try {
        // Double vérification idempotence: released_at doit être NULL
        const { data: paymentCheck, error: checkError } = await supabase
          .from("mission_payments")
          .select("id, status, released_at, stripe_payment_intent_id")
          .eq("id", payment.payment_id)
          .single();

        if (checkError || !paymentCheck) {
          console.error(
            `❌ [Cron] Paiement ${payment.payment_id} introuvable`
          );
          results.failed++;
          results.errors.push(
            `Paiement ${payment.payment_id}: introuvable`
          );
          continue;
        }

        // Idempotence: si déjà libéré, skip
        if (paymentCheck.released_at) {
          console.log(
            `⏭️ [Cron] Paiement ${payment.payment_id} déjà libéré (released_at: ${paymentCheck.released_at})`
          );
          results.skipped++;
          continue;
        }

        // Récupérer le Charge ID
        const chargeId = await getChargeIdFromPaymentIntent(
          paymentCheck.stripe_payment_intent_id
        );

        if (!chargeId) {
          console.error(
            `❌ [Cron] Impossible de récupérer le Charge ID pour ${payment.payment_id}`
          );
          results.failed++;
          results.errors.push(
            `Paiement ${payment.payment_id}: Charge ID introuvable`
          );
          continue;
        }

        // Récupérer les informations de la mission
        const { data: mission } = await supabase
          .from("missions")
          .select("id, title")
          .eq("id", payment.mission_id)
          .single();

        const transfers: Array<{
          type: "freelancer_payout" | "commercial_commission";
          profileId: string;
          accountId: string;
          amount: number;
          transferId?: string;
          status: "created" | "failed";
          error?: string;
        }> = [];

        // ================================================================
        // TRANSFERT FREELANCE
        // ================================================================
        if (payment.freelancer_id && payment.freelancer_amount > 0) {
          const { data: freelanceProfile } = await supabase
            .from("profiles")
            .select("id, stripe_account_id, connect_payouts_enabled")
            .eq("id", payment.freelancer_id)
            .single();

          if (
            freelanceProfile?.stripe_account_id &&
            freelanceProfile.connect_payouts_enabled
          ) {
            const result = await attemptTransferWithRetry({
              amount: payment.freelancer_amount,
              currency: "eur",
              destinationAccountId: freelanceProfile.stripe_account_id,
              description: `Paiement mission: ${mission?.title || payment.mission_id}`,
              metadata: {
                mission_id: payment.mission_id,
                mission_payment_id: payment.payment_id,
                type: "freelancer_payout",
                source: "auto_release",
              },
              sourceTransaction: chargeId,
            });

            if (result.success && result.transferId) {
              transfers.push({
                type: "freelancer_payout",
                profileId: freelanceProfile.id,
                accountId: freelanceProfile.stripe_account_id,
                amount: payment.freelancer_amount,
                transferId: result.transferId,
                status: "created",
              });

              // Enregistrer le transfert
              await supabase.from("mission_transfers").insert({
                mission_id: payment.mission_id,
                mission_payment_id: payment.payment_id,
                mission_finance_id: payment.finance_id,
                destination_profile_id: freelanceProfile.id,
                destination_stripe_account_id: freelanceProfile.stripe_account_id,
                type: "freelancer_payout",
                amount: payment.freelancer_amount,
                currency: "eur",
                status: "created",
                stripe_transfer_id: result.transferId,
                transferred_at: new Date().toISOString(),
              });
            } else {
              transfers.push({
                type: "freelancer_payout",
                profileId: freelanceProfile.id,
                accountId: freelanceProfile.stripe_account_id,
                amount: payment.freelancer_amount,
                status: "failed",
                error: result.error,
              });

              await supabase.from("mission_transfers").insert({
                mission_id: payment.mission_id,
                mission_payment_id: payment.payment_id,
                mission_finance_id: payment.finance_id,
                destination_profile_id: freelanceProfile.id,
                destination_stripe_account_id: freelanceProfile.stripe_account_id,
                type: "freelancer_payout",
                amount: payment.freelancer_amount,
                currency: "eur",
                status: "failed",
                error_message: result.error,
              });
            }
          } else {
            console.warn(
              `⚠️ [Cron] Freelance ${payment.freelancer_id} n'a pas de compte Stripe valide`
            );
            // Skip mais ne compte pas comme échec
          }
        }

        // ================================================================
        // TRANSFERT COMMERCIAL
        // ================================================================
        if (payment.commercial_id && payment.commercial_fee_amount > 0) {
          const { data: commercialProfile } = await supabase
            .from("profiles")
            .select("id, stripe_account_id, connect_payouts_enabled")
            .eq("id", payment.commercial_id)
            .single();

          if (
            commercialProfile?.stripe_account_id &&
            commercialProfile.connect_payouts_enabled
          ) {
            const result = await attemptTransferWithRetry({
              amount: payment.commercial_fee_amount,
              currency: "eur",
              destinationAccountId: commercialProfile.stripe_account_id,
              description: `Commission mission: ${mission?.title || payment.mission_id}`,
              metadata: {
                mission_id: payment.mission_id,
                mission_payment_id: payment.payment_id,
                type: "commercial_commission",
                source: "auto_release",
              },
              sourceTransaction: chargeId,
            });

            if (result.success && result.transferId) {
              transfers.push({
                type: "commercial_commission",
                profileId: commercialProfile.id,
                accountId: commercialProfile.stripe_account_id,
                amount: payment.commercial_fee_amount,
                transferId: result.transferId,
                status: "created",
              });

              await supabase.from("mission_transfers").insert({
                mission_id: payment.mission_id,
                mission_payment_id: payment.payment_id,
                mission_finance_id: payment.finance_id,
                destination_profile_id: commercialProfile.id,
                destination_stripe_account_id: commercialProfile.stripe_account_id,
                type: "commercial_commission",
                amount: payment.commercial_fee_amount,
                currency: "eur",
                status: "created",
                stripe_transfer_id: result.transferId,
                transferred_at: new Date().toISOString(),
              });
            } else {
              transfers.push({
                type: "commercial_commission",
                profileId: commercialProfile.id,
                accountId: commercialProfile.stripe_account_id,
                amount: payment.commercial_fee_amount,
                status: "failed",
                error: result.error,
              });

              await supabase.from("mission_transfers").insert({
                mission_id: payment.mission_id,
                mission_payment_id: payment.payment_id,
                mission_finance_id: payment.finance_id,
                destination_profile_id: commercialProfile.id,
                destination_stripe_account_id: commercialProfile.stripe_account_id,
                type: "commercial_commission",
                amount: payment.commercial_fee_amount,
                currency: "eur",
                status: "failed",
                error_message: result.error,
              });
            }
          }
        }

        // ================================================================
        // MISE À JOUR DES STATUTS (SOURCE DE VÉRITÉ)
        // ================================================================
        const successTransfers = transfers.filter((t) => t.status === "created");
        const failedTransfers = transfers.filter((t) => t.status === "failed");

        // Mettre à jour released_at (SOURCE DE VÉRITÉ pour l'idempotence)
        const now = new Date().toISOString();
        await supabase
          .from("mission_payments")
          .update({
            released_at: now, // Source de vérité
            status: failedTransfers.length > 0 ? "errored" : "distributed",
            distributed_at: now,
          })
          .eq("id", payment.payment_id);

        // Mettre à jour mission_finance
        const financeStatus =
          successTransfers.length > 0 && failedTransfers.length === 0
            ? "funds_released"
            : "partially_released";

        await supabase
          .from("mission_finance")
          .update({ status: financeStatus })
          .eq("id", payment.finance_id);

        if (successTransfers.length > 0) {
          results.successful++;
          console.log(
            `✅ [Cron] Paiement ${payment.payment_id} libéré - ${successTransfers.length} transfert(s) réussi(s)`
          );
        } else {
          results.failed++;
          results.errors.push(
            `Paiement ${payment.payment_id}: tous les transferts ont échoué`
          );
        }
      } catch (error) {
        console.error(
          `❌ [Cron] Erreur traitement paiement ${payment.payment_id}:`,
          error
        );
        results.failed++;
        results.errors.push(
          `Paiement ${payment.payment_id}: ${error instanceof Error ? error.message : "Erreur inconnue"}`
        );
      }
    }

    console.log(
      `✅ [Cron] Traitement terminé: ${results.successful} réussis, ${results.failed} échoués, ${results.skipped} skippés`
    );

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("❌ [Cron] Erreur globale:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de la libération automatique",
        results,
      },
      { status: 500 }
    );
  }
}
