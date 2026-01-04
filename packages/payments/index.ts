import Stripe from "stripe";
import {
  SUBSCRIPTION_PLANS,
  subscriptionPlansById,
  type SubscriptionPlanId,
  type SubscriptionPlan,
} from "./plans";

const STRIPE_API_VERSION: Stripe.LatestApiVersion = "2024-06-20";

let stripeClient: Stripe | null = null;

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";

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

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [lineItem],
    allow_promotion_codes: true,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    customer_email: params.customerEmail,
    customer: params.customerId,
    metadata,
    subscription_data: {
      metadata,
    },
  });

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

export { SUBSCRIPTION_PLANS, subscriptionPlansById };
export type { SubscriptionPlanId, SubscriptionPlan };
