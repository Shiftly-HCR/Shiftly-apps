/**
 * Handlers pour les webhooks Stripe
 * Gère la synchronisation de l'état d'abonnement avec Supabase
 */

import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import type { SubscriptionStatus } from "@shiftly/data";

// Client Supabase avec service role pour les webhooks (bypass RLS)
function getSupabaseServiceRole() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

  if (!supabaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_URL manquante. " +
        "Vérifiez vos variables d'environnement."
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY ou SUPABASE_SERVICE_ROLE manquante. " +
        "Cette variable est requise pour les webhooks Stripe. " +
        "Ajoutez-la dans votre fichier .env.local avec la clé service_role de Supabase."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Vérifie si un event Stripe a déjà été traité (idempotence)
 */
async function isEventProcessed(eventId: string): Promise<boolean> {
  const supabase = getSupabaseServiceRole();
  const { data, error } = await supabase
    .from("stripe_events")
    .select("event_id")
    .eq("event_id", eventId)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = not found, c'est OK
    console.error("Erreur lors de la vérification de l'event:", error);
    // En cas d'erreur, on continue (évite de bloquer les webhooks)
    return false;
  }

  return !!data;
}

/**
 * Marque un event comme traité
 */
async function markEventAsProcessed(
  eventId: string,
  eventType: string
): Promise<void> {
  try {
    const supabase = getSupabaseServiceRole();
    const { error } = await supabase.from("stripe_events").insert({
      event_id: eventId,
      event_type: eventType,
      processed_at: new Date().toISOString(),
    });

    if (error) {
      console.error(
        "❌ Erreur lors du marquage de l'event comme traité:",
        error
      );
      // Ne pas throw pour éviter de bloquer le traitement
    } else {
      console.log(`✅ Event ${eventId} marqué comme traité`);
    }
  } catch (err) {
    console.error("❌ Exception lors du marquage de l'event:", err);
    // Ne pas throw pour éviter de bloquer le traitement
  }
}

/**
 * Calcule is_premium basé sur le status de l'abonnement
 */
function calculateIsPremium(
  status: SubscriptionStatus | null | undefined
): boolean {
  return status === "active" || status === "trialing";
}

/**
 * Met à jour le profil avec les informations de l'abonnement Stripe
 */
