import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Route de diagnostic pour vérifier les variables d'environnement
 * À utiliser uniquement en développement local
 * Supprimez cette route en production
 */
export async function GET() {
  const env = {
    // Stripe
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY
      ? `${process.env.STRIPE_SECRET_KEY.substring(0, 10)}...${process.env.STRIPE_SECRET_KEY.substring(process.env.STRIPE_SECRET_KEY.length - 4)}`
      : "MANQUANTE",
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET
      ? `${process.env.STRIPE_WEBHOOK_SECRET.substring(0, 10)}...${process.env.STRIPE_WEBHOOK_SECRET.substring(process.env.STRIPE_WEBHOOK_SECRET.length - 4)}`
      : "MANQUANTE",
    STRIPE_PRICE_ESTABLISHMENT: process.env.STRIPE_PRICE_ESTABLISHMENT || "MANQUANTE",
    STRIPE_PRICE_FREELANCE_STUDENT:
      process.env.STRIPE_PRICE_FREELANCE_STUDENT || "MANQUANTE",
    STRIPE_PRICE_FREELANCE_CLASSIC:
      process.env.STRIPE_PRICE_FREELANCE_CLASSIC || "MANQUANTE",

    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "MANQUANTE",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 10)}...`
      : "MANQUANTE",
    SUPABASE_SERVICE_ROLE: process.env.SUPABASE_SERVICE_ROLE
      ? `${process.env.SUPABASE_SERVICE_ROLE.substring(0, 10)}...${process.env.SUPABASE_SERVICE_ROLE.substring(process.env.SUPABASE_SERVICE_ROLE.length - 4)}`
      : "MANQUANTE",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? `${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 10)}...${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(process.env.SUPABASE_SERVICE_ROLE_KEY.length - 4)}`
      : "MANQUANTE",
  };

  return NextResponse.json(
    {
      message: "Variables d'environnement (valeurs masquées)",
      env,
      note: "Les valeurs sensibles sont masquées pour la sécurité",
    },
    { status: 200 }
  );
}

