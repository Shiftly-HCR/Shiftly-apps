import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent } from "@shiftly/payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
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
    return new NextResponse("Invalid Stripe webhook", { status: 400 });
  }

  // TODO: Persister l'état de l'abonnement (customer.subscription.*) côté Supabase
  console.info("Webhook Stripe reçu:", event.type);

  return NextResponse.json({ received: true });
}
