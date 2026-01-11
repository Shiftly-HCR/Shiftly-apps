/**
 * Handlers pour les webhooks Stripe Connect
 * Gère les paiements de missions et les mises à jour de comptes Connect
 */

import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { calculateFundDistribution } from "@shiftly/payments";

// Client Supabase avec service role pour les webhooks (bypass RLS)
function getSupabaseServiceRole() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Configuration Supabase manquante pour les webhooks");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Handler pour checkout.session.completed - Paiement de mission
 * Appelé quand un recruteur finalise le paiement d'une mission
 */
export async function handleMissionCheckoutCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  console.log(`🛒 [Connect Webhook] checkout.session.completed pour mission: ${session.id}`);

  // Vérifier que c'est un paiement de mission
  const metadata = session.metadata;
  if (!metadata?.type || metadata.type !== "mission_payment") {
    console.log(`ℹ️ [Connect Webhook] Pas un paiement de mission, ignoré`);
    return;
  }

  const missionId = metadata.mission_id;
  const recruiterId = metadata.recruiter_id;
  const establishmentId = metadata.establishment_id;

  if (!missionId) {
    console.error("❌ [Connect Webhook] mission_id manquant dans les metadata");
    return;
  }

  console.log(`📋 [Connect Webhook] Mission: ${missionId}, Recruteur: ${recruiterId}`);

  const supabase = getSupabaseServiceRole();

  // 1. Mettre à jour le mission_payment
  const { data: payment, error: paymentError } = await supabase
    .from("mission_payments")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      stripe_payment_intent_id:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id,
    })
    .eq("stripe_checkout_session_id", session.id)
    .select()
    .single();

  if (paymentError) {
    console.error("❌ [Connect Webhook] Erreur mise à jour payment:", paymentError);
    
    // Essayer de créer le payment s'il n'existe pas
    const amountTotal = session.amount_total || 0;
    const { error: insertError } = await supabase.from("mission_payments").insert({
      mission_id: missionId,
      recruiter_id: recruiterId,
      amount: amountTotal,
      currency: session.currency || "eur",
      status: "paid",
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id,
      paid_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("❌ [Connect Webhook] Erreur création payment:", insertError);
      throw new Error(`Erreur traitement paiement: ${insertError.message}`);
    }

    // Récupérer le payment créé
    const { data: newPayment } = await supabase
      .from("mission_payments")
      .select()
      .eq("stripe_checkout_session_id", session.id)
      .single();

    if (!newPayment) {
      throw new Error("Payment créé mais non récupérable");
    }

    await createMissionFinance(supabase, missionId, newPayment.id, newPayment.amount, establishmentId);
    return;
  }

  // 2. Calculer et créer le mission_finance
  await createMissionFinance(supabase, missionId, payment.id, payment.amount, establishmentId);

  console.log(`✅ [Connect Webhook] Paiement mission ${missionId} traité avec succès`);
}

/**
 * Crée un enregistrement mission_finance avec la répartition des fonds
 */
async function createMissionFinance(
  supabase: ReturnType<typeof getSupabaseServiceRole>,
  missionId: string,
  paymentId: string,
  amount: number,
  establishmentId?: string
): Promise<void> {
  // Vérifier si la finance existe déjà
  const { data: existingFinance } = await supabase
    .from("mission_finance")
    .select("id")
    .eq("mission_payment_id", paymentId)
    .maybeSingle();

  if (existingFinance) {
    console.log(`ℹ️ [Connect Webhook] Finance déjà créée pour payment ${paymentId}`);
    return;
  }

  // Récupérer le commercial_id si établissement rattaché
  let commercialId: string | null = null;

  if (establishmentId) {
    const { data: establishment } = await supabase
      .from("establishments")
      .select("commercial_id")
      .eq("id", establishmentId)
      .single();

    if (establishment?.commercial_id) {
      // Vérifier que le commercial a un compte Connect actif
      const { data: commercialProfile } = await supabase
        .from("profiles")
        .select("stripe_account_id")
        .eq("id", establishment.commercial_id)
        .single();

      if (commercialProfile?.stripe_account_id) {
        commercialId = establishment.commercial_id;
        console.log(`ℹ️ [Connect Webhook] Commercial rattaché: ${commercialId}`);
      }
    }
  }

  // Calculer la répartition
  const finance = calculateFundDistribution(amount, !!commercialId);

  // Créer l'enregistrement
  const { error: financeError } = await supabase.from("mission_finance").insert({
    mission_id: missionId,
    mission_payment_id: paymentId,
    gross_amount: amount,
    platform_fee_amount: finance.platformFeeAmount,
    commercial_fee_amount: finance.commercialFeeAmount,
    freelancer_amount: finance.freelancerAmount,
    platform_net_amount: finance.platformNetAmount,
    commercial_id: commercialId,
  });

  if (financeError) {
    console.error("❌ [Connect Webhook] Erreur création finance:", financeError);
    throw new Error(`Erreur création finance: ${financeError.message}`);
  }

  console.log(`✅ [Connect Webhook] Finance créée:`, { grossAmount: amount, ...finance });
}

