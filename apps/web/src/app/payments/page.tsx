"use client";

import { useState, useEffect, useCallback } from "react";
import { YStack, XStack, ScrollView, Text, Spinner } from "tamagui";
import { colors, Button } from "@shiftly/ui";
import { AppLayout, PageHeader } from "@/components";
import { useCurrentProfile } from "@/hooks";
import { useConnectOnboarding } from "@/hooks/stripe/useConnectOnboarding";
import { supabase } from "@shiftly/data";
import {
  FiCheck,
  FiClock,
  FiAlertTriangle,
  FiCreditCard,
  FiExternalLink,
  FiRefreshCw,
  FiDollarSign,
  FiCalendar,
} from "react-icons/fi";

interface PaymentItem {
  id: string;
  missionId: string;
  missionPaymentId: string; // ID du paiement pour relancer le transfert
  missionTitle: string;
  amount: number; // En centimes
  freelancerAmount: number;
  status: "pending" | "received" | "distributed" | "errored" | "skipped";
  paidAt?: string;
  distributedAt?: string;
  endDate?: string;
  transferStatus?: "created" | "pending" | "failed" | "skipped";
  transferId?: string;
  canRetry?: boolean;
  hasDispute?: boolean; // Indique si un litige est en cours
  disputeStatus?: "open" | "resolved" | "rejected"; // Statut du litige
  disputeReason?: string; // Raison du litige
}

