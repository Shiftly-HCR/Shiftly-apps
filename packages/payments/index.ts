import Stripe from "stripe";
import {
  SUBSCRIPTION_PLANS,
  subscriptionPlansById,
  type SubscriptionPlanId,
  type SubscriptionPlan,
} from "./plans";

const STRIPE_API_VERSION: Stripe.LatestApiVersion = "2025-02-24.acacia";

let stripeClient: Stripe | null = null;

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";

// ============================================================================
// CONSTANTES DE DISTRIBUTION DES FONDS
// ============================================================================

export const FUND_DISTRIBUTION = {
  FREELANCER_PERCENTAGE: 85,
  PLATFORM_TOTAL_PERCENTAGE: 15,
  COMMERCIAL_PERCENTAGE: 4,
  PLATFORM_NET_WITH_COMMERCIAL: 11, // 15% - 4%
} as const;

function getPriceId(planId: SubscriptionPlanId): string | undefined {
  switch (planId) {
    case "establishment":
      return process.env.STRIPE_PRICE_ESTABLISHMENT;
    case "establishment-annual":
      return process.env.STRIPE_PRICE_ESTABLISHMENT_ANNUAL;
    case "freelance-student":
      return process.env.STRIPE_PRICE_FREELANCE_STUDENT;
    case "freelance-student-annual":
      return process.env.STRIPE_PRICE_FREELANCE_STUDENT_ANNUAL;
    case "freelance-classic":
      return process.env.STRIPE_PRICE_FREELANCE_CLASSIC;
    case "freelance-classic-annual":
      return process.env.STRIPE_PRICE_FREELANCE_CLASSIC_ANNUAL;
    default:
      return undefined;
  }
}

export function getStripeClient(): Stripe {
  if (!stripeClient) {
    if (!stripeSecretKey) {
      throw new Error(
        "Stripe n'est pas configuré : STRIPE_SECRET_KEY est manquante."
      );
    }

    stripeClient = new Stripe(stripeSecretKey, {
      apiVersion: STRIPE_API_VERSION,
    });
  }

  return stripeClient;
}

export interface CheckoutSessionParams {
  planId: SubscriptionPlanId;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  customerId?: string;
  userId?: string;
}

export interface CheckoutSessionResult {
  url: string | null;
  session: Stripe.Checkout.Session;
  plan: SubscriptionPlan;
}

export async function createCheckoutSession(
  params: CheckoutSessionParams
): Promise<CheckoutSessionResult> {
  const stripe = getStripeClient();
  const plan = subscriptionPlansById[params.planId];

  if (!plan) {
    throw new Error(`Plan '${params.planId}' introuvable`);
  }

  const priceId = getPriceId(params.planId);

  // Déterminer l'intervalle de facturation selon le plan
  const billingInterval: "month" | "year" =
    plan.billingPeriod === "annual" ? "year" : "month";

  const lineItem: Stripe.Checkout.SessionCreateParams.LineItem =
    priceId !== undefined
      ? {
          price: priceId,
          quantity: 1,
        }
      : {
          price_data: {
            currency: plan.currency,
            unit_amount: plan.priceCents,
            product_data: {
              name: `Shiftly - ${plan.name}${plan.billingPeriod === "annual" ? " (Annuel)" : ""}`,
            },
            recurring: {
              interval: billingInterval,
            },
          },
          quantity: 1,
        };

  // Construire les metadata (ne pas inclure userId si undefined)
  const metadata: Stripe.MetadataParam = {
    planId: params.planId,
  };
  if (params.userId) {
    metadata.userId = params.userId;
  }

  // Construire subscription_data.metadata avec userId et planId
  const subscriptionMetadata: Stripe.MetadataParam = {
    planId: params.planId,
  };
  if (params.userId) {
    subscriptionMetadata.userId = params.userId;
  }

  console.log(`📋 [createCheckoutSession] Métadonnées créées:`, metadata);
  console.log(
    `📋 [createCheckoutSession] subscription_data.metadata:`,
    subscriptionMetadata
  );
  console.log(`📋 [createCheckoutSession] PlanId:`, params.planId);
  console.log(`📋 [createCheckoutSession] userId:`, params.userId);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [lineItem],
    allow_promotion_codes: true,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    customer_email: params.customerEmail,
    customer: params.customerId,
    client_reference_id: params.userId || undefined, // Important: pour retrouver userId dans les webhooks
    metadata, // Metadata au niveau session (double sécurité)
    subscription_data: {
      metadata: subscriptionMetadata, // IMPORTANT: Les métadonnées doivent être dans subscription_data pour être propagées à la subscription
    },
  });

  console.log(
    `📋 [createCheckoutSession] Session créée avec metadata:`,
    session.metadata
  );

  return {
    url: session.url,
    session,
    plan,
  };
}

