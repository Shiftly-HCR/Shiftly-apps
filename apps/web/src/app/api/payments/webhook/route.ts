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
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    console.error("Webhook Stripe: signature manquante");
    return NextResponse.json(
      { error: "Signature Stripe manquante" },
      { status: 400 }
    );
  }

  let event;

  try {
    const payload = Buffer.from(await req.arrayBuffer());
    event = constructWebhookEvent(payload, signature);
  } catch (error) {
    console.error("Webhook Stripe invalide:", error);
    return NextResponse.json(
      { error: "Signature Stripe invalide" },
      { status: 400 }
    );
  }

  try {
    // Traiter l'événement
    await processStripeEvent(event);
    console.info(
      `Webhook Stripe traité avec succès: ${event.type} (${event.id})`
    );

    return NextResponse.json({ received: true, eventId: event.id });
  } catch (error) {
    console.error(`Erreur lors du traitement du webhook ${event.type}:`, error);
    // Retourner 500 pour que Stripe réessaie
    return NextResponse.json(
      {
        error: "Erreur lors du traitement du webhook",
        eventId: event.id,
      },
      { status: 500 }
    );
  }
}