export default function PaymentsPage() {
  const { profile, isLoading: isLoadingProfile } = useCurrentProfile();
  const {
    status: connectStatus,
    isLoading: isLoadingConnect,
    startOnboarding,
    refreshStatus,
  } = useConnectOnboarding();

  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  const [isRetrying, setIsRetrying] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Vérifie si l'utilisateur peut accéder à cette page
  const canAccess =
    profile?.role === "freelance" || profile?.role === "commercial";
  const isConnectComplete = connectStatus?.onboardingStatus === "complete";
  const payoutsEnabled = connectStatus?.payoutsEnabled || false;

  // Charger les paiements
  const fetchPayments = useCallback(async () => {
    if (!profile?.id || !canAccess) return;

    setIsLoadingPayments(true);
    setError(null);

    try {
      // Récupérer les paiements selon le rôle
      let query;

      if (profile.role === "freelance") {
        // Pour les freelances: récupérer via mission_finance.freelancer_id
        query = supabase
          .from("mission_finance")
          .select(
            `
            id,
            mission_id,
            mission_payment_id,
            freelancer_amount,
            status,
            created_at,
            mission_payments!inner (
              id,
              amount,
              status,
              paid_at,
              distributed_at
            ),
            missions!inner (
              id,
              title,
              end_date
            )
          `
          )
          .eq("freelancer_id", profile.id)
          .order("created_at", { ascending: false });
      } else {
        // Pour les commerciaux: récupérer via mission_finance.commercial_id
        query = supabase
          .from("mission_finance")
          .select(
            `
            id,
            mission_id,
            mission_payment_id,
            commercial_fee_amount,
            status,
            created_at,
            mission_payments!inner (
              id,
              amount,
              status,
              paid_at,
              distributed_at
            ),
            missions!inner (
              id,
              title,
              end_date
            )
          `
          )
          .eq("commercial_id", profile.id)
          .order("created_at", { ascending: false });
      }

      const { data: financeData, error: financeError } = await query;

      if (financeError) {
        console.error("Erreur récupération finances:", financeError);
        setError("Erreur lors du chargement des paiements");
        return;
      }

      // Récupérer les transferts associés
      const paymentIds =
        financeData?.map((f: { mission_payment_id: string }) => f.mission_payment_id) || [];
      const { data: transfersData } = await supabase
        .from("mission_transfers")
        .select("*")
        .in("mission_payment_id", paymentIds)
        .eq("destination_profile_id", profile.id);

      // Récupérer les litiges associés aux paiements
      const { data: disputesData } = await supabase
        .from("mission_disputes")
        .select("mission_payment_id, status, reason")
        .in("mission_payment_id", paymentIds)
        .eq("status", "open"); // Seulement les litiges ouverts

      // Construire la liste des paiements
      // Note: Supabase retourne les relations comme objets ou tableaux selon la config
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const paymentItems: PaymentItem[] = (financeData || []).map((finance: any) => {
        const transfer = transfersData?.find(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (t: any) => t.mission_payment_id === finance.mission_payment_id
        );

        const amount =
          profile.role === "freelance"
            ? finance.freelancer_amount || 0
            : finance.commercial_fee_amount || 0;

        // Accéder aux relations (peuvent être objet ou premier élément d'un tableau)
        const missionPayment = Array.isArray(finance.mission_payments)
          ? finance.mission_payments[0]
          : finance.mission_payments;
        const mission = Array.isArray(finance.missions)
          ? finance.missions[0]
          : finance.missions;

        let status: PaymentItem["status"] = "pending";
        if (missionPayment?.status === "distributed") {
          status = transfer?.status === "created" ? "distributed" : "skipped";
        } else if (missionPayment?.status === "received") {
          status = "received";
        } else if (missionPayment?.status === "errored") {
          status = "errored";
        }

        // Peut réessayer si skipped et Stripe Connect est configuré
        const canRetry =
          status === "skipped" && isConnectComplete && payoutsEnabled;

        // Vérifier si ce paiement a un litige en cours
        const dispute = disputesData?.find(
          (d) => d.mission_payment_id === finance.mission_payment_id
        );

        return {
          id: finance.id,
          missionId: finance.mission_id,
          missionPaymentId: finance.mission_payment_id,
          missionTitle: mission?.title || "Mission",
          amount: missionPayment?.amount || 0,
          freelancerAmount: amount,
          status,
          paidAt: missionPayment?.paid_at,
          distributedAt: missionPayment?.distributed_at,
          endDate: mission?.end_date,
          transferStatus: transfer?.status,
          transferId: transfer?.stripe_transfer_id,
          canRetry,
          hasDispute: !!dispute,
          disputeStatus: dispute?.status,
          disputeReason: dispute?.reason,
        };
      });

      setPayments(paymentItems);
    } catch (err) {
      console.error("Erreur:", err);
      setError("Erreur lors du chargement des paiements");
    } finally {
      setIsLoadingPayments(false);
    }
  }, [profile?.id, profile?.role, canAccess, isConnectComplete, payoutsEnabled]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  // Lancer l'onboarding Stripe
  const handleStartOnboarding = async () => {
    const url = await startOnboarding();
    if (url) {
      window.location.href = url;
    }
  };

  // Réessayer un transfert skippé
  const handleRetryTransfer = async (payment: PaymentItem) => {
    setIsRetrying(payment.id);
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

      // Utiliser le nouvel endpoint dédié pour les freelances/commerciaux
      const response = await fetch("/api/payments/retry-transfer", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          missionPaymentId: payment.missionPaymentId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors du transfert");
      }

      // Rafraîchir la liste
      await fetchPayments();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur lors du transfert";
      setError(errorMessage);
    } finally {
      setIsRetrying(null);
    }
  };

  // Formater le montant
  const formatAmount = (amountInCents: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amountInCents / 100);
  };

  // Formater la date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Filtrer les paiements par statut
  const paymentsWithDisputes = payments.filter((p) => p.hasDispute);
  const upcomingPayments = payments.filter(
    (p) => (p.status === "received" || p.status === "pending") && !p.hasDispute
  );
  const completedPayments = payments.filter(
    (p) => p.status === "distributed" && !p.hasDispute
  );
  const skippedPayments = payments.filter(
    (p) => (p.status === "skipped" || p.status === "errored") && !p.hasDispute
  );

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
          <Text fontSize={16} color="#6B7280" marginTop="$4">
            Chargement...
          </Text>
        </YStack>
      </AppLayout>
    );
  }

  if (!canAccess) {
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
            Cette page est réservée aux freelances et commerciaux.
          </Text>
        </YStack>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <ScrollView flex={1} backgroundColor="#F9FAFB">
        <YStack
          flex={1}
          padding="$4"
          gap="$6"
          maxWidth={1200}
          alignSelf="center"
          width="100%"
        >
          <PageHeader
            title="Mes paiements"
            description="Suivez vos paiements et gérez votre compte de réception"
          />

          {/* Section Stripe Connect */}
          <YStack
            backgroundColor={colors.white}
            borderRadius={12}
            padding="$5"
            shadowColor="#000"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.05}
            shadowRadius={8}
          >
            <XStack alignItems="center" gap="$3" marginBottom="$4">
              <FiCreditCard size={24} color={colors.shiftlyViolet} />
              <Text fontSize={18} fontWeight="600" color={colors.gray900}>
                Compte Stripe Connect
              </Text>
            </XStack>

            {isLoadingConnect ? (
              <XStack alignItems="center" gap="$2">
                <Spinner size="small" color={colors.shiftlyViolet} />
                <Text color={colors.gray600}>Vérification du statut...</Text>
              </XStack>
            ) : isConnectComplete && payoutsEnabled ? (
              <XStack alignItems="center" gap="$3">
                <YStack
                  backgroundColor={colors.green100 || "#D1FAE5"}
                  borderRadius={100}
                  padding="$2"
                >
                  <FiCheck size={20} color={colors.green600 || "#059669"} />
                </YStack>
                <YStack flex={1}>
                  <Text
                    fontSize={15}
                    fontWeight="600"
                    color={colors.green700 || "#047857"}
                  >
                    Compte configuré ✓
                  </Text>
                  <Text fontSize={13} color={colors.gray600}>
                    Vous pouvez recevoir des paiements sur votre compte.
                  </Text>
                </YStack>
              </XStack>
            ) : (
              <YStack gap="$3">
                <XStack alignItems="center" gap="$3">
                  <YStack
                    backgroundColor={colors.yellow100 || "#FEF3C7"}
                    borderRadius={100}
                    padding="$2"
                  >
                    <FiAlertTriangle
                      size={20}
                      color={colors.yellow600 || "#D97706"}
                    />
                  </YStack>
                  <YStack flex={1}>
                    <Text
                      fontSize={15}
                      fontWeight="600"
                      color={colors.yellow700 || "#B45309"}
                    >
                      Configuration requise
                    </Text>
                    <Text fontSize={13} color={colors.gray600}>
                      Configurez votre compte Stripe pour recevoir vos
                      paiements.
                    </Text>
                  </YStack>
                </XStack>

                <Button
                  variant="primary"
                  onPress={handleStartOnboarding}
                  disabled={isLoadingConnect}
                >
                  <XStack alignItems="center" gap="$2">
                    <FiExternalLink size={16} color={colors.white} />
                    <Text color={colors.white} fontWeight="600">
                      Configurer mon compte Stripe
                    </Text>
                  </XStack>
                </Button>
              </YStack>
            )}
          </YStack>

          {/* Erreur */}
          {error && (
            <YStack
              backgroundColor={colors.red50 || "#FEF2F2"}
              borderRadius={8}
              padding="$3"
            >
              <Text color={colors.red600 || "#DC2626"}>{error}</Text>
            </YStack>
          )}

          {/* Paiements avec litiges */}
          {paymentsWithDisputes.length > 0 && (
            <YStack gap="$3">
              <XStack alignItems="center" gap="$2">
                <FiAlertTriangle
                  size={20}
                  color={colors.red600 || "#DC2626"}
                />
                <Text fontSize={16} fontWeight="600" color={colors.gray900}>
                  Paiements en litige ({paymentsWithDisputes.length})
                </Text>
              </XStack>

              {paymentsWithDisputes.map((payment) => (
                <PaymentCard
                  key={payment.id}
                  payment={payment}
                  formatAmount={formatAmount}
                  formatDate={formatDate}
                  type="upcoming"
                />
              ))}
            </YStack>
          )}

          {/* Paiements en attente / à venir */}
          {upcomingPayments.length > 0 && (
            <YStack gap="$3">
              <XStack alignItems="center" gap="$2">
                <FiClock size={20} color={colors.blue600 || "#2563EB"} />
                <Text fontSize={16} fontWeight="600" color={colors.gray900}>
                  Paiements en attente ({upcomingPayments.length})
                </Text>
              </XStack>

              {upcomingPayments.map((payment) => (
                <PaymentCard
                  key={payment.id}
                  payment={payment}
                  formatAmount={formatAmount}
                  formatDate={formatDate}
                  type="upcoming"
                />
              ))}
            </YStack>
          )}

          {/* Paiements à récupérer (skippés) */}
          {skippedPayments.length > 0 && (
            <YStack gap="$3">
              <XStack alignItems="center" gap="$2">
                <FiAlertTriangle
                  size={20}
                  color={colors.yellow600 || "#D97706"}
                />
                <Text fontSize={16} fontWeight="600" color={colors.gray900}>
                  Paiements à récupérer ({skippedPayments.length})
                </Text>
              </XStack>

              {skippedPayments.map((payment) => (
                <PaymentCard
                  key={payment.id}
                  payment={payment}
                  formatAmount={formatAmount}
                  formatDate={formatDate}
                  type="skipped"
                  canRetry={payment.canRetry}
                  isRetrying={isRetrying === payment.id}
                  onRetry={() => handleRetryTransfer(payment)}
                />
              ))}
            </YStack>
          )}

          {/* Paiements reçus */}
          {completedPayments.length > 0 && (
            <YStack gap="$3">
              <XStack alignItems="center" gap="$2">
                <FiCheck size={20} color={colors.green600 || "#059669"} />
                <Text fontSize={16} fontWeight="600" color={colors.gray900}>
                  Paiements reçus ({completedPayments.length})
                </Text>
              </XStack>

              {completedPayments.map((payment) => (
                <PaymentCard
                  key={payment.id}
                  payment={payment}
                  formatAmount={formatAmount}
                  formatDate={formatDate}
                  type="completed"
                />
              ))}
            </YStack>
          )}

          {/* Aucun paiement */}
          {!isLoadingPayments && payments.length === 0 && (
            <YStack
              backgroundColor={colors.white}
              borderRadius={12}
              padding="$6"
              alignItems="center"
              gap="$3"
            >
              <FiDollarSign size={48} color={colors.gray400} />
              <Text
                fontSize={16}
                fontWeight="600"
                color={colors.gray700}
                textAlign="center"
              >
                Aucun paiement pour le moment
              </Text>
              <Text fontSize={14} color={colors.gray500} textAlign="center">
                Vos paiements apparaîtront ici une fois que vous aurez été payé
                pour une mission.
              </Text>
            </YStack>
          )}
        </YStack>
      </ScrollView>
    </AppLayout>
  );
}

