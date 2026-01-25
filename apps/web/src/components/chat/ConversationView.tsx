"use client";

import { useState } from "react";
import { YStack, XStack, Text, Spinner } from "tamagui";
import { Button, colors } from "@shiftly/ui";
import type { ConversationWithDetails } from "@shiftly/data";
import { ChatThread } from "./ChatThread";
import { MessageInput } from "./MessageInput";
import type { Message } from "@shiftly/data";
import { useMissionPaymentInConversation } from "@/hooks/stripe/useMissionPaymentInConversation";
import { DisputeModal } from "@/components/dispute";
import { FiCreditCard, FiCheck, FiClock, FiAlertCircle, FiAlertTriangle } from "react-icons/fi";

interface ConversationViewProps {
  conversation: ConversationWithDetails;
  messages: Message[];
  currentUserId: string;
  senderNames: Map<string, string>;
  isLoading: boolean;
  isSending: boolean;
  onSendMessage: (content: string) => Promise<boolean>;
  onMarkAsRead: () => void;
  onClose: () => void;
  getOtherParticipantName: (conversation: ConversationWithDetails) => string;
}

export function ConversationView({
  conversation,
  messages,
  currentUserId,
  senderNames,
  isLoading,
  isSending,
  onSendMessage,
  onMarkAsRead,
  onClose,
  getOtherParticipantName,
}: ConversationViewProps) {
  const [showDisputeModal, setShowDisputeModal] = useState(false);

  const handleSend = async (content: string) => {
    await onSendMessage(content);
    onMarkAsRead();
  };

  // Hook pour gérer le paiement de la mission
  const {
    isRecruiter,
    isFreelance,
    paymentInfo,
    isLoading: isLoadingPayment,
    isProcessing,
    error: paymentError,
    startCheckout,
    reportDispute,
    refreshPaymentInfo,
  } = useMissionPaymentInConversation(conversation, currentUserId);

  const handleReportDispute = async (
    reason: string,
    description?: string
  ): Promise<void> => {
    const result = await reportDispute(reason, description);
    if (result.success) {
      setShowDisputeModal(false);
      await refreshPaymentInfo();
    }
  };

  // Formater le montant en euros
  const formatAmount = (amountInCents: number | null) => {
    if (!amountInCents) return "0 €";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amountInCents / 100);
  };

  return (
    <YStack flex={1} backgroundColor={colors.white}>
      {/* En-tête de la conversation */}
      <YStack
        padding="$4"
        borderBottomWidth={1}
        borderBottomColor={colors.gray200}
        backgroundColor={colors.white}
      >
        <XStack alignItems="center" justifyContent="space-between">
          <YStack>
            <Text fontSize={16} fontWeight="600" color={colors.gray900}>
              {getOtherParticipantName(conversation)}
            </Text>
            {conversation.mission && (
              <Text fontSize={12} color={colors.gray700}>
                {conversation.mission.title}
              </Text>
            )}
          </YStack>
          <Button variant="ghost" size="sm" onPress={onClose}>
            Fermer
          </Button>
        </XStack>
      </YStack>

      {/* Bandeau de paiement (visible uniquement pour le recruteur) */}
      {isRecruiter && paymentInfo && (
        <YStack
          padding="$3"
          backgroundColor={
            paymentInfo.status === "distributed"
              ? colors.green50 || "#ECFDF5"
              : paymentInfo.status === "received"
                ? colors.blue50 || "#EFF6FF"
                : paymentInfo.status === "pending"
                  ? colors.yellow50 || "#FFFBEB"
                  : paymentInfo.status === "errored"
                    ? colors.red50 || "#FEF2F2"
                    : colors.purple50 || "#F5F3FF"
          }
          borderBottomWidth={1}
          borderBottomColor={colors.gray200}
        >
          <XStack alignItems="center" justifyContent="space-between" gap="$3">
            <XStack alignItems="center" gap="$2" flex={1}>
              {paymentInfo.status === "distributed" ? (
                <>
                  <FiCheck size={18} color={colors.green600 || "#059669"} />
                  <YStack flex={1}>
                    <Text fontSize={13} fontWeight="600" color={colors.green700 || "#047857"}>
                      Fonds distribués ✓
                    </Text>
                    <Text fontSize={12} color={colors.green600 || "#059669"}>
                      {formatAmount(paymentInfo.amount)} - Les paiements ont été effectués
                    </Text>
                  </YStack>
                </>
              ) : paymentInfo.hasDispute ? (
                <>
                  <FiAlertTriangle size={18} color={colors.yellow600 || "#D97706"} />
                  <YStack flex={1}>
                    <Text fontSize={13} fontWeight="600" color={colors.yellow700 || "#B45309"}>
                      Litige en cours ⚠️
                    </Text>
                    <Text fontSize={12} color={colors.yellow600 || "#D97706"}>
                      Un problème a été signalé. La libération des fonds est bloquée.
                    </Text>
                  </YStack>
                </>
              ) : paymentInfo.status === "received" ? (
                <>
                  <FiClock size={18} color={colors.blue600 || "#2563EB"} />
                  <YStack flex={1}>
                    <Text fontSize={13} fontWeight="600" color={colors.blue700 || "#1D4ED8"}>
                      Paiement reçu - Libération automatique prévue
                    </Text>
                    <Text fontSize={12} color={colors.blue600 || "#2563EB"}>
                      {formatAmount(paymentInfo.amount)} - Les fonds seront libérés automatiquement à la fin de la mission
                    </Text>
                  </YStack>
                </>
              ) : paymentInfo.status === "pending" ? (
                <>
                  <FiClock size={18} color={colors.yellow600 || "#D97706"} />
                  <YStack flex={1}>
                    <Text fontSize={13} fontWeight="600" color={colors.yellow700 || "#B45309"}>
                      Paiement en cours
                    </Text>
                    <Text fontSize={12} color={colors.yellow600 || "#D97706"}>
                      {formatAmount(paymentInfo.amount)}
                    </Text>
                  </YStack>
                </>
              ) : paymentInfo.status === "errored" ? (
                <>
                  <FiAlertCircle size={18} color={colors.red600 || "#DC2626"} />
                  <YStack flex={1}>
                    <Text fontSize={13} fontWeight="600" color={colors.red700 || "#B91C1C"}>
                      Erreur de distribution
                    </Text>
                    <Text fontSize={12} color={colors.red600 || "#DC2626"}>
                      Contactez le support pour résoudre ce problème
                    </Text>
                  </YStack>
                </>
              ) : (
                <>
                  <FiCreditCard size={18} color={colors.purple600 || "#7C3AED"} />
                  <YStack flex={1}>
                    <Text fontSize={13} fontWeight="600" color={colors.gray800}>
                      Payer la mission
                    </Text>
                    <Text fontSize={12} color={colors.gray600}>
                      {formatAmount(paymentInfo.amount)} - Salaire total
                    </Text>
                  </YStack>
                </>
              )}
            </XStack>

            {/* Bouton de paiement (checkout) */}
            {paymentInfo.canPay && (
              <Button
                variant="primary"
                size="sm"
                onPress={startCheckout}
                disabled={isProcessing || isLoadingPayment}
              >
                {isProcessing ? (
                  <XStack alignItems="center" gap="$2">
                    <Spinner size="small" color={colors.white} />
                    <Text color={colors.white} fontSize={13}>
                      Chargement...
                    </Text>
                  </XStack>
                ) : (
                  <XStack alignItems="center" gap="$2">
                    <FiCreditCard size={16} color={colors.white} />
                    <Text color={colors.white} fontSize={13} fontWeight="600">
                      Payer {formatAmount(paymentInfo.amount)}
                    </Text>
                  </XStack>
                )}
              </Button>
            )}

            {/* Bouton pour signaler un problème */}
            {paymentInfo.canReportDispute && (
              <Button
                variant="outline"
                size="sm"
                onPress={() => setShowDisputeModal(true)}
                disabled={isProcessing || isLoadingPayment}
              >
                <XStack alignItems="center" gap="$2">
                  <FiAlertTriangle size={16} color={colors.yellow600 || "#D97706"} />
                  <Text
                    color={colors.yellow600 || "#D97706"}
                    fontSize={13}
                    fontWeight="600"
                  >
                    Signaler un problème
                  </Text>
                </XStack>
              </Button>
            )}
          </XStack>

          {/* Message d'erreur */}
          {paymentError && (
            <Text fontSize={12} color={colors.red600 || "#DC2626"} marginTop="$2">
              {paymentError}
            </Text>
          )}
        </YStack>
      )}

      {/* Bandeau de paiement (visible pour le freelance) */}
      {isFreelance &&
        paymentInfo &&
        (paymentInfo.status === "received" || paymentInfo.status === "distributed") && (
          <YStack
            padding="$3"
            backgroundColor={
              paymentInfo.status === "distributed"
                ? colors.green50 || "#ECFDF5"
                : colors.blue50 || "#EFF6FF"
            }
            borderBottomWidth={1}
            borderBottomColor={colors.gray200}
          >
            <XStack alignItems="center" gap="$2">
              {paymentInfo.status === "distributed" ? (
                <>
                  <FiCheck size={18} color={colors.green600 || "#059669"} />
                  <YStack flex={1}>
                    <Text
                      fontSize={13}
                      fontWeight="600"
                      color={colors.green700 || "#047857"}
                    >
                      Paiement reçu ! 🎉
                    </Text>
                    <Text fontSize={12} color={colors.green600 || "#059669"}>
                      {formatAmount(paymentInfo.freelancerAmount)} ont été versés
                      sur votre compte
                    </Text>
                  </YStack>
                </>
              ) : (
                <>
                  <FiClock size={18} color={colors.blue600 || "#2563EB"} />
                  <YStack flex={1}>
                    <Text
                      fontSize={13}
                      fontWeight="600"
                      color={colors.blue700 || "#1D4ED8"}
                    >
                      Paiement sécurisé
                    </Text>
                    <Text fontSize={12} color={colors.blue600 || "#2563EB"}>
                      Le recruteur a payé la mission. Vous recevrez{" "}
                      {formatAmount(paymentInfo.freelancerAmount)} à la fin de la
                      mission.
                    </Text>
                  </YStack>
                </>
              )}
            </XStack>
          </YStack>
        )}

      {/* Messages */}
      <ChatThread
        messages={messages}
        currentUserId={currentUserId}
        senderNames={senderNames}
        isLoading={isLoading}
      />

      {/* Input */}
      <MessageInput onSend={handleSend} isSending={isSending} />

      {/* Modal de signalement de problème */}
      <DisputeModal
        open={showDisputeModal}
        onOpenChange={setShowDisputeModal}
        onConfirm={handleReportDispute}
        missionTitle={paymentInfo?.missionTitle}
      />
    </YStack>
  );
}