export function constructWebhookEvent(
  payload: Buffer | string,
  signature: string,
  webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ""
): Stripe.Event {
  if (!webhookSecret) {
    throw new Error(
      "Stripe webhook non configuré : STRIPE_WEBHOOK_SECRET est manquante."
    );
  }

  return getStripeClient().webhooks.constructEvent(
    payload,
    signature,
    webhookSecret
  );
}

// ============================================================================
// STRIPE CONNECT - FONCTIONS
// ============================================================================

export interface CreateConnectAccountParams {
  email: string;
  country?: string;
  businessType?: Stripe.AccountCreateParams.BusinessType;
  metadata?: Stripe.MetadataParam;
}

export interface CreateConnectAccountResult {
  accountId: string;
  account: Stripe.Account;
}

/**
 * Crée un compte Stripe Connect Express
 */
export async function createConnectAccount(
  params: CreateConnectAccountParams
): Promise<CreateConnectAccountResult> {
  const stripe = getStripeClient();

  console.log(`🔄 [createConnectAccount] Création du compte Connect pour ${params.email}`);

  const account = await stripe.accounts.create({
    type: "express",
    country: params.country || "FR",
    email: params.email,
    business_type: params.businessType || "individual",
    capabilities: {
      transfers: { requested: true },
    },
    metadata: params.metadata,
  });

  console.log(`✅ [createConnectAccount] Compte créé: ${account.id}`);

  return {
    accountId: account.id,
    account,
  };
}

export interface CreateAccountLinkParams {
  accountId: string;
  refreshUrl: string;
  returnUrl: string;
  type?: Stripe.AccountLinkCreateParams.Type;
}

export interface CreateAccountLinkResult {
  url: string;
  accountLink: Stripe.AccountLink;
}

/**
 * Crée un lien d'onboarding pour un compte Connect
 */
export async function createAccountLink(
  params: CreateAccountLinkParams
): Promise<CreateAccountLinkResult> {
  const stripe = getStripeClient();

  console.log(`🔄 [createAccountLink] Création du lien onboarding pour ${params.accountId}`);

  const accountLink = await stripe.accountLinks.create({
    account: params.accountId,
    refresh_url: params.refreshUrl,
    return_url: params.returnUrl,
    type: params.type || "account_onboarding",
  });

  console.log(`✅ [createAccountLink] Lien créé: ${accountLink.url}`);

  return {
    url: accountLink.url,
    accountLink,
  };
}

/**
 * Récupère les informations d'un compte Connect
 */
export async function getConnectAccount(
  accountId: string
): Promise<Stripe.Account> {
  const stripe = getStripeClient();
  return stripe.accounts.retrieve(accountId);
}

// ============================================================================
// MISSION CHECKOUT - FONCTIONS
// ============================================================================

export interface CreateMissionCheckoutParams {
  amount: number; // En centimes
  currency?: string;
  missionId: string;
  missionTitle: string;
  recruiterId: string;
  establishmentId?: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  customerId?: string;
}

export interface CreateMissionCheckoutResult {
  url: string | null;
  session: Stripe.Checkout.Session;
  sessionId: string;
}

/**
 * Crée une session de checkout pour le paiement d'une mission
 * Mode: payment (pas subscription)
 */
