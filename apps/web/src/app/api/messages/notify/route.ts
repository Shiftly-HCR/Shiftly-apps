import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOLDOWN_MINUTES = 15;

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

function getBaseUrl(req: NextRequest): string {
  return process.env.APP_BASE_URL || req.headers.get("origin") || req.nextUrl.origin;
}

async function sendViaResend(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { success: false, error: "RESEND_API_KEY manquante" };
  }

  const from = process.env.EMAIL_FROM || "Shiftly <donotreply@shiftly.pro>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: params.subject,
      html: params.html,
    }),
  });

  if (!response.ok) {
    const payload = await response.text();
    return {
      success: false,
      error: `Resend error (${response.status}): ${payload}`,
    };
  }

  return { success: true };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const messageId = body?.messageId as string | undefined;

    if (!messageId) {
      return NextResponse.json(
        { error: "messageId requis" },
        { status: 400 }
      );
    }

    const supabaseAuth = createServerSupabaseClient(req);
    const authHeader = req.headers.get("authorization");
    let user = null;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseAuth.auth.getUser(token);
      user = data?.user;
    }

    if (!user) {
      const { data } = await supabaseAuth.auth.getUser();
      user = data?.user;
    }

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const supabase = getSupabaseServiceRole();

    const { data: message, error: messageError } = await supabase
      .from("messages")
      .select(
        "id, conversation_id, sender_id, content, created_at, notification_status, notification_sent_at"
      )
      .eq("id", messageId)
      .single();

    if (messageError || !message) {
      return NextResponse.json(
        { error: "Message introuvable" },
        { status: 404 }
      );
    }

    if (message.sender_id !== user.id) {
      return NextResponse.json(
        { error: "Action non autorisée pour ce message" },
        { status: 403 }
      );
    }

    // Idempotence: message déjà traité
    if (message.notification_status) {
      return NextResponse.json({
        success: true,
        skipped: "already_processed",
      });
    }

    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .select("id, recruiter_id, freelance_id")
      .eq("id", message.conversation_id)
      .single();

    if (conversationError || !conversation) {
      await supabase
        .from("messages")
        .update({
          notification_status: "error",
          notification_error: "Conversation introuvable",
        })
        .eq("id", message.id);

      return NextResponse.json(
        { error: "Conversation introuvable" },
        { status: 404 }
      );
    }

    const recipientId =
      conversation.recruiter_id === user.id
        ? conversation.freelance_id
        : conversation.recruiter_id;

    if (!recipientId || recipientId === user.id) {
      await supabase
        .from("messages")
        .update({
          notification_status: "skipped_no_recipient",
        })
        .eq("id", message.id);

      return NextResponse.json({
        success: true,
        skipped: "no_recipient",
      });
    }

    const cooldownCutoff = new Date(
      Date.now() - COOLDOWN_MINUTES * 60 * 1000
    ).toISOString();

    const { data: recentNotified } = await supabase
      .from("messages")
      .select("id")
      .eq("conversation_id", message.conversation_id)
      .eq("sender_id", user.id)
      .neq("id", message.id)
      .not("notification_sent_at", "is", null)
      .gte("notification_sent_at", cooldownCutoff)
      .limit(1);

    if (recentNotified && recentNotified.length > 0) {
      await supabase
        .from("messages")
        .update({
          notification_status: "skipped_cooldown",
        })
        .eq("id", message.id);

      return NextResponse.json({
        success: true,
        skipped: "cooldown",
      });
    }

    const [{ data: recipientProfile }, { data: senderProfile }] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, email, first_name, last_name")
        .eq("id", recipientId)
        .single(),
      supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .eq("id", user.id)
        .single(),
    ]);

    const recipientEmail = recipientProfile?.email;
    if (!recipientEmail) {
      await supabase
        .from("messages")
        .update({
          notification_status: "skipped_no_email",
        })
        .eq("id", message.id);

      return NextResponse.json({
        success: true,
        skipped: "no_email",
      });
    }

    const senderName = `${senderProfile?.first_name || ""} ${senderProfile?.last_name || ""}`
      .trim() || "Un utilisateur";

    const baseUrl = getBaseUrl(req);
    const messagingUrl = `${baseUrl}/messagerie?conversationId=${conversation.id}`;
    const preview = String(message.content || "").slice(0, 180);

    const sendResult = await sendViaResend({
      to: recipientEmail,
      subject: "Nouveau message sur Shiftly",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.4;color:#111">
          <h2 style="margin:0 0 12px">Vous avez reçu un nouveau message</h2>
          <p style="margin:0 0 10px"><strong>${senderName}</strong> vous a envoyé un message.</p>
          ${preview ? `<p style="margin:0 0 14px;color:#444"><em>"${preview}"</em></p>` : ""}
          <a href="${messagingUrl}" style="display:inline-block;background:#7a247a;color:#fff;text-decoration:none;padding:10px 14px;border-radius:8px;">
            Ouvrir la messagerie
          </a>
        </div>
      `,
    });

    if (!sendResult.success) {
      await supabase
        .from("messages")
        .update({
          notification_status: "error",
          notification_error: sendResult.error || "Erreur inconnue",
        })
        .eq("id", message.id);

      return NextResponse.json({
        success: false,
        error: sendResult.error,
      });
    }

    await supabase
      .from("messages")
      .update({
        notification_status: "sent",
        notification_sent_at: new Date().toISOString(),
        notification_error: null,
      })
      .eq("id", message.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur /api/messages/notify:", error);
    return NextResponse.json(
      { error: "Erreur interne lors de la notification message" },
      { status: 500 }
    );
  }
}