/**
 * Handler pour account.updated
 * Appelé quand le compte Connect d'un utilisateur est mis à jour
 */
export async function handleAccountUpdated(
  account: Stripe.Account
): Promise<void> {
  console.log(`🔄 [Connect Webhook] account.updated: ${account.id}`);

  const supabase = getSupabaseServiceRole();

  // Récupérer le profil associé à ce compte Connect
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, connect_onboarding_status")
    .eq("stripe_account_id", account.id)
    .single();

  if (profileError || !profile) {
    console.warn(`⚠️ [Connect Webhook] Profil non trouvé pour compte ${account.id}`);
    return;
  }

  // Déterminer le nouveau statut d'onboarding
  let onboardingStatus: "not_started" | "pending" | "complete" | "restricted" = "pending";

  if (account.details_submitted && account.payouts_enabled) {
    onboardingStatus = "complete";
  } else if (account.requirements?.disabled_reason) {
    onboardingStatus = "restricted";
  } else if (account.details_submitted) {
    onboardingStatus = "pending";
  }

  // Extraire les requirements_due
  const requirementsDue = account.requirements
    ? {
        currently_due: account.requirements.currently_due,
        eventually_due: account.requirements.eventually_due,
        past_due: account.requirements.past_due,
        disabled_reason: account.requirements.disabled_reason,
      }
    : null;

  // Mettre à jour le profil
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      connect_onboarding_status: onboardingStatus,
      connect_payouts_enabled: account.payouts_enabled || false,
      connect_charges_enabled: account.charges_enabled || false,
      connect_requirements_due: requirementsDue,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profile.id);

  if (updateError) {
    console.error("❌ [Connect Webhook] Erreur mise à jour profil:", updateError);
    throw new Error(`Erreur mise à jour profil: ${updateError.message}`);
  }

  console.log(`✅ [Connect Webhook] Profil ${profile.id} mis à jour:`, {
    onboardingStatus,
    payoutsEnabled: account.payouts_enabled,
    chargesEnabled: account.charges_enabled,
  });
}

/**
 * Handler pour payment_intent.payment_failed (optionnel)
 * Appelé quand un paiement échoue
 */
export async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  console.log(`❌ [Connect Webhook] payment_intent.payment_failed: ${paymentIntent.id}`);

  const supabase = getSupabaseServiceRole();

  // Mettre à jour le mission_payment correspondant
  const { error } = await supabase
    .from("mission_payments")
    .update({ status: "failed" })
    .eq("stripe_payment_intent_id", paymentIntent.id);

  if (error) {
    console.error("❌ [Connect Webhook] Erreur mise à jour payment failed:", error);
  }
}

/**
 * Handler pour charge.refunded (optionnel)
 * Appelé quand un paiement est remboursé
 */
export async function handleChargeRefunded(
  charge: Stripe.Charge
): Promise<void> {
  console.log(`💸 [Connect Webhook] charge.refunded: ${charge.id}`);

  const paymentIntentId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id;

  if (!paymentIntentId) {
    console.warn("⚠️ [Connect Webhook] payment_intent manquant dans charge refunded");
    return;
  }

  const supabase = getSupabaseServiceRole();

  // Mettre à jour le mission_payment correspondant
  const { error } = await supabase
    .from("mission_payments")
    .update({ status: "refunded" })
    .eq("stripe_payment_intent_id", paymentIntentId);

  if (error) {
    console.error("❌ [Connect Webhook] Erreur mise à jour payment refunded:", error);
  }
}
