import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Client Supabase avec service role pour les opérations backend
 */
function getSupabaseServiceRole() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Configuration Supabase manquante");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Crée un client Supabase pour authentification
 */
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
      headers: {
        Cookie: req.headers.get("cookie") || "",
      },
    },
  });
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/missions/[id]/dispute
 * Permet au recruteur de signaler un problème sur une mission payée
 * Bloque la libération automatique des fonds jusqu'à résolution admin
 */
export async function POST(req: NextRequest, context: RouteContext) {
  const { id: missionId } = await context.params;
  console.log(`📥 POST /api/missions/${missionId}/dispute`);

  try {
    // Récupérer le body
    const body = await req.json();
    const { reason, description } = body;

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { error: "La raison du problème est requise" },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur authentifié
    const supabase = createServerSupabaseClient(req);
    const authHeader = req.headers.get("authorization");
    let user = null;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabase.auth.getUser(token);
      user = data?.user;
    }

    if (!user) {
      const { data } = await supabase.auth.getUser();
      user = data?.user;
    }

    if (!user) {
      return NextResponse.json(
        { error: "Vous devez être connecté" },
        { status: 401 }
      );
    }

    console.log(`👤 Utilisateur: ${user.id}`);

    const supabaseService = getSupabaseServiceRole();

    // Récupérer la mission pour vérifier que l'utilisateur est le recruteur
    const { data: mission, error: missionError } = await supabaseService
      .from("missions")
      .select("id, title, recruiter_id")
      .eq("id", missionId)
      .single();

    if (missionError || !mission) {
      console.error("❌ Mission introuvable:", missionError);
      return NextResponse.json(
        { error: "Mission introuvable" },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est le recruteur
    if (mission.recruiter_id !== user.id) {
      console.warn(`⚠️ Utilisateur ${user.id} n'est pas le recruteur`);
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à signaler un problème sur cette mission" },
        { status: 403 }
      );
    }

    // Récupérer le paiement en statut 'received'
    const { data: payment, error: paymentError } = await supabaseService
      .from("mission_payments")
      .select("id, status, has_dispute")
      .eq("mission_id", missionId)
      .eq("status", "received")
      .single();

    if (paymentError || !payment) {
      console.error("❌ Aucun paiement en attente trouvé");
      return NextResponse.json(
        { error: "Aucun paiement en attente trouvé pour cette mission" },
        { status: 400 }
      );
    }

    // Vérifier qu'il n'y a pas déjà un litige ouvert
    if (payment.has_dispute) {
      const { data: existingDispute } = await supabaseService
        .from("mission_disputes")
        .select("id, status")
        .eq("mission_payment_id", payment.id)
        .eq("status", "open")
        .maybeSingle();

      if (existingDispute) {
        return NextResponse.json(
          { error: "Un litige est déjà en cours pour ce paiement" },
          { status: 400 }
        );
      }
    }

    // Créer le litige
    const { data: dispute, error: disputeError } = await supabaseService
      .from("mission_disputes")
      .insert({
        mission_id: missionId,
        mission_payment_id: payment.id,
        reporter_id: user.id,
        reason: reason.trim(),
        description: description?.trim() || null,
        status: "open",
        is_stripe_dispute: false,
      })
      .select()
      .single();

    if (disputeError || !dispute) {
      console.error("❌ Erreur création litige:", disputeError);
      return NextResponse.json(
        { error: "Erreur lors de la création du litige" },
        { status: 500 }
      );
    }

    // Mettre à jour mission_payments
    const { error: updateError } = await supabaseService
      .from("mission_payments")
      .update({
        has_dispute: true,
        problem_declared_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    if (updateError) {
      console.error("❌ Erreur mise à jour payment:", updateError);
      // Rollback: supprimer le litige créé
      await supabaseService
        .from("mission_disputes")
        .delete()
        .eq("id", dispute.id);
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour du paiement" },
        { status: 500 }
      );
    }

    console.log(`✅ Litige créé: ${dispute.id} pour mission ${missionId}`);

    // TODO: Envoyer notification à l'admin
    // await sendNotification({ ... });

    return NextResponse.json({
      success: true,
      dispute: {
        id: dispute.id,
        reason: dispute.reason,
        status: dispute.status,
        createdAt: dispute.created_at,
      },
      message: "Le problème a été signalé. La libération des fonds est bloquée jusqu'à résolution.",
    });
  } catch (error) {
    console.error("❌ Erreur lors de la création du litige:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de la création du litige",
      },
      { status: 500 }
    );
  }
}