async function updateProfileSubscription(
  userId: string,
  subscriptionData: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    status?: SubscriptionStatus;
    currentPeriodEnd?: Date;
    cancelAtPeriodEnd?: boolean;
    priceId?: string;
    planId?: string;
  }
): Promise<void> {
  console.log(
    `🔄 Mise à jour du profil pour l'utilisateur ${userId}:`,
    subscriptionData
  );

  const supabase = getSupabaseServiceRole();

  const updateData: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (subscriptionData.stripeCustomerId !== undefined) {
    updateData.stripe_customer_id = subscriptionData.stripeCustomerId;
  }

  if (subscriptionData.stripeSubscriptionId !== undefined) {
    updateData.stripe_subscription_id = subscriptionData.stripeSubscriptionId;
  }

  if (subscriptionData.status !== undefined) {
    updateData.subscription_status = subscriptionData.status;
    // Calculer is_premium automatiquement
    updateData.is_premium = calculateIsPremium(subscriptionData.status);
  }

  if (subscriptionData.currentPeriodEnd !== undefined) {
    updateData.current_period_end =
      subscriptionData.currentPeriodEnd.toISOString();
  }

  if (subscriptionData.cancelAtPeriodEnd !== undefined) {
    updateData.cancel_at_period_end = subscriptionData.cancelAtPeriodEnd;
  }

  if (subscriptionData.priceId !== undefined) {
    updateData.subscription_price_id = subscriptionData.priceId;
  }

  if (subscriptionData.planId !== undefined) {
    updateData.subscription_plan_id = subscriptionData.planId;
  }

  console.log(`📝 Données à mettre à jour:`, updateData);

  const { data, error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", userId)
    .select();

  if (error) {
    console.error("❌ Erreur lors de la mise à jour du profil:", error);
    console.error("Détails de l'erreur:", JSON.stringify(error, null, 2));
    throw new Error(
      `Erreur lors de la mise à jour du profil: ${error.message}`
    );
  }

  console.log(`✅ Profil mis à jour avec succès:`, data);
}

/**
 * Récupère le userId depuis les metadata d'un objet Stripe
 */
function getUserIdFromMetadata(
  metadata: Stripe.Metadata | null | undefined
): string | null {
  if (!metadata) return null;
  return metadata.userId || metadata.user_id || null;
}

/**
 * Handler pour checkout.session.completed
 */
export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  console.log(`🛒 Traitement checkout.session.completed: ${session.id}`);

  let userId = getUserIdFromMetadata(session.metadata);
  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id;

  console.log(`📋 Metadata de la session:`, {
    userId,
    customerId,
    subscription: session.subscription,
    metadata: session.metadata,
  });

  // Si userId n'est pas dans les metadata, essayer de le récupérer depuis customer_id
  if (!userId && customerId) {
    console.log(
      `🔍 userId manquant dans metadata, recherche via customer_id: ${customerId}`
    );
    const supabase = getSupabaseServiceRole();
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();

    if (profile) {
      userId = profile.id;
      console.log(`✅ userId trouvé via customer_id: ${userId}`);
    }
  }

  if (!userId) {
    console.warn(
      "⚠️ checkout.session.completed: userId manquant dans les metadata et impossible de le récupérer via customer_id",
      {
        sessionId: session.id,
        metadata: session.metadata,
        customerId,
      }
    );
    return;
  }

  // Si c'est une session de subscription, on va mettre à jour avec subscription.created
  // Sinon, on met juste à jour le customer_id
  if (customerId) {
    console.log(
      `💳 Mise à jour du customer_id: ${customerId} pour l'utilisateur: ${userId}`
    );
    await updateProfileSubscription(userId, {
      stripeCustomerId: customerId,
    });
    console.log(`✅ Customer ID mis à jour avec succès`);
  }

  // Si on a le subscription_id, on peut aussi le mettre à jour
  if (session.subscription) {
    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription.id;
    console.log(
      `📦 Mise à jour du subscription_id: ${subscriptionId} pour l'utilisateur: ${userId}`
    );
    await updateProfileSubscription(userId, {
      stripeSubscriptionId: subscriptionId,
    });
    console.log(`✅ Subscription ID mis à jour avec succès`);
  }
}

/**
 * Handler pour customer.subscription.created
 */
export async function handleSubscriptionCreated(
  subscription: Stripe.Subscription
): Promise<void> {
  const userId = getUserIdFromMetadata(subscription.metadata);
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id;

  if (!userId) {
    console.warn(
      "customer.subscription.created: userId manquant dans les metadata",
      {
        subscriptionId: subscription.id,
      }
    );
    return;
  }

  const priceId = subscription.items.data[0]?.price.id;
  const planId = subscription.metadata?.planId || null;

  await updateProfileSubscription(userId, {
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    status: subscription.status as SubscriptionStatus,
    currentPeriodEnd: subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000)
      : undefined,
    cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
    priceId: priceId,
    planId: planId || undefined,
  });
}

/**
 * Handler pour customer.subscription.updated
 */
export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
): Promise<void> {
  const userId = getUserIdFromMetadata(subscription.metadata);
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id;

  if (!userId && !customerId) {
    console.warn(
      "customer.subscription.updated: userId et customerId manquants",
      {
        subscriptionId: subscription.id,
      }
    );
    return;
  }

  // Si on n'a pas userId dans metadata, on le récupère depuis le customer_id
  let finalUserId = userId;
  if (!finalUserId && customerId) {
    const supabase = getSupabaseServiceRole();
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .single();
    finalUserId = data?.id || null;
  }

  if (!finalUserId) {
    console.warn(
      "customer.subscription.updated: impossible de trouver l'utilisateur",
      {
        subscriptionId: subscription.id,
        customerId,
      }
    );
    return;
  }

  const priceId = subscription.items.data[0]?.price.id;
  const planId = subscription.metadata?.planId || null;

  await updateProfileSubscription(finalUserId, {
    stripeSubscriptionId: subscription.id,
    status: subscription.status as SubscriptionStatus,
    currentPeriodEnd: subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000)
      : undefined,
    cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
    priceId: priceId,
    planId: planId || undefined,
  });
}

