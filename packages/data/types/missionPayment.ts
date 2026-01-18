/**
 * Types pour les paiements de missions (Stripe Connect)
 */

export type PaymentStatus =
  | "pending" // En attente de paiement
  | "received" // Paiement reçu par Stripe, fonds en attente
  | "distributed" // Fonds distribués au freelance/commercial
  | "errored" // Erreur lors de la distribution (après 3 retry)
  | "failed" // Échec du paiement initial
  | "refunded"; // Remboursé

export type TransferStatus =
  | "pending" // En attente de transfert
  | "created" // Transfert créé sur Stripe
  | "failed" // Échec du transfert
  | "reversed"; // Transfert annulé/inversé
export type TransferType = "freelancer_payout" | "commercial_commission";
export type FinanceStatus =
  | "calculated"
  | "funds_released"
  | "partially_released";
export type ConnectOnboardingStatus = "not_started" | "pending" | "complete";

/**
 * Paiement d'une mission via Stripe Checkout
 */
export interface MissionPayment {
  id: string;
  mission_id: string;
  recruiter_id?: string;
  amount: number; // En centimes
  currency: string;
  status: PaymentStatus;
  stripe_checkout_session_id?: string;
  stripe_payment_intent_id?: string;
  paid_at?: string;
  distributed_at?: string; // Date de distribution des fonds
  created_at: string;
  updated_at?: string;
}

/**
 * Snapshot des répartitions financières pour un paiement
 */
export interface MissionFinance {
  id: string;
  mission_id: string;
  mission_payment_id: string;
  gross_amount: number; // Montant brut en centimes
  platform_fee_amount: number; // Commission plateforme totale (15%)
  commercial_fee_amount: number; // Commission commercial (4% si applicable)
  freelancer_amount: number; // Part freelance (85%)
  platform_net_amount: number; // Part nette plateforme (15% ou 11%) MOINS frais Stripe
  stripe_fee_amount: number; // Frais Stripe réels en centimes
  commercial_id?: string;
  freelancer_id?: string;
  status: FinanceStatus;
  created_at: string;
}

/**
 * Transfert Stripe vers un compte Connect
 */
export interface MissionTransfer {
  id: string;
  mission_id: string;
  mission_payment_id: string;
  mission_finance_id?: string;
  destination_profile_id: string;
  destination_stripe_account_id: string;
  type: TransferType;
  amount: number; // En centimes
  currency: string;
  status: TransferStatus;
  stripe_transfer_id?: string;
  error_message?: string;
  created_at: string;
  transferred_at?: string;
}

/**
 * Champs Stripe Connect ajoutés au profil
 */
export interface ProfileConnectFields {
  stripe_account_id?: string;
  connect_onboarding_status: ConnectOnboardingStatus;
  connect_payouts_enabled: boolean;
  connect_charges_enabled: boolean;
  connect_requirements_due?: Record<string, unknown>;
}

/**
 * Constantes de répartition des fonds
 */
export const FUND_DISTRIBUTION = {
  FREELANCER_PERCENTAGE: 85,
  PLATFORM_TOTAL_PERCENTAGE: 15,
  COMMERCIAL_PERCENTAGE: 4,
  PLATFORM_NET_WITH_COMMERCIAL: 11, // 15% - 4%
} as const;

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
  const freelancerAmount = Math.floor(
    (grossAmount * FUND_DISTRIBUTION.FREELANCER_PERCENTAGE) / 100
  );
  const platformFeeAmount = Math.floor(
    (grossAmount * FUND_DISTRIBUTION.PLATFORM_TOTAL_PERCENTAGE) / 100
  );

  let commercialFeeAmount = 0;
  let platformNetAmount = platformFeeAmount;

  if (hasCommercial) {
    commercialFeeAmount = Math.floor(
      (grossAmount * FUND_DISTRIBUTION.COMMERCIAL_PERCENTAGE) / 100
    );
    platformNetAmount = platformFeeAmount - commercialFeeAmount;
  }

  return {
    freelancerAmount,
    platformFeeAmount,
    commercialFeeAmount,
    platformNetAmount,
  };
}
