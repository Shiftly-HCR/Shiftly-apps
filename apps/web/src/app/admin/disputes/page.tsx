"use client";

import { useState, useEffect, useCallback } from "react";
import { YStack, XStack, ScrollView, Text, Spinner } from "tamagui";
import { colors, Button } from "@shiftly/ui";
import { AppLayout, PageHeader } from "@/components";
import { useCurrentProfile, useResponsive } from "@/hooks";
import { supabase } from "@shiftly/data";
import { useQueryClient } from "@tanstack/react-query";
import {
  FiAlertTriangle,
  FiCheck,
  FiX,
  FiClock,
  FiExternalLink,
} from "react-icons/fi";

interface Dispute {
  id: string;
  mission_id: string;
  mission_payment_id: string;
  reporter_id: string;
  reason: string;
  description: string | null;
  status: "open" | "resolved" | "rejected";
  resolution: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  is_stripe_dispute: boolean;
  stripe_dispute_id: string | null;
  stripe_dispute_status: string | null;
  created_at: string;
  mission_title?: string;
  reporter_name?: string;
  payment_amount?: number;
}

export default function AdminDisputesPage() {
  const queryClient = useQueryClient();
  const { profile, isLoading: isLoadingProfile, refresh } = useCurrentProfile();
  const { isMobile } = useResponsive();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Vérifier que l'utilisateur est admin (insensible à la casse et aux espaces)
  const isAdmin = profile?.role?.toLowerCase().trim() === "admin";

  // Debug: log du profil pour vérifier le rôle
  useEffect(() => {
    console.log("État du profil:", {
      isLoading: isLoadingProfile,
      profile: profile
        ? {
            id: profile.id,
            role: profile.role,
            email: profile.email,
          }
        : null,
      isAdmin,
    });
  }, [profile, isLoadingProfile, isAdmin]);

  // Forcer un refetch immédiat au montage pour éviter les problèmes de cache
  useEffect(() => {
    const forceRefresh = async () => {
      console.log("Forçage du rafraîchissement du profil...");
      // Invalider le cache
      await queryClient.invalidateQueries({ queryKey: ["profile", "current"] });
      // Forcer un refetch immédiat
      await refresh();

      // Vérification directe dans Supabase pour déboguer
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: directProfile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          console.log("Vérification directe Supabase:", {
            userId: user.id,
            profile: directProfile,
            error: profileError,
            role: directProfile?.role,
          });
        }
      } catch (err) {
        console.error("Erreur lors de la vérification directe:", err);
      }
    };
    forceRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Exécuté une seule fois au montage

  const fetchDisputes = useCallback(async () => {
    if (!isAdmin) {
      console.log("fetchDisputes: Utilisateur non admin, arrêt");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("Début de la récupération des litiges...");

      // D'abord, récupérer tous les litiges sans jointures pour voir ce qui existe
      const { data: allDisputes, error: allDisputesError } = await supabase
        .from("mission_disputes")
        .select("*")
        .order("created_at", { ascending: false });

      console.log("Tous les litiges (sans jointures):", allDisputes);
      console.log("Erreur (sans jointures):", allDisputesError);

      // Ensuite, récupérer avec les jointures
      const { data, error: fetchError } = await supabase
        .from("mission_disputes")
        .select(
          `
          *,
          missions (id, title),
          profiles!mission_disputes_reporter_id_fkey (id, first_name, last_name),
          mission_payments (id, amount)
        `,
        )
        .order("created_at", { ascending: false });

      console.log("Litiges avec jointures:", data);
      console.log("Erreur avec jointures:", fetchError);

      if (fetchError) {
        console.error("Erreur récupération litiges:", fetchError);
        setError("Erreur lors du chargement des litiges");
        return;
      }

      // Formater les données
      const formattedDisputes: Dispute[] = (data || []).map((d: any) => {
        // Gérer les cas où les relations peuvent être null ou arrays
        const mission = Array.isArray(d.missions) ? d.missions[0] : d.missions;
        const profile = Array.isArray(d.profiles) ? d.profiles[0] : d.profiles;
        const payment = Array.isArray(d.mission_payments)
          ? d.mission_payments[0]
          : d.mission_payments;

        return {
          id: d.id,
          mission_id: d.mission_id,
          mission_payment_id: d.mission_payment_id,
          reporter_id: d.reporter_id,
          reason: d.reason,
          description: d.description,
          status: d.status,
          resolution: d.resolution,
          resolved_by: d.resolved_by,
          resolved_at: d.resolved_at,
          is_stripe_dispute: d.is_stripe_dispute,
          stripe_dispute_id: d.stripe_dispute_id,
          stripe_dispute_status: d.stripe_dispute_status,
          created_at: d.created_at,
          mission_title: mission?.title || "Mission supprimée",
          reporter_name: profile
            ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() ||
              "Utilisateur inconnu"
            : "Utilisateur inconnu",
          payment_amount: payment?.amount || null,
        };
      });

      console.log("Litiges formatés:", formattedDisputes);

      setDisputes(formattedDisputes);
    } catch (err) {
      console.error("Erreur:", err);
      setError("Erreur lors du chargement");
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  const handleResolveDispute = async (
    disputeId: string,
    action: "resolve" | "reject",
    resolution?: string,
  ) => {
    setIsProcessing(disputeId);
    setError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      const response = await fetch(`/api/admin/disputes/${disputeId}/resolve`, {
        method: "POST",
        headers,
        body: JSON.stringify({ action, resolution }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la résolution");
      }

      await fetchDisputes();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur lors de la résolution";
      setError(errorMessage);
    } finally {
      setIsProcessing(null);
    }
  };

  const formatAmount = (amountInCents: number | null | undefined) => {
    if (!amountInCents) return "0 €";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amountInCents / 100);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoadingProfile) {
    return (
      <AppLayout>
        <YStack
          flex={1}
          backgroundColor="#F9FAFB"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
        >
          <Spinner size="large" color={colors.shiftlyViolet} />
        </YStack>
      </AppLayout>
    );
  }

  if (!isAdmin) {
    return (
      <AppLayout>
        <YStack
          flex={1}
          backgroundColor="#F9FAFB"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          gap="$4"
        >
          <FiAlertTriangle size={48} color={colors.shiftlyMarron} />
          <Text fontSize={18} fontWeight="600" color={colors.gray900}>
            Accès non autorisé
          </Text>
          <Text fontSize={14} color={colors.gray700} textAlign="center">
            Cette page est réservée aux administrateurs.
          </Text>
          {profile && (
            <YStack
              marginTop="$4"
              padding="$3"
              backgroundColor={colors.gray100}
              borderRadius={8}
              gap="$2"
            >
              <Text fontSize={12} fontWeight="600" color={colors.gray900}>
                Informations de débogage:
              </Text>
              <Text fontSize={11} color={colors.gray700}>
                Rôle actuel: {profile.role || "non défini"}
              </Text>
              <Text fontSize={11} color={colors.gray700}>
                Rôle requis: admin
              </Text>
              <Text fontSize={11} color={colors.gray700} marginTop="$2">
                Si vous avez modifié votre rôle en base de données, essayez de
                rafraîchir la page (F5) ou de vous déconnecter/reconnecter.
              </Text>
            </YStack>
          )}
        </YStack>
      </AppLayout>
    );
  }

  const openDisputes = disputes.filter((d) => d.status === "open");
  const resolvedDisputes = disputes.filter((d) => d.status === "resolved");
  const rejectedDisputes = disputes.filter((d) => d.status === "rejected");

  return (
    <AppLayout>
      <ScrollView flex={1} backgroundColor="#F9FAFB">
        <YStack
          flex={1}
          padding={isMobile ? "$4" : "$6"}
          gap="$6"
          maxWidth={1200}
          alignSelf="center"
          width="100%"
        >
          <PageHeader
            title="Gestion des litiges"
            description="Gérez les litiges signalés par les recruteurs et les disputes Stripe"
          />

          {error && (
            <YStack backgroundColor={"#FEF2F2"} borderRadius={8} padding="$3">
              <Text color={"#DC2626"}>{error}</Text>
            </YStack>
          )}

          {/* Litiges ouverts */}
          {openDisputes.length > 0 && (
            <YStack gap="$3">
              <XStack alignItems="center" gap="$2">
                <FiAlertTriangle size={20} color={"#D97706"} />
                <Text fontSize={16} fontWeight="600" color={colors.gray900}>
                  Litiges ouverts ({openDisputes.length})
                </Text>
              </XStack>

              {openDisputes.map((dispute) => (
                <DisputeCard
                  key={dispute.id}
                  dispute={dispute}
                  formatAmount={formatAmount}
                  formatDate={formatDate}
                  isProcessing={isProcessing === dispute.id}
                  onResolve={(resolution) =>
                    handleResolveDispute(dispute.id, "resolve", resolution)
                  }
                  onReject={() => handleResolveDispute(dispute.id, "reject")}
                  isMobile={isMobile}
                />
              ))}
            </YStack>
          )}

          {/* Litiges résolus */}
          {resolvedDisputes.length > 0 && (
            <YStack gap="$3">
              <XStack alignItems="center" gap="$2">
                <FiCheck size={20} color={"#059669"} />
                <Text fontSize={16} fontWeight="600" color={colors.gray900}>
                  Litiges résolus ({resolvedDisputes.length})
                </Text>
              </XStack>

              {resolvedDisputes.map((dispute) => (
                <DisputeCard
                  key={dispute.id}
                  dispute={dispute}
                  formatAmount={formatAmount}
                  formatDate={formatDate}
                  isReadOnly={true}
                  isMobile={isMobile}
                />
              ))}
            </YStack>
          )}

          {/* Aucun litige */}
          {disputes.length === 0 && !isLoading && (
            <YStack
              backgroundColor={colors.white}
              borderRadius={12}
              padding="$6"
              alignItems="center"
              gap="$3"
            >
              <FiCheck size={48} color={"#6B7280"} />
              <Text fontSize={16} fontWeight="600" color={colors.gray700}>
                Aucun litige
              </Text>
              <Text fontSize={14} color={colors.gray500} textAlign="center">
                Tous les paiements se déroulent sans problème.
              </Text>
            </YStack>
          )}
        </YStack>
      </ScrollView>
    </AppLayout>
  );
}

function DisputeCard({
  dispute,
  formatAmount,
  formatDate,
  isProcessing,
  isReadOnly,
  onResolve,
  onReject,
  isMobile = false,
}: {
  dispute: Dispute;
  formatAmount: (amount: number | null | undefined) => string;
  formatDate: (date: string) => string;
  isProcessing?: boolean;
  isReadOnly?: boolean;
  onResolve?: (resolution?: string) => void;
  onReject?: () => void;
  isMobile?: boolean;
}) {
  const bgColor =
    dispute.status === "resolved"
      ? "#ECFDF5"
      : dispute.status === "rejected"
        ? colors.gray050
        : "#FFFBEB";

  const borderColor =
    dispute.status === "resolved"
      ? "#A7F3D0"
      : dispute.status === "rejected"
        ? colors.gray200
        : "#FDE68A";

  return (
    <YStack
      backgroundColor={bgColor}
      borderRadius={12}
      padding="$4"
      borderWidth={1}
      borderColor={borderColor}
    >
      <XStack
        flexDirection={isMobile ? "column" : "row"}
        justifyContent="space-between"
        alignItems={isMobile ? "stretch" : "flex-start"}
        gap="$4"
      >
        <YStack flex={isMobile ? undefined : 1} gap="$2">
          <XStack alignItems="center" gap="$2">
            {dispute.is_stripe_dispute && (
              <YStack
                backgroundColor="#FEE2E2"
                borderRadius={4}
                paddingHorizontal="$2"
                paddingVertical="$1"
              >
                <Text fontSize={11} fontWeight="600" color="#B91C1C">
                  STRIPE
                </Text>
              </YStack>
            )}
            <Text fontSize={15} fontWeight="600" color={colors.gray900}>
              {dispute.mission_title || "Mission"}
            </Text>
          </XStack>

          <Text fontSize={13} color={colors.gray700}>
            <Text fontWeight="600">Raison:</Text> {dispute.reason}
          </Text>

          {dispute.description && (
            <Text fontSize={13} color={colors.gray700}>
              <Text fontWeight="600">Description:</Text> {dispute.description}
            </Text>
          )}

          <XStack
            gap="$4"
            marginTop="$1"
            flexWrap={isMobile ? "wrap" : "nowrap"}
          >
            <Text fontSize={12} color={colors.gray700}>
              Signalé par: {dispute.reporter_name || "Inconnu"}
            </Text>
            <Text fontSize={12} color={colors.gray700}>
              Montant: {formatAmount(dispute.payment_amount)}
            </Text>
            <Text fontSize={12} color={colors.gray700}>
              {formatDate(dispute.created_at)}
            </Text>
          </XStack>

          {dispute.resolution && (
            <YStack
              backgroundColor={colors.white}
              borderRadius={8}
              padding="$2"
              marginTop="$2"
            >
              <Text fontSize={12} color={colors.gray700}>
                <Text fontWeight="600">Résolution:</Text> {dispute.resolution}
              </Text>
            </YStack>
          )}

          {dispute.stripe_dispute_id && (
            <XStack alignItems="center" gap="$2" marginTop="$2">
              <FiExternalLink size={14} color={colors.gray500} />
              <Text fontSize={12} color={colors.gray700}>
                Dispute Stripe: {dispute.stripe_dispute_id}
              </Text>
            </XStack>
          )}
        </YStack>

        {!isReadOnly && dispute.status === "open" && (
          <XStack gap="$2" flexShrink={0}>
            <Button
              variant="outline"
              size="sm"
              onPress={() => onReject?.()}
              disabled={isProcessing}
            >
              <XStack alignItems="center" gap="$2">
                <FiX size={14} color={colors.gray700} />
                <Text fontSize={12} fontWeight="600">
                  Rejeter
                </Text>
              </XStack>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onPress={() => onResolve?.()}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Spinner size="small" color={colors.white} />
              ) : (
                <XStack alignItems="center" gap="$2">
                  <FiCheck size={14} color={colors.white} />
                  <Text fontSize={12} fontWeight="600" color={colors.white}>
                    Résoudre
                  </Text>
                </XStack>
              )}
            </Button>
          </XStack>
        )}
      </XStack>
    </YStack>
  );
}
