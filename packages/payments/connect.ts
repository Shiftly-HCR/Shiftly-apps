/**
 * Stripe Connect - Fonctions pour gérer les comptes Connect Express
 * et les transfers vers les freelances et commerciaux
 */

import Stripe from "stripe";
import { getStripeClient } from "./index";

// ============================================
// Types
// ============================================

export interface CreateConnectAccountParams {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  country?: string;
}

export interface CreateAccountLinkParams {
  stripeAccountId: string;
  returnUrl: string;
  refreshUrl: string;
}

export interface CreateTransferParams {
  amount: number; // En centimes
  currency?: string;
  destinationAccountId: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface CalculateFinanceParams {
  grossAmount: number; // En centimes
  hasCommercial: boolean;
}

export interface FinanceBreakdown {
  grossAmount: number;
  freelancerAmount: number; // 85%
  platformFeeAmount: number; // 15% total
  commercialFeeAmount: number; // 4% si commercial, sinon 0
  platformNetAmount: number; // 15% sans commercial, 11% avec commercial
}

// ============================================
// Constantes
// ============================================

export const PLATFORM_FEE_PERCENT = 15; // 15% total pour la plateforme
export const FREELANCER_PERCENT = 85; // 85% pour le freelance
export const COMMERCIAL_COMMISSION_PERCENT = 4; // 4% pour le commercial

// ============================================
// Fonctions Connect Account
// ============================================

/**
 * Crée un compte Stripe Connect Express
 */
export async function createConnectAccount(
  params: CreateConnectAccountParams
): Promise<Stripe.Account> {
  const stripe = getStripeClient();

  console.log(`🔗 [Connect] Création compte Express pour ${params.email}`);

  const account = await stripe.accounts.create({
    type: "express",
    country: params.country || "FR",
    email: params.email,
    capabilities: {
      transfers: { requested: true },
    },
    metadata: {
      userId: params.userId,
    },
    business_profile: {
      mcc: "7999", // Recreation services
      product_description: "Missions freelance HCR",
    },
    settings: {
      payouts: {
        schedule: {
          interval: "manual", // Payouts manuels pour contrôle
        },
      },
    },
  });

  console.log(`✅ [Connect] Compte créé: ${account.id}`);

  return account;
}

/**
 * Crée un Account Link pour l'onboarding
 */
export async function createAccountLink(
  params: CreateAccountLinkParams
): Promise<Stripe.AccountLink> {
  const stripe = getStripeClient();

  console.log(`🔗 [Connect] Création Account Link pour ${params.stripeAccountId}`);

  const accountLink = await stripe.accountLinks.create({
    account: params.stripeAccountId,
    refresh_url: params.refreshUrl,
    return_url: params.returnUrl,
    type: "account_onboarding",
    collect: "eventually_due",
  });

  console.log(`✅ [Connect] Account Link créé, expire à ${new Date(accountLink.expires_at * 1000).toISOString()}`);

  return accountLink;
}

/**
 * Récupère un compte Connect
 */
export async function getConnectAccount(
  stripeAccountId: string
): Promise<Stripe.Account> {
  const stripe = getStripeClient();

  return await stripe.accounts.retrieve(stripeAccountId);
}

/**
 * Vérifie si un compte Connect est prêt pour les transfers
 */
export function isAccountReadyForTransfers(account: Stripe.Account): boolean {
  return (
    account.payouts_enabled === true ||
    account.capabilities?.transfers === "active"
  );
}

// ============================================
// Fonctions Transfers
// ============================================

/**
 * Crée un transfer vers un compte Connect
 */
export async function createTransfer(
  params: CreateTransferParams
): Promise<Stripe.Transfer> {
  const stripe = getStripeClient();

  console.log(
    `💸 [Transfer] Création transfer de ${params.amount} centimes vers ${params.destinationAccountId}`
  );

  const transfer = await stripe.transfers.create({
    amount: params.amount,
    currency: params.currency || "eur",
    destination: params.destinationAccountId,
    description: params.description,
    metadata: params.metadata,
  });

  console.log(`✅ [Transfer] Transfer créé: ${transfer.id}`);

  return transfer;
}

// ============================================
// Fonctions de calcul financier
// ============================================

/**
 * Calcule la répartition des fonds pour une mission
 * 
 * - Freelance: 85%
 * - Plateforme: 15% total
 *   - Si commercial: 4% commercial + 11% plateforme
 *   - Si pas de commercial: 15% plateforme
 */
export function calculateFinanceBreakdown(
  params: CalculateFinanceParams
): FinanceBreakdown {
  const { grossAmount, hasCommercial } = params;

  // 85% pour le freelance (arrondi inférieur)
  const freelancerAmount = Math.floor(grossAmount * FREELANCER_PERCENT / 100);

  // 15% total de frais plateforme
  const platformFeeAmount = grossAmount - freelancerAmount;

  let commercialFeeAmount = 0;
  let platformNetAmount = platformFeeAmount;

  if (hasCommercial) {
    // 4% pour le commercial
    commercialFeeAmount = Math.floor(grossAmount * COMMERCIAL_COMMISSION_PERCENT / 100);
    // Le reste (11%) pour la plateforme
    platformNetAmount = platformFeeAmount - commercialFeeAmount;
  }

  // Vérification: freelancer + platform_net + commercial = gross
  const total = freelancerAmount + platformNetAmount + commercialFeeAmount;
  if (total !== grossAmount) {
    // Ajuster platformNetAmount pour absorber les erreurs d'arrondi
    platformNetAmount += grossAmount - total;
  }

  console.log(`📊 [Finance] Breakdown pour ${grossAmount} centimes:`, {
    freelancerAmount,
    platformFeeAmount,
    commercialFeeAmount,
    platformNetAmount,
    hasCommercial,
  });

  return {
    grossAmount,
    freelancerAmount,
    platformFeeAmount,
    commercialFeeAmount,
    platformNetAmount,
  };
}

// ============================================
// Fonctions Checkout pour missions
// ============================================

export interface CreateMissionCheckoutParams {
  missionId: string;
  recruiterId: string;
  recruiterEmail?: string;
  customerId?: string;
  amount: number; // En centimes
  missionTitle: string;
  establishmentId?: string;
  successUrl: string;
  cancelUrl: string;
}

/**
 * Crée une session Checkout pour le paiement d'une mission
 */
export async function createMissionCheckoutSession(
  params: CreateMissionCheckoutParams
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripeClient();

  console.log(
    `🛒 [Checkout] Création session pour mission ${params.missionId}, montant: ${params.amount} centimes`
  );

  const metadata: Stripe.MetadataParam = {
    type: "mission_payment",
    mission_id: params.missionId,
    recruiter_id: params.recruiterId,
  };

  if (params.establishmentId) {
    metadata.establishment_id = params.establishmentId;
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "eur",
          unit_amount: params.amount,
          product_data: {
            name: `Mission: ${params.missionTitle}`,
            description: "Paiement de la mission via Shiftly",
          },
        },
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    customer: params.customerId,
    customer_email: params.customerId ? undefined : params.recruiterEmail,
    client_reference_id: params.recruiterId,
    metadata,
    payment_intent_data: {
      metadata,
      // Capture immédiate, on retient les fonds sur le compte plateforme
      capture_method: "automatic",
    },
  });

  console.log(`✅ [Checkout] Session créée: ${session.id}`);

  return session;
}
