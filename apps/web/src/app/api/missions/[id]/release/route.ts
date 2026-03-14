import { NextRequest, NextResponse } from "next/server";
import { createTransfer, getStripeClient } from "@shiftly/payments";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { trackServerEvent } from "@/analytics/server";
import { ANALYTICS_EVENTS } from "@/analytics/events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

// Email de l'admin (CTO) pour les notifications
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "cto@shiftly.fr";

/**
 * Attendre un délai (en ms)
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Récupère le Charge ID depuis un PaymentIntent
 * Stripe Transfer nécessite un Charge ID, pas un PaymentIntent ID
 */
async function getChargeIdFromPaymentIntent(
  paymentIntentId: string | null | undefined
): Promise<string | undefined> {
  if (!paymentIntentId) {
    console.log("⚠️ [Release] Pas de PaymentIntent ID fourni");
    return undefined;
  }

  try {
    const stripe = getStripeClient();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Le charge peut être une string (ID) ou un objet Charge
    const chargeId =
      typeof paymentIntent.latest_charge === "string"
        ? paymentIntent.latest_charge
        : (paymentIntent.latest_charge as Stripe.Charge)?.id;

    if (chargeId) {
      console.log(`✅ [Release] Charge ID récupéré: ${chargeId}`);
      return chargeId;
    }

    console.warn("⚠️ [Release] Pas de charge trouvée dans le PaymentIntent");
    return undefined;
  } catch (error) {
    console.error("❌ [Release] Erreur récupération Charge ID:", error);
    return undefined;
  }
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

interface RouteContext {
  params: Promise<{ id: string }>;
}

interface TransferResult {
  type: "freelancer_payout" | "commercial_commission";
  profileId: string;
  accountId: string;
  amount: number;
  transferId?: string;
  status: "created" | "failed" | "skipped";
  error?: string;
  retryCount?: number;
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
      console.log(
        `🔄 [Release] Tentative ${attempt}/${MAX_RETRIES} de transfert vers ${params.destinationAccountId}`
      );

      const { transferId } = await createTransfer({
        amount: params.amount,
        currency: params.currency,
        destinationAccountId: params.destinationAccountId,
        description: params.description,
        metadata: params.metadata,
        sourceTransaction: params.sourceTransaction,
      });

      console.log(
        `✅ [Release] Transfert réussi (tentative ${attempt}): ${transferId}`
      );
      return { success: true, transferId };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Erreur inconnue");
      console.error(
        `❌ [Release] Tentative ${attempt}/${MAX_RETRIES} échouée:`,
        lastError.message
      );

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
 * Envoie une notification (placeholder - à implémenter avec un service email)
 */
async function sendNotification(params: {
  type: "error" | "missing_stripe";
  recipients: string[];
  missionId: string;
  missionTitle: string;
  details: string;
}): Promise<void> {
  // TODO: Implémenter avec un service email (SendGrid, Resend, etc.)
  console.log(`📧 [Notification] Type: ${params.type}`);
  console.log(`📧 [Notification] Destinataires: ${params.recipients.join(", ")}`);
  console.log(`📧 [Notification] Mission: ${params.missionTitle} (${params.missionId})`);
  console.log(`📧 [Notification] Détails: ${params.details}`);

  // Pour l'instant, on log juste - à remplacer par l'envoi réel
  // Exemple avec Resend:
  // await resend.emails.send({
  //   from: 'noreply@shiftly.fr',
  //   to: params.recipients,
  //   subject: `[Shiftly] Erreur distribution fonds - Mission ${params.missionTitle}`,
  //   html: `<p>${params.details}</p>`,
  // });
}

/**
 * POST /api/missions/[id]/release
 * Libère les fonds vers le freelance et le commercial (si applicable)
 * 
 * Fonctionnement:
 * - Vérifie que le paiement est en statut 'received'
 * - Pour chaque destinataire avec un compte Stripe valide, effectue le transfert
 * - 3 tentatives par transfert avant échec
 * - Si un destinataire n'a pas de compte Stripe, on le skip et on notifie
 * - Met à jour mission_payments.status à 'distributed' ou 'errored'
 */
export async function POST(req: NextRequest, context: RouteContext) {
  const { id: missionId } = await context.params;
  console.log(`📥 POST /api/missions/${missionId}/release`);
  const requestId = req.headers.get("x-request-id") || crypto.randomUUID();
  const endpoint = "/api/missions/[id]/release";

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
      trackServerEvent({
        event: ANALYTICS_EVENTS.apiRequestFailed,
        properties: {
          endpoint,
          request_id: requestId,
          mission_id: missionId,
          status_code: 401,
          error_code: "unauthenticated",
        },
      });
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
      .select("role, email")
      .eq("id", user.id)
      .single();

    // Récupérer la mission avec les informations nécessaires
    const { data: mission, error: missionError } = await supabaseService
      .from("missions")
      .select(`
        id,
        title,
        recruiter_id,
        establishment_id,
        end_date
      `)
      .eq("id", missionId)
      .single();

    if (missionError || !mission) {
      console.error("❌ Mission introuvable:", missionError);
      trackServerEvent({
        event: ANALYTICS_EVENTS.apiRequestFailed,
        distinctId: user.id,
        properties: {
          endpoint,
          request_id: requestId,
          mission_id: missionId,
          status_code: 404,
          error_code: "mission_not_found",
          user_id: user.id,
        },
      });
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
      trackServerEvent({
        event: ANALYTICS_EVENTS.apiRequestFailed,
        distinctId: user.id,
        properties: {
          endpoint,
          request_id: requestId,
          mission_id: missionId,
          status_code: 403,
          error_code: "forbidden",
          user_id: user.id,
        },
      });
      return NextResponse.json(
        {
          error:
            "Vous n'êtes pas autorisé à libérer les fonds de cette mission",
        },
        { status: 403 }
      );
    }

    // Récupérer le paiement en statut 'received' (ou 'paid' pour compatibilité)
    const { data: payment, error: paymentError } = await supabaseService
      .from("mission_payments")
      .select("*")
      .eq("mission_id", missionId)
      .in("status", ["received", "paid"]) // Compatibilité avec l'ancien statut
      .single();

    if (paymentError || !payment) {
      console.error("❌ Aucun paiement en attente de distribution trouvé");
      trackServerEvent({
        event: ANALYTICS_EVENTS.apiRequestFailed,
        distinctId: user.id,
        properties: {
          endpoint,
          request_id: requestId,
          mission_id: missionId,
          status_code: 400,
          error_code: "payment_not_found_or_invalid_state",
          user_id: user.id,
        },
      });
      return NextResponse.json(
        {
          error:
            "Aucun paiement en attente de distribution trouvé pour cette mission",
        },
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
      trackServerEvent({
        event: ANALYTICS_EVENTS.apiRequestFailed,
        distinctId: user.id,
        properties: {
          endpoint,
          request_id: requestId,
          mission_id: missionId,
          status_code: 400,
          error_code: "finance_not_found",
          user_id: user.id,
        },
      });
      return NextResponse.json(
        { error: "Informations financières introuvables" },
        { status: 400 }
      );
    }

    // Vérifier si les fonds ont déjà été libérés
    if (finance.status === "funds_released") {
      trackServerEvent({
        event: ANALYTICS_EVENTS.apiRequestFailed,
        distinctId: user.id,
        properties: {
          endpoint,
          request_id: requestId,
          mission_id: missionId,
          status_code: 400,
          error_code: "already_released",
          user_id: user.id,
        },
      });
      return NextResponse.json(
        { error: "Les fonds ont déjà été libérés" },
        { status: 400 }
      );
    }

    // Récupérer le recruteur pour les notifications
    const { data: recruiterProfile } = await supabaseService
      .from("profiles")
      .select("email, first_name, last_name")
      .eq("id", mission.recruiter_id)
      .single();

    const transfers: TransferResult[] = [];
    const notifications: Array<{
      type: "error" | "missing_stripe";
      recipient: string;
      details: string;
    }> = [];

    // ================================================================
    // RÉCUPÉRER LE CHARGE ID DEPUIS LE PAYMENT INTENT
    // Stripe Transfer nécessite un Charge ID, pas un PaymentIntent ID
    // ================================================================
    const chargeId = await getChargeIdFromPaymentIntent(
      payment.stripe_payment_intent_id
    );

    // ================================================================
    // TRANSFERT FREELANCE
    // ================================================================
    if (finance.freelancer_id && finance.freelancer_amount > 0) {
      const { data: freelanceProfile } = await supabaseService
        .from("profiles")
        .select("id, email, first_name, last_name, stripe_account_id, connect_payouts_enabled")
        .eq("id", finance.freelancer_id)
        .single();

      if (!freelanceProfile?.stripe_account_id) {
        // Pas de compte Stripe - skip et notifier
        console.warn(
          `⚠️ [Release] Freelance ${finance.freelancer_id} n'a pas de compte Stripe`
        );
        transfers.push({
          type: "freelancer_payout",
          profileId: finance.freelancer_id,
          accountId: "",
          amount: finance.freelancer_amount,
          status: "skipped",
          error: "Compte Stripe non configuré",
        });

        notifications.push({
          type: "missing_stripe",
          recipient: freelanceProfile?.email || finance.freelancer_id,
          details: `Le freelance ${freelanceProfile?.first_name || ""} ${freelanceProfile?.last_name || ""} n'a pas de compte Stripe configuré. Montant en attente: ${(finance.freelancer_amount / 100).toFixed(2)}€`,
        });
      } else if (!freelanceProfile.connect_payouts_enabled) {
        // Compte Stripe non activé pour les payouts
        console.warn(
          `⚠️ [Release] Freelance ${finance.freelancer_id} - payouts non activés`
        );
        transfers.push({
          type: "freelancer_payout",
          profileId: finance.freelancer_id,
          accountId: freelanceProfile.stripe_account_id,
          amount: finance.freelancer_amount,
          status: "skipped",
          error: "Payouts non activés sur le compte Stripe",
        });

        notifications.push({
          type: "missing_stripe",
          recipient: freelanceProfile.email,
          details: `Le compte Stripe du freelance ${freelanceProfile.first_name || ""} ${freelanceProfile.last_name || ""} n'est pas activé pour les virements. Montant en attente: ${(finance.freelancer_amount / 100).toFixed(2)}€`,
        });
      } else {
        // Compte Stripe valide - effectuer le transfert
        console.log(
          `🔄 [Release] Transfert freelance: ${finance.freelancer_amount} centimes`
        );

        const result = await attemptTransferWithRetry({
          amount: finance.freelancer_amount,
          currency: "eur",
          destinationAccountId: freelanceProfile.stripe_account_id,
          description: `Paiement mission: ${mission.title}`,
          metadata: {
            mission_id: missionId,
            mission_payment_id: payment.id,
            type: "freelancer_payout",
          },
          sourceTransaction: chargeId,
        });

        if (result.success) {
          transfers.push({
            type: "freelancer_payout",
            profileId: freelanceProfile.id,
            accountId: freelanceProfile.stripe_account_id,
            amount: finance.freelancer_amount,
            transferId: result.transferId,
            status: "created",
          });

          // Enregistrer le transfert réussi
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
            stripe_transfer_id: result.transferId,
            transferred_at: new Date().toISOString(),
          });

          console.log(`✅ [Release] Transfert freelance créé: ${result.transferId}`);
        } else {
          transfers.push({
            type: "freelancer_payout",
            profileId: freelanceProfile.id,
            accountId: freelanceProfile.stripe_account_id,
            amount: finance.freelancer_amount,
            status: "failed",
            error: result.error,
            retryCount: MAX_RETRIES,
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
            error_message: result.error,
          });

          notifications.push({
            type: "error",
            recipient: ADMIN_EMAIL,
            details: `Échec du transfert freelance après ${MAX_RETRIES} tentatives. Erreur: ${result.error}`,
          });
        }
      }
    }

    // ================================================================
    // TRANSFERT COMMERCIAL
    // ================================================================
    if (finance.commercial_id && finance.commercial_fee_amount > 0) {
      const { data: commercialProfile } = await supabaseService
        .from("profiles")
        .select("id, email, first_name, last_name, stripe_account_id, connect_payouts_enabled")
        .eq("id", finance.commercial_id)
        .single();

      if (!commercialProfile?.stripe_account_id) {
        console.warn(
          `⚠️ [Release] Commercial ${finance.commercial_id} n'a pas de compte Stripe`
        );
        transfers.push({
          type: "commercial_commission",
          profileId: finance.commercial_id,
          accountId: "",
          amount: finance.commercial_fee_amount,
          status: "skipped",
          error: "Compte Stripe non configuré",
        });

        notifications.push({
          type: "missing_stripe",
          recipient: commercialProfile?.email || finance.commercial_id,
          details: `Le commercial ${commercialProfile?.first_name || ""} ${commercialProfile?.last_name || ""} n'a pas de compte Stripe configuré. Commission en attente: ${(finance.commercial_fee_amount / 100).toFixed(2)}€`,
        });
      } else if (!commercialProfile.connect_payouts_enabled) {
        console.warn(
          `⚠️ [Release] Commercial ${finance.commercial_id} - payouts non activés`
        );
        transfers.push({
          type: "commercial_commission",
          profileId: finance.commercial_id,
          accountId: commercialProfile.stripe_account_id,
          amount: finance.commercial_fee_amount,
          status: "skipped",
          error: "Payouts non activés sur le compte Stripe",
        });

        notifications.push({
          type: "missing_stripe",
          recipient: commercialProfile.email,
          details: `Le compte Stripe du commercial ${commercialProfile.first_name || ""} ${commercialProfile.last_name || ""} n'est pas activé pour les virements. Commission en attente: ${(finance.commercial_fee_amount / 100).toFixed(2)}€`,
        });
      } else {
        console.log(
          `🔄 [Release] Transfert commercial: ${finance.commercial_fee_amount} centimes`
        );

        const result = await attemptTransferWithRetry({
          amount: finance.commercial_fee_amount,
          currency: "eur",
          destinationAccountId: commercialProfile.stripe_account_id,
          description: `Commission mission: ${mission.title}`,
          metadata: {
            mission_id: missionId,
            mission_payment_id: payment.id,
            type: "commercial_commission",
          },
          sourceTransaction: chargeId,
        });

        if (result.success) {
          transfers.push({
            type: "commercial_commission",
            profileId: commercialProfile.id,
            accountId: commercialProfile.stripe_account_id,
            amount: finance.commercial_fee_amount,
            transferId: result.transferId,
            status: "created",
          });

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
            stripe_transfer_id: result.transferId,
            transferred_at: new Date().toISOString(),
          });

          console.log(`✅ [Release] Transfert commercial créé: ${result.transferId}`);
        } else {
          transfers.push({
            type: "commercial_commission",
            profileId: commercialProfile.id,
            accountId: commercialProfile.stripe_account_id,
            amount: finance.commercial_fee_amount,
            status: "failed",
            error: result.error,
            retryCount: MAX_RETRIES,
          });

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
            error_message: result.error,
          });

          notifications.push({
            type: "error",
            recipient: ADMIN_EMAIL,
            details: `Échec du transfert commercial après ${MAX_RETRIES} tentatives. Erreur: ${result.error}`,
          });
        }
      }
    }

    // ================================================================
    // MISE À JOUR DES STATUTS
    // ================================================================
    const successTransfers = transfers.filter((t) => t.status === "created");
    const failedTransfers = transfers.filter((t) => t.status === "failed");
    const skippedTransfers = transfers.filter((t) => t.status === "skipped");

    // Déterminer le nouveau statut de mission_payments
    let paymentStatus: "distributed" | "errored" = "distributed";
    let financeStatus: "funds_released" | "partially_released" = "funds_released";

    if (failedTransfers.length > 0) {
      // Au moins un transfert a échoué après 3 retry
      paymentStatus = "errored";
      financeStatus = "partially_released";
    } else if (skippedTransfers.length > 0 && successTransfers.length > 0) {
      // Certains ont été payés, d'autres skippés (pas de Stripe)
      financeStatus = "partially_released";
    } else if (skippedTransfers.length > 0 && successTransfers.length === 0) {
      // Tous skippés (aucun n'a de Stripe)
      paymentStatus = "errored";
      financeStatus = "partially_released";
    }

    // Mettre à jour mission_payments
    await supabaseService
      .from("mission_payments")
      .update({
        status: paymentStatus,
        distributed_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    // Mettre à jour mission_finance
    await supabaseService
      .from("mission_finance")
      .update({ status: financeStatus })
      .eq("id", finance.id);

    console.log(
      `✅ [Release] Terminé - Payment: ${paymentStatus}, Finance: ${financeStatus}`
    );
    console.log(
      `📊 [Release] Résumé: ${successTransfers.length} réussis, ${failedTransfers.length} échoués, ${skippedTransfers.length} skippés`
    );

    // ================================================================
    // ENVOI DES NOTIFICATIONS
    // ================================================================
    if (notifications.length > 0) {
      // Notifier le recruteur
      if (recruiterProfile?.email) {
        for (const notif of notifications) {
          await sendNotification({
            type: notif.type,
            recipients: [recruiterProfile.email, ADMIN_EMAIL],
            missionId,
            missionTitle: mission.title,
            details: notif.details,
          });
        }
      }
    }

    trackServerEvent({
      event: ANALYTICS_EVENTS.apiRequestSuccess,
      distinctId: user.id,
      properties: {
        endpoint,
        request_id: requestId,
        mission_id: missionId,
        status_code: 200,
        user_id: user.id,
        success: failedTransfers.length === 0,
      },
    });
    return NextResponse.json({
      success: failedTransfers.length === 0,
      paymentStatus,
      financeStatus,
      transfers: transfers.map((t) => ({
        type: t.type,
        amount: t.amount,
        status: t.status,
        transfer_id: t.transferId,
        error: t.error,
      })),
      summary: {
        successful: successTransfers.length,
        failed: failedTransfers.length,
        skipped: skippedTransfers.length,
      },
    });
  } catch (error) {
    console.error("❌ [Release] Erreur lors de la libération des fonds:", error);
    trackServerEvent({
      event: ANALYTICS_EVENTS.apiRequestFailed,
      properties: {
        endpoint,
        request_id: requestId,
        mission_id: missionId,
        status_code: 500,
        error_code: "exception",
      },
    });
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
