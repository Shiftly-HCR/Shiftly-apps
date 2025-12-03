"use client";

import { YStack, XStack, Text } from "tamagui";
import { Button, Input, colors } from "@shiftly/ui";
import { useEstablishmentCode } from "@/hooks";
import { Building2, MapPin, X } from "lucide-react";
import { useState, useEffect } from "react";

interface EstablishmentCodeInputProps {
  onAttachmentSuccess?: () => void;
}

/**
 * Composant sidebar pour saisir un code établissement et le rattacher
 */
export function EstablishmentCodeInput({
  onAttachmentSuccess,
}: EstablishmentCodeInputProps = {}) {
  const {
    code,
    setCode,
    foundEstablishment,
    isLoading,
    error,
    searchEstablishment,
    confirmAttachment,
    reset,
  } = useEstablishmentCode();
  const [showModal, setShowModal] = useState(false);
  const [isAttaching, setIsAttaching] = useState(false);

  // Ouvrir le modal quand un établissement est trouvé
  useEffect(() => {
    if (foundEstablishment) {
      setShowModal(true);
    }
  }, [foundEstablishment]);

  const handleSearch = async () => {
    await searchEstablishment();
  };

  const handleConfirm = async () => {
    setIsAttaching(true);
    const success = await confirmAttachment();
    setIsAttaching(false);
    if (success) {
      setShowModal(false);
      // Appeler le callback pour rafraîchir les listes
      onAttachmentSuccess?.();
      // Rafraîchir la page pour mettre à jour les listes
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    reset();
  };

  return (
    <>
      <YStack
        backgroundColor="white"
        borderRadius="$4"
        padding="$6"
        borderWidth={1}
        borderColor={colors.gray200}
        gap="$4"
      >
        <Text fontSize={20} fontWeight="600" color={colors.gray900}>
          Entrer un code établissement
        </Text>
        <Text fontSize={14} color={colors.gray500}>
          Saisissez le code secret d'un établissement pour vous y rattacher
        </Text>

        <YStack gap="$3">
          <Input
            label="Code secret"
            placeholder="Ex: 7ARHCJH9"
            value={code}
            onChangeText={(value) => setCode(value.toUpperCase())}
            onSubmitEditing={handleSearch}
            autoCapitalize="characters"
            maxLength={10}
          />

          {error && (
            <YStack
              padding="$2"
              backgroundColor="#FEE2E2"
              borderRadius="$2"
              borderWidth={1}
              borderColor="#EF4444"
            >
              <Text fontSize={14} color="#DC2626">
                {error}
              </Text>
            </YStack>
          )}

          <Button
            variant="primary"
            size="md"
            onPress={handleSearch}
            disabled={isLoading || !code.trim()}
          >
            {isLoading ? "Recherche..." : "Rechercher"}
          </Button>
        </YStack>
      </YStack>

      {/* Modal de confirmation */}
      {showModal && foundEstablishment && (
        <YStack
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          backgroundColor="rgba(0, 0, 0, 0.5)"
          alignItems="center"
          justifyContent="center"
          zIndex={1000}
          onPress={handleCloseModal}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <YStack
            backgroundColor="white"
            borderRadius="$4"
            padding="$6"
            width="90%"
            maxWidth={500}
            gap="$4"
            onPress={(e: any) => {
              if (e?.stopPropagation) {
                e.stopPropagation();
              }
            }}
          >
            <XStack alignItems="center" justifyContent="space-between" marginBottom="$2">
              <Text fontSize={20} fontWeight="600" color={colors.gray900}>
                Confirmer le rattachement
              </Text>
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={handleCloseModal}
                  padding="$1"
                >
                  <X size={20} color={colors.gray500} />
                </Button>
            </XStack>

            <Text fontSize={14} color={colors.gray500} marginBottom="$2">
              Vous êtes sur le point de vous rattacher à cet établissement :
            </Text>

            {/* Informations de l'établissement */}
            <YStack
              padding="$4"
              backgroundColor={colors.backgroundLight}
              borderRadius="$2"
              gap="$3"
            >
              <XStack alignItems="center" gap="$3">
                <YStack
                  width={48}
                  height={48}
                  borderRadius={24}
                  backgroundColor={colors.gray100}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Building2 size={24} color={colors.shiftlyViolet} />
                </YStack>
                <YStack flex={1}>
                  <Text fontSize={16} fontWeight="600" color={colors.gray900}>
                    {foundEstablishment.name}
                  </Text>
                  {(foundEstablishment.address || foundEstablishment.city) && (
                    <XStack alignItems="center" gap="$2" marginTop="$1">
                      <MapPin size={14} color={colors.gray500} />
                      <Text fontSize={12} color={colors.gray500}>
                        {[
                          foundEstablishment.address,
                          [
                            foundEstablishment.postal_code,
                            foundEstablishment.city,
                          ]
                            .filter(Boolean)
                            .join(" "),
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </Text>
                    </XStack>
                  )}
                </YStack>
              </XStack>
            </YStack>

            <XStack gap="$3" marginTop="$2">
              <YStack flex={1}>
                  <Button
                    variant="outline"
                    size="md"
                    onPress={handleCloseModal}
                    disabled={isAttaching}
                  >
                    Annuler
                  </Button>
              </YStack>
              <YStack flex={1}>
                <Button
                  variant="primary"
                  size="md"
                  onPress={handleConfirm}
                  disabled={isAttaching}
                >
                  {isAttaching ? "Rattachement..." : "Confirmer"}
                </Button>
              </YStack>
            </XStack>
          </YStack>
        </YStack>
      )}
    </>
  );
}