export async function createMissionCheckoutSession(
  params: CreateMissionCheckoutParams
): Promise<CreateMissionCheckoutResult> {
  const stripe = getStripeClient();

  console.log(`🔄 [createMissionCheckoutSession] Création checkout pour mission ${params.missionId}`);
  console.log(`💰 Montant: ${params.amount} centimes (${params.amount / 100} EUR)`);

  const metadata: Stripe.MetadataParam = {
    type: "mission_payment",
    mission_id: params.missionId,
    recruiter_id: params.recruiterId,
  };

  if (params.establishmentId) {
    metadata.establishment_id = params.establishmentId;
  }

  // Stripe n'accepte que customer OU customer_email, pas les deux
  // Prioriser customer si disponible
  const customerConfig: { customer?: string; customer_email?: string } = {};
  if (params.customerId) {
    customerConfig.customer = params.customerId;
  } else if (params.customerEmail) {
    customerConfig.customer_email = params.customerEmail;
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: params.currency || "eur",
          unit_amount: params.amount,
          product_data: {
            name: `Mission: ${params.missionTitle}`,
            description: `Paiement pour la mission ${params.missionId}`,
          },
        },
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    ...customerConfig,
    metadata,
    payment_intent_data: {
      metadata, // Propager les metadata au PaymentIntent
    },
  });

  console.log(`✅ [createMissionCheckoutSession] Session créée: ${session.id}`);

  return {
    url: session.url,
    session,
    sessionId: session.id,
  };
}

// ============================================================================
// TRANSFERS - FONCTIONS
// ============================================================================

export interface CreateTransferParams {
  amount: number; // En centimes
  currency?: string;
  destinationAccountId: string;
  description?: string;
  metadata?: Stripe.MetadataParam;
  sourceTransaction?: string; // PaymentIntent ID pour lier le transfer
}

export interface CreateTransferResult {
  transferId: string;
  transfer: Stripe.Transfer;
}

/**
 * Crée un transfert vers un compte Connect
 */
export async function createTransfer(
  params: CreateTransferParams
): Promise<CreateTransferResult> {
  const stripe = getStripeClient();

  console.log(`🔄 [createTransfer] Transfert de ${params.amount} centimes vers ${params.destinationAccountId}`);

  const transferData: Stripe.TransferCreateParams = {
    amount: params.amount,
    currency: params.currency || "eur",
    destination: params.destinationAccountId,
    description: params.description,
    metadata: params.metadata,
  };

  // Si on a un sourceTransaction, on le lie au transfert
  if (params.sourceTransaction) {
    transferData.source_transaction = params.sourceTransaction;
  }

  const transfer = await stripe.transfers.create(transferData);

  console.log(`✅ [createTransfer] Transfert créé: ${transfer.id}`);

  return {
    transferId: transfer.id,
    transfer,
  };
}

/**
 * Calcule la répartition des fonds pour un montant donné
 */
export function calculateFundDistribution(
  grossAmount: number,
  hasCommercial: boolean
): {
  freelancerAmount: number;
  platformFeeAmount: number;
  commercialFeeAmount: number;
  platformNetAmount: number;
} {
  const freelancerAmount = Math.floor((grossAmount * FUND_DISTRIBUTION.FREELANCER_PERCENTAGE) / 100);
  const platformFeeAmount = Math.floor((grossAmount * FUND_DISTRIBUTION.PLATFORM_TOTAL_PERCENTAGE) / 100);

  let commercialFeeAmount = 0;
  let platformNetAmount = platformFeeAmount;

  if (hasCommercial) {
    commercialFeeAmount = Math.floor((grossAmount * FUND_DISTRIBUTION.COMMERCIAL_PERCENTAGE) / 100);
    platformNetAmount = platformFeeAmount - commercialFeeAmount;
  }

  return {
    freelancerAmount,
    platformFeeAmount,
    commercialFeeAmount,
    platformNetAmount,
  };
}

/**
 * Récupère un PaymentIntent par son ID
 */
export async function getPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  const stripe = getStripeClient();
  return stripe.paymentIntents.retrieve(paymentIntentId);
}

/**
 * Récupère une Checkout Session par son ID
 */
export async function getCheckoutSession(
  sessionId: string
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripeClient();
  return stripe.checkout.sessions.retrieve(sessionId);
}

export { SUBSCRIPTION_PLANS, subscriptionPlansById };
export type { SubscriptionPlanId, SubscriptionPlan };

// Note: Les fonctions Connect sont définies directement dans ce fichier (index.ts)
// Ne pas réexporter depuis connect.ts car les types sont différents