// Composant carte de paiement
function PaymentCard({
  payment,
  formatAmount,
  formatDate,
  type,
  canRetry,
  isRetrying,
  onRetry,
}: {
  payment: PaymentItem;
  formatAmount: (amount: number) => string;
  formatDate: (date?: string) => string;
  type: "upcoming" | "completed" | "skipped";
  canRetry?: boolean;
  isRetrying?: boolean;
  onRetry?: () => void;
}) {
  const bgColor =
    type === "completed"
      ? colors.green50 || "#ECFDF5"
      : type === "skipped"
        ? colors.yellow50 || "#FFFBEB"
        : colors.blue50 || "#EFF6FF";

  const borderColor =
    type === "completed"
      ? colors.green200 || "#A7F3D0"
      : type === "skipped"
        ? colors.yellow200 || "#FDE68A"
        : colors.blue200 || "#BFDBFE";

  return (
    <YStack
      backgroundColor={bgColor}
      borderRadius={12}
      padding="$4"
      borderWidth={1}
      borderColor={payment.hasDispute ? colors.red200 || "#FECACA" : borderColor}
    >
      <XStack justifyContent="space-between" alignItems="flex-start">
        <YStack flex={1} gap="$1">
          <XStack alignItems="center" gap="$2" flexWrap="wrap">
            <Text fontSize={15} fontWeight="600" color={colors.gray900}>
              {payment.missionTitle}
            </Text>
            {payment.hasDispute && (
              <YStack
                backgroundColor={colors.red100 || "#FEE2E2"}
                borderRadius={4}
                paddingHorizontal="$2"
                paddingVertical="$1"
              >
                <XStack alignItems="center" gap="$1">
                  <FiAlertTriangle
                    size={12}
                    color={colors.red700 || "#B91C1C"}
                  />
                  <Text
                    fontSize={11}
                    fontWeight="600"
                    color={colors.red700 || "#B91C1C"}
                  >
                    Litige en cours
                  </Text>
                </XStack>
              </YStack>
            )}
          </XStack>

          {payment.hasDispute && payment.disputeReason && (
            <YStack
              backgroundColor={colors.red50 || "#FEF2F2"}
              borderRadius={6}
              padding="$2"
              marginTop="$2"
            >
              <Text fontSize={12} fontWeight="600" color={colors.red700 || "#B91C1C"} marginBottom="$1">
                Raison du litige:
              </Text>
              <Text fontSize={12} color={colors.red600 || "#DC2626"}>
                {payment.disputeReason}
              </Text>
            </YStack>
          )}

          <XStack alignItems="center" gap="$2" marginTop="$1">
            <FiCalendar size={14} color={colors.gray500} />
            <Text fontSize={13} color={colors.gray600}>
              {type === "completed"
                ? `Reçu le ${formatDate(payment.distributedAt)}`
                : type === "upcoming"
                  ? `Fin de mission: ${formatDate(payment.endDate)}`
                  : `Paiement du ${formatDate(payment.paidAt)}`}
            </Text>
          </XStack>

          {type === "skipped" && !canRetry && (
            <Text
              fontSize={12}
              color={colors.yellow700 || "#B45309"}
              marginTop="$2"
            >
              Configurez votre compte Stripe pour recevoir ce paiement.
            </Text>
          )}
        </YStack>

        <YStack alignItems="flex-end" gap="$2">
          <Text fontSize={18} fontWeight="700" color={colors.gray900}>
            {formatAmount(payment.freelancerAmount)}
          </Text>

          {type === "skipped" && canRetry && onRetry && (
            <Button
              variant="primary"
              size="sm"
              onPress={onRetry}
              disabled={isRetrying}
            >
              {isRetrying ? (
                <XStack alignItems="center" gap="$2">
                  <Spinner size="small" color={colors.white} />
                  <Text color={colors.white} fontSize={12}>
                    Transfert...
                  </Text>
                </XStack>
              ) : (
                <XStack alignItems="center" gap="$2">
                  <FiRefreshCw size={14} color={colors.white} />
                  <Text color={colors.white} fontSize={12} fontWeight="600">
                    Recevoir
                  </Text>
                </XStack>
              )}
            </Button>
          )}
        </YStack>
      </XStack>
    </YStack>
  );
}
