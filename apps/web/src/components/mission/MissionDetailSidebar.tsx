"use client";

import { YStack, XStack, Text } from "tamagui";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Button, colors } from "@shiftly/ui";
import { MapPin, Building2, Heart, CheckCircle2, Star, CreditCard, Loader2 } from "lucide-react";
import type { Mission } from "@shiftly/data";
import { openConversation } from "@/utils/chatService";
import { useMissionEstablishment } from "@/hooks";
import { useMissionPayment } from "@/hooks/stripe";
import { MissionAddressDisplay } from "./MissionAddressDisplay";

interface MissionDetailSidebarProps {
  mission: Mission;
  profile?: {
    id: string;
    role?: string;
  } | null;
  isRecruiter: boolean;
  isMissionOwner: boolean;
  showSuccessMessage: boolean;
  hasApplied: boolean;
  isApplying: boolean;
  isCheckingApplication: boolean;
  applyError?: string | null;
  onApply: () => void;
  onManageCandidates?: () => void;
  /** Monthly applications count (for non-premium freelances) */
  applicationsCount?: number;
  /** Monthly limit (null = unlimited for premium) */
  applicationsLimit?: number | null;
  /** Whether the freelance can still apply this month (quota not reached) */
  canApplyByQuota?: boolean;
}

export function MissionDetailSidebar({
  mission,
  profile,
  isRecruiter,
  isMissionOwner,
  showSuccessMessage,
  hasApplied,
  isApplying,
  isCheckingApplication,
  applyError,
  onApply,
  onManageCandidates,
  applicationsCount = 0,
  applicationsLimit = null,
  canApplyByQuota = true,
}: MissionDetailSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    establishment,
    isLoading: isLoadingEstablishment,
    displayName,
    displayAddress,
    displayCity,
    hasEstablishment,
  } = useMissionEstablishment(mission);
  
  // Hook pour le paiement de mission (uniquement pour le recruteur propriétaire)
  const {
    paymentStatus,
    isLoading: isLoadingPayment,
    isCheckingPayment,
    error: paymentError,
    isPaid,
    refreshPaymentStatus,
    initiatePayment,
  } = useMissionPayment(mission.id);

  // Rafraîchir le statut de paiement après retour de Stripe
  useEffect(() => {
    const paymentParam = searchParams.get("payment");
    if (paymentParam === "success") {
      refreshPaymentStatus();
    }
  }, [searchParams, refreshPaymentStatus]);

  // Handler pour initier le paiement
  const handlePayMission = async () => {
    const url = await initiatePayment();
    if (url) {
      window.location.href = url;
    }
  };

  return (
    <YStack width={320} gap="$4" flexShrink={0}>
      {/* Carte Rémunération */}
      <YStack
        backgroundColor="white"
        borderRadius={12}
        padding="$5"
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.1}
        shadowRadius={8}
      >
        <Text fontSize={14} color="#666" marginBottom="$2">
          Rémunération
        </Text>
        
        {mission.daily_rate ? (
          <YStack gap="$2" marginBottom="$4">
            <Text
              fontSize={32}
              fontWeight="bold"
              color={colors.shiftlyViolet}
            >
              {typeof mission.daily_rate === 'number' ? mission.daily_rate.toFixed(2) : mission.daily_rate}€/jour
            </Text>
            {mission.hourly_rate && (
              <Text fontSize={14} color="#666">
                ({mission.hourly_rate}€/h)
              </Text>
            )}
            {mission.total_salary && (
              <YStack
                marginTop="$2"
                padding="$3"
                backgroundColor={colors.shiftlyVioletLight}
                borderRadius={8}
              >
                <Text fontSize={14} color="#666" marginBottom="$1">
                  Salaire total
                </Text>
                <Text
                  fontSize={20}
                  fontWeight="600"
                  color={colors.shiftlyViolet}
                >
                  {typeof mission.total_salary === 'number' ? mission.total_salary.toFixed(2) : mission.total_salary}€
                </Text>
              </YStack>
            )}
          </YStack>
        ) : mission.hourly_rate ? (
          <Text
            fontSize={32}
            fontWeight="bold"
            color={colors.shiftlyViolet}
            marginBottom="$4"
          >
            {mission.hourly_rate}€/h
          </Text>
        ) : (
          <Text
            fontSize={32}
            fontWeight="bold"
            color={colors.gray700}
            marginBottom="$4"
          >
            À négocier
          </Text>
        )}

        {/* Boutons d'action */}
        <YStack gap="$3">
          {/* Boutons recruteur propriétaire */}
          {isRecruiter && isMissionOwner && (
            <>
              {/* Bouton Gérer les candidatures */}
              {onManageCandidates && (
                <Button
                  variant="primary"
                  size="md"
                  width="100%"
                  onPress={onManageCandidates}
                >
                  Gérer les candidatures
                </Button>
              )}

              {/* Bouton Payer la mission */}
              {isPaid ? (
                <XStack
                  paddingVertical="$3"
                  paddingHorizontal="$4"
                  backgroundColor="#D4F4DD"
                  borderRadius={8}
                  alignItems="center"
                  justifyContent="center"
                  gap="$2"
                >
                  <CheckCircle2
                    size={16}
                    color="#00A86B"
                    style={{ flexShrink: 0 }}
                  />
                  <Text fontSize={14} color="#00A86B" fontWeight="600">
                    Mission payée
                  </Text>
                </XStack>
              ) : (
                <Button
                  variant="outline"
                  size="md"
                  width="100%"
                  onPress={handlePayMission}
                  disabled={isLoadingPayment || isCheckingPayment}
                >
                  <XStack
                    alignItems="center"
                    justifyContent="center"
                    gap="$2"
                  >
                    {isLoadingPayment ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <CreditCard size={16} />
                    )}
                    <Text>
                      {isLoadingPayment
                        ? "Chargement..."
                        : isCheckingPayment
                          ? "Vérification..."
                          : "Payer la mission"}
                    </Text>
                  </XStack>
                </Button>
              )}

              {paymentError && (
                <YStack padding="$3" backgroundColor="#F8D7DA" borderRadius={8}>
                  <Text fontSize={14} color="#721C24">
                    {paymentError}
                  </Text>
                </YStack>
              )}
            </>
          )}

          {/* Boutons pour les freelances */}
          {!isRecruiter && (
            <>
              {showSuccessMessage ? (
                <XStack
                  paddingVertical="$3"
                  paddingHorizontal="$4"
                  backgroundColor="#D4F4DD"
                  borderRadius={8}
                  alignItems="center"
                  justifyContent="center"
                  gap="$2"
                >
                  <CheckCircle2
                    size={16}
                    color="#00A86B"
                    style={{ flexShrink: 0 }}
                  />
                  <Text fontSize={14} color="#00A86B" fontWeight="600">
                    Candidature envoyée avec succès !
                  </Text>
                </XStack>
              ) : hasApplied ? (
                <XStack
                  paddingVertical="$3"
                  paddingHorizontal="$4"
                  backgroundColor="#FFF3CD"
                  borderRadius={8}
                  alignItems="center"
                  justifyContent="space-between"
                  gap="$2"
                >
                  <CheckCircle2
                    size={16}
                    color="#856404"
                    style={{ flexShrink: 0 }}
                  />
                  <Text fontSize={14} color="#856404" fontWeight="600">
                    Vous avez déjà postulé à cette mission
                  </Text>
                </XStack>
              ) : !canApplyByQuota && applicationsLimit != null ? (
                <YStack gap="$2">
                  <XStack
                    paddingVertical="$3"
                    paddingHorizontal="$4"
                    backgroundColor="#FFF3CD"
                    borderRadius={8}
                    alignItems="center"
                  >
                    <Text fontSize={14} color="#856404" fontWeight="600">
                      Vous avez atteint la limite de {applicationsLimit} candidatures ce mois (compte gratuit). Passez Premium pour postuler sans limite.
                    </Text>
                  </XStack>
                  <Text fontSize={13} color="#666">
                    {applicationsCount} / {applicationsLimit} candidatures ce mois
                  </Text>
                </YStack>
              ) : profile?.role === "freelance" ? (
                <YStack gap="$2">
                  <Button
                    variant="primary"
                    size="md"
                    width="100%"
                    onPress={onApply}
                    disabled={
                      isApplying ||
                      isCheckingApplication ||
                      mission?.status !== "published" ||
                      !canApplyByQuota
                    }
                  >
                    {isApplying ? "Envoi en cours..." : "Postuler à cette mission"}
                  </Button>
                  {applicationsLimit != null && (
                    <Text fontSize={13} color="#666">
                      {applicationsCount} / {applicationsLimit} candidatures ce mois
                    </Text>
                  )}
                </YStack>
              ) : (
                <YStack
                  padding="$3"
                  backgroundColor="#F8F9FA"
                  borderRadius={8}
                  alignItems="center"
                >
                  <Text fontSize={14} color="#666" fontWeight="600">
                    Connectez-vous en tant que freelance pour postuler
                  </Text>
                </YStack>
              )}
            </>
          )}

          {applyError && (
            <YStack padding="$3" backgroundColor="#F8D7DA" borderRadius={8}>
              <Text fontSize={14} color="#721C24">
                {applyError}
              </Text>
            </YStack>
          )}

          <Button
            variant="primary"
            size="md"
            width="100%"
            onPress={() => {
              console.log("Sauvegarder la mission:", mission.id);
            }}
          >
            <XStack
              alignItems="center"
              justifyContent="space-between"
              width="100%"
              paddingHorizontal="$2"
            >
              <Heart size={16} style={{ flexShrink: 0 }} color="white" />
              <Text color="white">Sauvegarder la mission</Text>
            </XStack>
          </Button>

          {/* Badge Shiftly certifie */}
          <XStack
            backgroundColor="#D4F4DD"
            borderRadius={8}
            paddingVertical="$3"
            paddingHorizontal="$4"
            alignItems="center"
            justifyContent="space-between"
            gap="$2"
          >
            <CheckCircle2 size={16} color="#00A86B" style={{ flexShrink: 0 }} />
            <Text fontSize={14} color="#00A86B" fontWeight="600">
              Shiftly certifie cette mission
            </Text>
          </XStack>
        </YStack>
      </YStack>

      {/* Carte Établissement / Localisation */}
      <YStack
        backgroundColor="white"
        borderRadius={12}
        padding="$5"
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.1}
        shadowRadius={8}
      >
        <Text fontSize={18} fontWeight="bold" marginBottom="$4" color="#000">
          {hasEstablishment ? "Établissement" : "Localisation"}
        </Text>

        {/* Header établissement */}
        {isLoadingEstablishment ? (
          <YStack padding="$4" alignItems="center">
            <Text fontSize={14} color="#666">
              Chargement...
            </Text>
          </YStack>
        ) : (
          <MissionAddressDisplay
            establishment={establishment}
            mission={mission}
            displayAddress={displayAddress}
            displayCity={displayCity}
            displayName={displayName}
          />
        )}

        {/* Bouton Contact */}
        <Button
          variant="outline"
          size="md"
          width="100%"
          onPress={async () => {
            if (!profile || !mission) return;

            if (profile.role === "freelance" && mission.recruiter_id) {
              const result = await openConversation(
                {
                  missionId: mission.id,
                  recruiterId: mission.recruiter_id,
                  freelanceId: profile.id,
                },
                (conversationId) => {
                  router.push(`/messagerie?conversationId=${conversationId}`);
                }
              );

              if (!result.success) {
                alert(
                  result.error ||
                    "Erreur lors de l'ouverture de la conversation"
                );
              }
            }
          }}
        >
          {hasEstablishment
            ? "Contacter l'établissement"
            : "Contacter le recruteur"}
        </Button>
      </YStack>
    </YStack>
  );
}
