/**
 * Handlers pour les webhooks Stripe
 * Gère la synchronisation de l'état d'abonnement avec Supabase
 * et les paiements de missions (Stripe Connect)
 */

import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import type { SubscriptionStatus } from "@shiftly/data";
import { calculateFundDistribution, getStripeClient } from "@shiftly/payments";

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
  console.log(`🔍 UserId pour la mise à jour:`, userId);

  const { data, error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", userId)
    .select();

  console.log(`📊 Résultat de la mise à jour:`, {
    data,
    error,
    dataLength: data?.length,
  });

  if (error) {
    console.error("❌ Erreur lors de la mise à jour du profil:", error);
    console.error("Détails de l'erreur:", JSON.stringify(error, null, 2));
    console.error("UserId:", userId);
    console.error("UpdateData:", JSON.stringify(updateData, null, 2));
    throw new Error(
      `Erreur lors de la mise à jour du profil: ${error.message}`
    );
  }

  if (!data || data.length === 0) {
    // Vérifier si le profil existe (le profil devrait toujours exister grâce au trigger SQL)
    console.log(
      `🔍 [updateProfileSubscription] Aucune ligne mise à jour, vérification de l'existence du profil pour userId: ${userId}`
    );

    const { data: checkProfile, error: checkError } = await supabase
      .from("profiles")
      .select("id, email, stripe_customer_id, stripe_subscription_id")
      .eq("id", userId)
      .maybeSingle();

    console.log(`🔍 [updateProfileSubscription] Résultat de la vérification:`, {
      checkProfile,
      checkError,
      checkErrorCode: checkError?.code,
      checkErrorMessage: checkError?.message,
      checkErrorDetails: checkError,
    });

    if (checkError) {
      console.error(`❌ Erreur lors de la vérification du profil:`, checkError);
      console.error(`❌ Code d'erreur:`, checkError.code);
      console.error(`❌ Message d'erreur:`, checkError.message);
      console.error(
        `❌ Détails complets:`,
        JSON.stringify(checkError, null, 2)
      );
      throw new Error(
        `Erreur lors de la vérification du profil: ${checkError.message} (code: ${checkError.code})`
      );
    }

    if (!checkProfile) {
      // Le profil n'existe pas - c'est une erreur, on ne crée PAS de profil ici
      // Le profil devrait être créé automatiquement par le trigger SQL handle_new_user()
      console.error(
        `❌ Profil introuvable pour l'utilisateur ${userId}. Le profil devrait exister grâce au trigger SQL handle_new_user().`
      );
      console.error(
        `❌ Tentative de requête directe pour vérifier l'existence du profil...`
      );

      // Tentative de requête brute pour debug
      const {
        data: debugData,
        error: debugError,
        count,
      } = await supabase
        .from("profiles")
        .select("id, email", { count: "exact" })
        .eq("id", userId);

      console.error(`❌ Requête debug:`, {
        debugData,
        debugError,
        count,
        userId,
      });

      throw new Error(
        `Profil introuvable pour l'utilisateur ${userId}. Le profil devrait être créé automatiquement lors de l'inscription. Vérifiez que le trigger SQL handle_new_user() fonctionne correctement.`
      );
    } else {
      // Le profil existe mais la mise à jour n'a rien modifié
      // Cela peut arriver si toutes les valeurs sont identiques
      console.log(
        `ℹ️ Le profil existe (id: ${checkProfile.id}, email: ${checkProfile.email}) mais aucune modification n'était nécessaire (toutes les valeurs sont identiques)`
      );
    }
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
 * Récupère le userId depuis une Checkout Session Stripe
 * Essaie plusieurs sources dans l'ordre de priorité
 */
function getUserIdFromCheckoutSession(
  session: Stripe.Checkout.Session
): string | null {
  // Priorité 1: session.metadata.userId / session.metadata.user_id
  const userIdFromMetadata = getUserIdFromMetadata(session.metadata);
  if (userIdFromMetadata) {
    console.log(
      `🔍 [getUserIdFromCheckoutSession] userId trouvé dans session.metadata: ${userIdFromMetadata}`
    );
    return userIdFromMetadata;
  }

  // Priorité 2: session.client_reference_id
  if (session.client_reference_id) {
    console.log(
      `🔍 [getUserIdFromCheckoutSession] userId trouvé dans client_reference_id: ${session.client_reference_id}`
    );
    return session.client_reference_id;
  }

  console.warn(
    `⚠️ [getUserIdFromCheckoutSession] userId introuvable dans session.metadata et client_reference_id`
  );
  return null;
}

/**
 * Handler pour checkout.session.completed
 */
export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  console.log(`🛒 Traitement checkout.session.completed: ${session.id}`);

  // Utiliser le helper pour récupérer userId (essaie metadata puis client_reference_id)
  let userId = getUserIdFromCheckoutSession(session);
  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id;

  console.log(`📋 [checkout.session.completed] Identifiants récupérés:`, {
    userId,
    customerId,
    subscription: session.subscription,
    metadata: session.metadata,
    client_reference_id: session.client_reference_id,
  });

  // Si userId n'est toujours pas trouvé, essayer de le récupérer depuis customer_id (fallback)
  if (!userId && customerId) {
    console.log(
      `🔍 [checkout.session.completed] userId manquant, recherche via customer_id: ${customerId}`
    );
    const supabase = getSupabaseServiceRole();
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();

    if (profile) {
      userId = profile.id;
      console.log(
        `✅ [checkout.session.completed] userId trouvé via customer_id: ${userId}`
      );
    }
  }

  if (!userId) {
    console.warn(
      "⚠️ [checkout.session.completed] userId manquant et impossible de le récupérer",
      {
        sessionId: session.id,
        metadata: session.metadata,
        client_reference_id: session.client_reference_id,
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
  let userId = getUserIdFromMetadata(subscription.metadata);
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id;

  console.log(`📋 [customer.subscription.created] Identifiants:`, {
    subscriptionId: subscription.id,
    userIdFromMetadata: userId,
    customerId,
    metadata: subscription.metadata,
  });

  // Fallback: si userId n'est pas dans metadata, récupérer via stripe_customer_id
  if (!userId && customerId) {
    console.log(
      `🔍 [customer.subscription.created] userId manquant dans metadata, recherche via stripe_customer_id: ${customerId}`
    );
    const supabase = getSupabaseServiceRole();
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();

    if (profileError && profileError.code !== "PGRST116") {
      console.error(
        `❌ [customer.subscription.created] Erreur lors de la recherche du profil:`,
        profileError
      );
    }

    if (profile) {
      userId = profile.id;
      console.log(
        `✅ [customer.subscription.created] userId trouvé via stripe_customer_id: ${userId}`
      );
    }
  }

  if (!userId) {
    console.warn(
      "⚠️ [customer.subscription.created] userId manquant et impossible de le récupérer",
      {
        subscriptionId: subscription.id,
        customerId,
        metadata: subscription.metadata,
      }
    );
    return;
  }

  const priceId = subscription.items.data[0]?.price.id;
  let planId = subscription.metadata?.planId || null;
  const subscriptionStatus = subscription.status as SubscriptionStatus;

  // Si le planId n'est pas dans les métadonnées de la subscription, essayer de le récupérer depuis le price metadata
  if (!planId) {
    const priceMetadata = subscription.items.data[0]?.price.metadata;
    if (priceMetadata?.planId) {
      planId = priceMetadata.planId;
      console.log(
        `📋 [customer.subscription.created] planId trouvé dans price metadata: ${planId}`
      );
    }
  }

  console.log(`📋 [customer.subscription.created] Données extraites:`, {
    subscriptionId: subscription.id,
    userId,
    customerId,
    priceId,
    planId,
    status: subscriptionStatus,
    metadata: subscription.metadata,
    priceMetadata: subscription.items.data[0]?.price.metadata,
  });

  // Vérifier si le profil existe (le profil devrait toujours exister grâce au trigger SQL)
  const supabase = getSupabaseServiceRole();
  const { data: existingProfile, error: existingProfileError } = await supabase
    .from("profiles")
    .select("id, subscription_status, subscription_plan_id, email")
    .eq("id", userId)
    .maybeSingle();

  console.log(
    `📋 [customer.subscription.created] Vérification du profil existant:`,
    {
      existingProfile,
      existingProfileError,
      userId,
    }
  );

  if (existingProfileError) {
    console.error(
      `❌ [customer.subscription.created] Erreur lors de la vérification du profil:`,
      existingProfileError
    );
    throw new Error(
      `Erreur lors de la vérification du profil: ${existingProfileError.message}`
    );
  }

  if (!existingProfile) {
    // Le profil n'existe pas - c'est une erreur, on ne crée PAS de profil ici
    console.error(
      `❌ [customer.subscription.created] Profil introuvable pour l'utilisateur ${userId}. Le profil devrait exister grâce au trigger SQL handle_new_user().`
    );
    throw new Error(
      `Profil introuvable pour l'utilisateur ${userId}. Le profil devrait être créé automatiquement lors de l'inscription. Vérifiez que le trigger SQL handle_new_user() fonctionne correctement.`
    );
  }

  console.log(
    `✅ [customer.subscription.created] Profil trouvé: id=${existingProfile.id}, email=${existingProfile.email}, subscription_status=${existingProfile.subscription_status}, subscription_plan_id=${existingProfile.subscription_plan_id}`
  );

  // Si le profil existe déjà avec un statut "active" et un planId, ne pas écraser
  if (
    existingProfile.subscription_status === "active" &&
    existingProfile.subscription_plan_id
  ) {
    console.log(
      `⚠️ [customer.subscription.created] Profil déjà actif avec planId, mise à jour partielle uniquement`
    );
    // Mettre à jour uniquement les champs manquants sans écraser le statut
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (!existingProfile.subscription_plan_id && planId) {
      updateData.subscription_plan_id = planId;
    }
    if (priceId) {
      updateData.subscription_price_id = priceId;
    }
    if (customerId) {
      updateData.stripe_customer_id = customerId;
    }

    await supabase.from("profiles").update(updateData).eq("id", userId);
    return;
  }

  await updateProfileSubscription(userId, {
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    status: subscriptionStatus,
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
 * Met à jour les informations d'abonnement dans la table profiles
 * Source de vérité: Supabase (synchronisé depuis Stripe)
 */
export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
): Promise<void> {
  console.log(
    `🔄 [customer.subscription.updated] Traitement de l'abonnement: ${subscription.id}`
  );

  // Priorité 1: userId depuis subscription.metadata.userId
  const userIdFromMetadata = getUserIdFromMetadata(subscription.metadata);
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id;

  console.log(`📋 [customer.subscription.updated] Identifiants:`, {
    subscriptionId: subscription.id,
    userIdFromMetadata,
    customerId,
    metadata: subscription.metadata,
  });

  // Log si subscription.metadata est vide (indique que subscription_data.metadata était vide lors de la création)
  if (
    !subscription.metadata ||
    Object.keys(subscription.metadata).length === 0
  ) {
    console.warn(
      `⚠️ [customer.subscription.updated] subscription.metadata est vide pour la subscription ${subscription.id}. Cela indique que subscription_data.metadata était vide lors de la création de la session Checkout.`
    );
  }

  // Si on n'a pas userId dans metadata, fallback: récupérer via stripe_customer_id
  let finalUserId = userIdFromMetadata;
  if (!finalUserId && customerId) {
    console.log(
      `🔍 [customer.subscription.updated] userId manquant dans metadata, recherche via stripe_customer_id: ${customerId}`
    );
    const supabase = getSupabaseServiceRole();
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();

    if (error) {
      console.error(
        `❌ [customer.subscription.updated] Erreur lors de la recherche du profil:`,
        error
      );
    }

    if (data) {
      finalUserId = data.id;
      console.log(
        `✅ [customer.subscription.updated] userId trouvé via stripe_customer_id: ${finalUserId}`
      );
    }
  }

  if (!finalUserId) {
    console.warn(
      `⚠️ [customer.subscription.updated] Impossible de trouver l'utilisateur`,
      {
        subscriptionId: subscription.id,
        customerId,
        userIdFromMetadata,
      }
    );
    return;
  }

  // Préparer les données à mettre à jour
  const subscriptionStatus = subscription.status as SubscriptionStatus;
  const currentPeriodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000)
    : undefined;
  const cancelAtPeriodEnd = subscription.cancel_at_period_end || false;
  const priceId = subscription.items.data[0]?.price.id;

  // Récupérer le planId depuis les métadonnées ou depuis le profil existant
  let planId = subscription.metadata?.planId || null;

  console.log(
    `📋 [customer.subscription.updated] planId depuis metadata:`,
    planId
  );
  console.log(
    `📋 [customer.subscription.updated] metadata complète:`,
    subscription.metadata
  );
  console.log(
    `📋 [customer.subscription.updated] subscription.items:`,
    subscription.items.data.map((item) => ({
      priceId: item.price.id,
      priceMetadata: item.price.metadata,
    }))
  );

  // Si le planId n'est pas dans les métadonnées, essayer de le récupérer depuis le profil existant
  if (!planId) {
    console.log(
      `🔍 [customer.subscription.updated] planId manquant dans metadata, recherche dans le profil existant`
    );
    const supabase = getSupabaseServiceRole();
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("subscription_plan_id")
      .eq("id", finalUserId)
      .maybeSingle();

    if (existingProfile?.subscription_plan_id) {
      planId = existingProfile.subscription_plan_id;
      console.log(
        `📋 [customer.subscription.updated] planId récupéré depuis le profil existant: ${planId}`
      );
    } else {
      console.warn(
        `⚠️ [customer.subscription.updated] planId introuvable dans metadata et profil existant. Subscription ID: ${subscription.id}`
      );
      // Essayer de récupérer depuis le price metadata si disponible
      const priceMetadata = subscription.items.data[0]?.price.metadata;
      if (priceMetadata?.planId) {
        planId = priceMetadata.planId;
        console.log(
          `📋 [customer.subscription.updated] planId trouvé dans price metadata: ${planId}`
        );
      }
    }
  }

  console.log(`📝 [customer.subscription.updated] Données à mettre à jour:`, {
    userId: finalUserId,
    subscriptionId: subscription.id,
    status: subscriptionStatus,
    cancelAtPeriodEnd,
    currentPeriodEnd: currentPeriodEnd?.toISOString(),
    priceId,
    planId,
  });

  try {
    await updateProfileSubscription(finalUserId, {
      stripeSubscriptionId: subscription.id,
      status: subscriptionStatus,
      currentPeriodEnd: currentPeriodEnd,
      cancelAtPeriodEnd: cancelAtPeriodEnd,
      priceId: priceId,
      planId: planId || undefined,
    });

    console.log(
      `✅ [customer.subscription.updated] Profil mis à jour avec succès pour l'utilisateur ${finalUserId}`,
      {
        subscriptionId: subscription.id,
        status: subscriptionStatus,
        cancelAtPeriodEnd,
        currentPeriodEnd: currentPeriodEnd?.toISOString(),
      }
    );
  } catch (error) {
    console.error(
      `❌ [customer.subscription.updated] Erreur lors de la mise à jour du profil:`,
      error
    );
    throw error; // Propager l'erreur pour que Stripe puisse réessayer
  }
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

// ============================================================================
// HANDLERS POUR LES PAIEMENTS DE MISSIONS (STRIPE CONNECT)
// ============================================================================

/**
 * Handler pour checkout.session.completed - Paiements de missions
 * Appelé quand un recruteur complète le paiement d'une mission
 */
export async function handleMissionCheckoutCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  console.log(
    `🛒 [Mission] Traitement checkout.session.completed: ${session.id}`
  );

  // Vérifier que c'est un paiement de mission
  const metadata = session.metadata;
  if (!metadata || metadata.type !== "mission_payment") {
    console.log(
      `ℹ️ Session ${session.id} n'est pas un paiement de mission, ignoré`
    );
    return;
  }

  const missionId = metadata.mission_id;
  const recruiterId = metadata.recruiter_id;
  const establishmentId = metadata.establishment_id;

  if (!missionId) {
    console.error("❌ [Mission] mission_id manquant dans les metadata");
    return;
  }

  console.log(`📋 [Mission] Mission: ${missionId}, Recruteur: ${recruiterId}`);

  const supabase = getSupabaseServiceRole();

  // Récupérer le PaymentIntent ID
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  // Mettre à jour mission_payments avec le nouveau statut "received"
  const { data: payment, error: updateError } = await supabase
    .from("mission_payments")
    .update({
      status: "received", // Paiement reçu, en attente de distribution
      paid_at: new Date().toISOString(),
      stripe_payment_intent_id: paymentIntentId,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_checkout_session_id", session.id)
    .select()
    .single();

  if (updateError) {
    console.error("❌ [Mission] Erreur mise à jour payment:", updateError);
    // Essayer de créer l'entrée si elle n'existe pas
    const amount = session.amount_total || 0;
    const { data: newPayment, error: insertError } = await supabase
      .from("mission_payments")
      .insert({
        mission_id: missionId,
        recruiter_id: recruiterId,
        amount,
        currency: session.currency || "eur",
        status: "received", // Paiement reçu, en attente de distribution
        paid_at: new Date().toISOString(),
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: paymentIntentId,
      })
      .select()
      .single();

    if (insertError) {
      console.error("❌ [Mission] Erreur création payment:", insertError);
      return;
    }

    await createMissionFinance(
      supabase,
      newPayment,
      missionId,
      establishmentId,
      paymentIntentId
    );
    return;
  }

  if (payment) {
    await createMissionFinance(
      supabase,
      payment,
      missionId,
      establishmentId,
      paymentIntentId
    );
  }

  console.log(`✅ [Mission] Paiement ${session.id} traité avec succès`);
}

/**
 * Attendre un délai (en ms)
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Récupère les frais Stripe réels depuis le PaymentIntent
 * Avec retry car la balance_transaction peut prendre quelques secondes à être créée
 */
async function getStripeFees(paymentIntentId?: string): Promise<number> {
  if (!paymentIntentId) {
    console.warn(
      "⚠️ [Mission] Pas de PaymentIntent ID, frais Stripe estimés à 0"
    );
    return 0;
  }

  const stripe = getStripeClient();
  const maxRetries = 3;
  const retryDelayMs = 2000; // 2 secondes entre chaque tentative

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `🔄 [Mission] Tentative ${attempt}/${maxRetries} de récupération des frais Stripe...`
      );

      // Récupérer le PaymentIntent avec les charges
      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId,
        {
          expand: ["latest_charge.balance_transaction"],
        }
      );

      // Récupérer la charge et la balance_transaction
      const charge = paymentIntent.latest_charge as Stripe.Charge | null;
      if (!charge) {
        console.warn(
          `⚠️ [Mission] Tentative ${attempt}: Pas de charge trouvée`
        );
        if (attempt < maxRetries) {
          await delay(retryDelayMs);
          continue;
        }
        return 0;
      }

      const balanceTransaction =
        charge.balance_transaction as Stripe.BalanceTransaction | null;
      if (!balanceTransaction) {
        console.warn(
          `⚠️ [Mission] Tentative ${attempt}: Pas de balance_transaction trouvée`
        );
        if (attempt < maxRetries) {
          await delay(retryDelayMs);
          continue;
        }
        return 0;
      }

      // Les frais sont en centimes
      const stripeFee = balanceTransaction.fee;
      console.log(
        `💰 [Mission] Frais Stripe réels: ${stripeFee} centimes (tentative ${attempt})`
      );

      return stripeFee;
    } catch (error) {
      console.error(
        `❌ [Mission] Tentative ${attempt}: Erreur récupération frais Stripe:`,
        error
      );
      if (attempt < maxRetries) {
        await delay(retryDelayMs);
        continue;
      }
      return 0;
    }
  }

  return 0;
}

/**
 * Crée le snapshot financier (mission_finance) pour un paiement
 */
async function createMissionFinance(
  supabase: ReturnType<typeof getSupabaseServiceRole>,
  payment: { id: string; amount: number },
  missionId: string,
  establishmentId?: string,
  paymentIntentId?: string
): Promise<void> {
  console.log(
    `🔄 [Mission] Création mission_finance pour payment ${payment.id}`
  );

  // Récupérer les frais Stripe réels
  const stripeFeeAmount = await getStripeFees(paymentIntentId);

  let commercialId: string | null = null;
  let hasCommercial = false;

  // Récupérer le commercial de l'établissement si applicable
  if (establishmentId) {
    const { data: establishment } = await supabase
      .from("establishments")
      .select("commercial_id")
      .eq("id", establishmentId)
      .single();

    if (establishment?.commercial_id) {
      commercialId = establishment.commercial_id;
      hasCommercial = true;
    }
  }

  // Récupérer le freelance assigné (application acceptée)
  const { data: acceptedApplication } = await supabase
    .from("mission_applications")
    .select("user_id")
    .eq("mission_id", missionId)
    .eq("status", "accepted")
    .single();

  const freelancerId = acceptedApplication?.user_id || null;

  // Calculer la répartition des fonds (avant déduction des frais Stripe)
  const distribution = calculateFundDistribution(payment.amount, hasCommercial);

  // Déduire les frais Stripe de la part plateforme
  const platformNetAmountAfterFees =
    distribution.platformNetAmount - stripeFeeAmount;

  console.log(`📊 [Mission] Répartition:`, {
    grossAmount: payment.amount,
    freelancerAmount: distribution.freelancerAmount,
    commercialFeeAmount: distribution.commercialFeeAmount,
    platformFeeAmount: distribution.platformFeeAmount,
    stripeFeeAmount,
    platformNetAmountAfterFees,
  });

  // Créer l'entrée mission_finance
  const { error: financeError } = await supabase
    .from("mission_finance")
    .insert({
      mission_id: missionId,
      mission_payment_id: payment.id,
      gross_amount: payment.amount,
      platform_fee_amount: distribution.platformFeeAmount,
      commercial_fee_amount: distribution.commercialFeeAmount,
      freelancer_amount: distribution.freelancerAmount,
      platform_net_amount: platformNetAmountAfterFees,
      stripe_fee_amount: stripeFeeAmount,
      commercial_id: commercialId,
      freelancer_id: freelancerId,
      status: "calculated",
    });

  if (financeError) {
    console.error(
      "❌ [Mission] Erreur création mission_finance:",
      financeError
    );
    return;
  }

  console.log(
    `✅ [Mission] mission_finance créé - Freelance: ${distribution.freelancerAmount}c, Commercial: ${distribution.commercialFeeAmount}c, Plateforme net: ${platformNetAmountAfterFees}c, Frais Stripe: ${stripeFeeAmount}c`
  );
}

/**
 * Handler pour account.updated - Stripe Connect
 * Met à jour l'état du compte Connect dans le profil utilisateur
 */
export async function handleAccountUpdated(
  account: Stripe.Account
): Promise<void> {
  console.log(`🔄 [Connect] Traitement account.updated: ${account.id}`);

  const supabase = getSupabaseServiceRole();

  // Trouver le profil associé à ce compte Connect
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("stripe_account_id", account.id)
    .single();

  if (profileError || !profile) {
    console.warn(
      `⚠️ [Connect] Aucun profil trouvé pour le compte ${account.id}`
    );
    return;
  }

  // Déterminer le statut d'onboarding
  let onboardingStatus: "not_started" | "pending" | "complete" = "pending";
  if (account.details_submitted) {
    onboardingStatus = "complete";
  }

  // Extraire les requirements en attente
  const requirementsDue = account.requirements?.currently_due || [];

  // Mettre à jour le profil
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      connect_onboarding_status: onboardingStatus,
      connect_payouts_enabled: account.payouts_enabled || false,
      connect_charges_enabled: account.charges_enabled || false,
      connect_requirements_due:
        requirementsDue.length > 0 ? { requirements: requirementsDue } : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profile.id);

  if (updateError) {
    console.error("❌ [Connect] Erreur mise à jour profil:", updateError);
    return;
  }

  console.log(
    `✅ [Connect] Profil ${profile.id} mis à jour - Payouts: ${account.payouts_enabled}, Status: ${onboardingStatus}`
  );
}

/**
 * Handler pour payment_intent.payment_failed - Échec de paiement mission
 */
export async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  console.log(
    `❌ [Mission] Traitement payment_intent.payment_failed: ${paymentIntent.id}`
  );

  const metadata = paymentIntent.metadata;
  if (!metadata || metadata.type !== "mission_payment") {
    return;
  }

  const supabase = getSupabaseServiceRole();

  // Mettre à jour mission_payments si trouvé
  await supabase
    .from("mission_payments")
    .update({
      status: "failed",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_payment_intent_id", paymentIntent.id);

  console.log(`✅ [Mission] Paiement ${paymentIntent.id} marqué comme échoué`);
}

/**
 * Handler pour charge.refunded - Remboursement
 */
export async function handleChargeRefunded(
  charge: Stripe.Charge
): Promise<void> {
  console.log(`💰 [Mission] Traitement charge.refunded: ${charge.id}`);

  const paymentIntentId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id;

  if (!paymentIntentId) {
    return;
  }

  const supabase = getSupabaseServiceRole();

  // Mettre à jour mission_payments si c'est un paiement de mission
  const { data: payment } = await supabase
    .from("mission_payments")
    .select("id")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .single();

  if (payment) {
    await supabase
      .from("mission_payments")
      .update({
        status: "refunded",
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    console.log(`✅ [Mission] Paiement ${payment.id} marqué comme remboursé`);
  }
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
      // === ABONNEMENTS ===
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        // Distinguer entre abonnement et paiement de mission
        if (
          session.mode === "payment" &&
          session.metadata?.type === "mission_payment"
        ) {
          await handleMissionCheckoutCompleted(session);
        } else {
          // Abonnement (mode subscription)
          await handleCheckoutSessionCompleted(session);
        }
        break;
      }

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

      // === STRIPE CONNECT ===
      case "account.updated":
        await handleAccountUpdated(event.data.object as Stripe.Account);
        break;

      // === PAIEMENTS MISSIONS ===
      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(
          event.data.object as Stripe.PaymentIntent
        );
        break;

      case "charge.refunded":
        await handleChargeRefunded(event.data.object as Stripe.Charge);
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