/**
 * Handler pour customer.subscription.deleted
 */
export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<void> {
  const userId = getUserIdFromMetadata(subscription.metadata);
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id;

  if (!userId && !customerId) {
    console.warn(
      "customer.subscription.deleted: userId et customerId manquants",
      {
        subscriptionId: subscription.id,
      }
    );
    return;
  }

  // Si on n'a pas userId dans metadata, on le récupère depuis le customer_id
  let finalUserId = userId;
  if (!finalUserId && customerId) {
    const supabase = getSupabaseServiceRole();
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .single();
    finalUserId = data?.id || null;
  }

  if (!finalUserId) {
    console.warn(
      "customer.subscription.deleted: impossible de trouver l'utilisateur",
      {
        subscriptionId: subscription.id,
        customerId,
      }
    );
    return;
  }

  await updateProfileSubscription(finalUserId, {
    stripeSubscriptionId: undefined,
    status: "canceled",
    cancelAtPeriodEnd: false,
  });
}

/**
 * Handler pour invoice.paid
 */
export async function handleInvoicePaid(
  invoice: Stripe.Invoice
): Promise<void> {
  const subscriptionId =
    typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription?.id;

  if (!subscriptionId) {
    // Pas une facture d'abonnement
    return;
  }

  // Récupérer le profil via subscription_id
  const supabase = getSupabaseServiceRole();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("stripe_subscription_id", subscriptionId)
    .single();

  if (!profile) {
    console.warn("invoice.paid: profil introuvable pour subscription_id", {
      subscriptionId,
      invoiceId: invoice.id,
    });
    return;
  }

  // Mettre à jour current_period_end si on a l'info dans l'invoice
  if (invoice.period_end) {
    await updateProfileSubscription(profile.id, {
      currentPeriodEnd: new Date(invoice.period_end * 1000),
      status: "active", // Si la facture est payée, l'abonnement est actif
    });
  }
}

/**
 * Handler pour invoice.payment_failed
 */
export async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice
): Promise<void> {
  const subscriptionId =
    typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription?.id;

  if (!subscriptionId) {
    // Pas une facture d'abonnement
    return;
  }

  // Récupérer le profil via subscription_id
  const supabase = getSupabaseServiceRole();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("stripe_subscription_id", subscriptionId)
    .single();

  if (!profile) {
    console.warn(
      "invoice.payment_failed: profil introuvable pour subscription_id",
      {
        subscriptionId,
        invoiceId: invoice.id,
      }
    );
    return;
  }

  // Mettre à jour le statut vers past_due ou unpaid selon la situation
  // On pourrait aussi récupérer le statut de la subscription pour être plus précis
  await updateProfileSubscription(profile.id, {
    status: "past_due",
  });
}

/**
 * Traite un event Stripe
 */
export async function processStripeEvent(event: Stripe.Event): Promise<void> {
  // Vérifier l'idempotence
  if (await isEventProcessed(event.id)) {
    console.info(`Event ${event.id} déjà traité, ignoré`);
    return;
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case "customer.subscription.created":
        await handleSubscriptionCreated(
          event.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;

      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.info(`Event type non géré: ${event.type}`);
        return; // Ne pas marquer comme traité si on ne le traite pas
    }

    // Marquer l'event comme traité seulement si le traitement a réussi
    await markEventAsProcessed(event.id, event.type);
  } catch (error) {
    console.error(`Erreur lors du traitement de l'event ${event.id}:`, error);
    // Ne pas marquer comme traité en cas d'erreur pour permettre une retry
    throw error;
  }
}
