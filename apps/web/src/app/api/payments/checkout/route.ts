import { NextRequest, NextResponse } from "next/server";
import {
  createCheckoutSession,
  subscriptionPlansById,
  type SubscriptionPlanId,
} from "@shiftly/payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const planId = body?.planId as SubscriptionPlanId | undefined;
    const customerEmail = body?.customerEmail as string | undefined;
    const userId = body?.userId as string | undefined;

    if (!planId || !subscriptionPlansById[planId]) {
      return NextResponse.json(
        { error: "Plan d'abonnement invalide" },
        { status: 400 }
      );
    }

    const origin = req.headers.get("origin") ?? req.nextUrl.origin;
    const successUrl = `${origin}/subscription?status=success&plan=${planId}`;
    const cancelUrl = `${origin}/subscription?status=cancelled&plan=${planId}`;

    const { url } = await createCheckoutSession({
      planId,
      successUrl,
      cancelUrl,
      customerEmail,
      userId,
    });

    if (!url) {
      return NextResponse.json(
        { error: "Impossible de générer l'URL de paiement Stripe" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Erreur lors de la création de la session Stripe:", error);
    return NextResponse.json(
      { error: "Impossible de créer la session de paiement" },
      { status: 500 }
    );
  }
}
