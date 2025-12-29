import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent } from "@shiftly/payments";
import { processStripeEvent } from "@/hooks/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Endpoint webhook Stripe
 * Traite les événements Stripe pour synchroniser l'état d'abonnement avec Supabase
 *
 * Configuration Stripe CLI pour développement local:
 *   stripe listen --forward-to localhost:3000/api/payments/webhook
 *
 * Tester un événement:
 *   stripe trigger checkout.session.completed
 *   stripe trigger customer.subscription.created
 *   stripe trigger invoice.paid
 */
export async function POST(req: NextRequest) {
  console.log("🔔 Webhook Stripe reçu");

  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature) {
    console.error("❌ Webhook Stripe: signature manquante dans les headers");
    return NextResponse.json(
      { error: "Signature Stripe manquante" },
      { status: 400 }
    );
  }

  if (!webhookSecret) {
    console.error("❌ Webhook Stripe: STRIPE_WEBHOOK_SECRET non configuré");
    return NextResponse.json(
      { error: "Configuration webhook manquante" },
      { status: 500 }
    );
  }

  let event;

  try {
    const payload = Buffer.from(await req.arrayBuffer());
    console.log(`📦 Payload reçu: ${payload.length} bytes`);

    event = constructWebhookEvent(payload, signature);
    console.log(`✅ Event Stripe validé: ${event.type} (${event.id})`);
  } catch (error) {
    console.error("❌ Webhook Stripe invalide:", error);
    if (error instanceof Error) {
      console.error("Détails de l'erreur:", error.message);
      console.error("Stack:", error.stack);
    }
    return NextResponse.json(
      {
        error: "Signature Stripe invalide",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 400 }
    );
  }

  try {
    // Traiter l'événement
    console.log(`🔄 Traitement de l'événement: ${event.type}...`);
    await processStripeEvent(event);
    console.info(
      `✅ Webhook Stripe traité avec succès: ${event.type} (${event.id})`
    );

    return NextResponse.json({
      received: true,
      eventId: event.id,
      eventType: event.type,
    });
  } catch (error) {
    console.error(
      `❌ Erreur lors du traitement du webhook ${event.type}:`,
      error
    );
    if (error instanceof Error) {
      console.error("Détails de l'erreur:", error.message);
      console.error("Stack:", error.stack);
    }
    // Retourner 500 pour que Stripe réessaie
    return NextResponse.json(
      {
        error: "Erreur lors du traitement du webhook",
        eventId: event.id,
        eventType: event.type,
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
