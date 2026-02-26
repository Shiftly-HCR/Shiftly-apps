import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSupabaseServiceRole() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Configuration Supabase manquante");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function createServerSupabaseClient(req: NextRequest) {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "";

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Configuration Supabase manquante");
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: { Cookie: req.headers.get("cookie") || "" },
    },
  });
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/admin/disputes/[id]/resolve
 * Résout ou rejette un litige. Réservé aux administrateurs.
 *
 * Body: { action: "resolve" | "reject", resolution?: string }
 *
 * - Vérifie que l'appelant a le rôle "admin" dans profiles.
 * - Utilise le service role pour les écritures (mission_disputes + mission_payments).
 */
export async function POST(req: NextRequest, context: RouteContext) {
  const { id: disputeId } = await context.params;
  console.log(`📥 POST /api/admin/disputes/${disputeId}/resolve`);

  try {
    // Authentifier l'appelant
    const supabaseAnon = createServerSupabaseClient(req);
    const authHeader = req.headers.get("authorization");
    let user = null;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseAnon.auth.getUser(token);
      user = data?.user;
    }

    if (!user) {
      const { data } = await supabaseAnon.auth.getUser();
      user = data?.user;
    }

    if (!user) {
      return NextResponse.json(
        { error: "Vous devez être connecté" },
        { status: 401 }
      );
    }

    // Vérifier le rôle admin via service role pour éviter le spoofing
    const supabase = getSupabaseServiceRole();

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("❌ Profil introuvable:", profileError);
      return NextResponse.json(
        { error: "Profil introuvable" },
        { status: 404 }
      );
    }

    if (profile.role !== "admin") {
      console.warn(`⚠️ Utilisateur ${user.id} (rôle: ${profile.role}) non autorisé`);
      return NextResponse.json(
        { error: "Accès réservé aux administrateurs" },
        { status: 403 }
      );
    }

    // Valider le body
    const body = await req.json();
    const { action, resolution } = body as {
      action: "resolve" | "reject";
      resolution?: string;
    };

    if (!action || !["resolve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "L'action doit être 'resolve' ou 'reject'" },
        { status: 400 }
      );
    }

    // Récupérer le litige
    const { data: dispute, error: disputeError } = await supabase
      .from("mission_disputes")
      .select("id, status, mission_payment_id")
      .eq("id", disputeId)
      .single();

    if (disputeError || !dispute) {
      console.error("❌ Litige introuvable:", disputeError);
      return NextResponse.json(
        { error: "Litige introuvable" },
        { status: 404 }
      );
    }

    if (dispute.status !== "open") {
      return NextResponse.json(
        { error: `Le litige est déjà ${dispute.status}` },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();
    const newStatus = action === "resolve" ? "resolved" : "rejected";

    // Mettre à jour le litige
    const { error: updateError } = await supabase
      .from("mission_disputes")
      .update({
        status: newStatus,
        resolution: resolution?.trim() || null,
        resolved_by: user.id,
        resolved_at: now,
      })
      .eq("id", disputeId);

    if (updateError) {
      console.error("❌ Erreur mise à jour litige:", updateError);
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour du litige" },
        { status: 500 }
      );
    }

    // Si résolu, débloquer le paiement pour permettre la libération automatique
    if (action === "resolve") {
      const { error: paymentUpdateError } = await supabase
        .from("mission_payments")
        .update({ has_dispute: false })
        .eq("id", dispute.mission_payment_id);

      if (paymentUpdateError) {
        console.error("❌ Erreur déblocage paiement:", paymentUpdateError);
        // Non-bloquant : le litige est résolu, on log mais on ne fait pas rollback
      }
    }

    console.log(`✅ Litige ${disputeId} ${newStatus} par admin ${user.id}`);

    return NextResponse.json({
      success: true,
      dispute: { id: disputeId, status: newStatus },
    });
  } catch (error) {
    console.error("❌ Erreur résolution litige:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Erreur interne du serveur",
      },
      { status: 500 }
    );
  }
}
