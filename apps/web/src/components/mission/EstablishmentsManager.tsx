"use client";

import { YStack, XStack, Text, ScrollView } from "tamagui";
import { Button, Input, colors } from "@shiftly/ui";
import { PageSection, EmptyState, PageLoading } from "@/components";
import { useEstablishmentsManager, useResponsive } from "@/hooks";
import {
  Building2,
  Plus,
  MapPin,
  Trash2,
  Edit2,
  Briefcase,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { SecretCodeDisplay } from "./SecretCodeDisplay";

export function EstablishmentsManager() {
  const router = useRouter();
  const { isMobile } = useResponsive();
  const {
    establishments,
    isLoading,
    isCreating,
    isEditing,
    isSubmitting,
    editingId,
    formData,
    setFormData,
    error,
    handleCreate,
    handleEdit,
    handleDelete,
    handleSubmit,
    handleCancel,
  } = useEstablishmentsManager();

  const handleCreateMission = (establishmentId: string) => {
    router.push(`/missions/create?establishment=${establishmentId}`);
  };

  if (isLoading) {
    return <PageLoading />;
  }

  return (
    <PageSection title="Mes établissements">
      <YStack gap="$4">
        {/* Formulaire de création/édition */}
        {(isCreating || isEditing) && (
          <YStack
            padding="$4"
            backgroundColor={colors.white}
            borderRadius="$4"
            borderWidth={1}
            borderColor={colors.gray200}
            gap="$3"
          >
            <Text fontSize={18} fontWeight="600" color={colors.gray900}>
              {isEditing ? "Modifier l'établissement" : "Nouvel établissement"}
            </Text>

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

            <Input
              label="Nom de l'établissement"
              placeholder="Restaurant Le Gourmet"
              value={formData.name}
              onChangeText={(value) =>
                setFormData({ ...formData, name: value })
              }
              required
            />

            <Input
              label="Adresse"
              placeholder="123 Rue de la Paix"
              value={formData.address || ""}
              onChangeText={(value) =>
                setFormData({ ...formData, address: value })
              }
            />

            <XStack
              gap="$3"
              flexDirection={isMobile ? "column" : "row"}
            >
              <YStack flex={isMobile ? undefined : 2} width={isMobile ? "100%" : undefined}>
                <Input
                  label="Ville"
                  placeholder="Paris"
                  value={formData.city || ""}
                  onChangeText={(value) =>
                    setFormData({ ...formData, city: value })
                  }
                />
              </YStack>
              <YStack flex={isMobile ? undefined : 1} width={isMobile ? "100%" : undefined}>
                <Input
                  label="Code postal"
                  placeholder="75001"
                  value={formData.postal_code || ""}
                  onChangeText={(value) =>
                    setFormData({ ...formData, postal_code: value })
                  }
                />
              </YStack>
            </XStack>

            <XStack
              gap="$3"
              marginTop="$2"
              flexDirection={isMobile ? "column" : "row"}
            >
              <YStack flex={1} minWidth={isMobile ? "100%" : 100}>
                <Button
                  variant="outline"
                  size="md"
                  onPress={handleCancel}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
              </YStack>
              <YStack flex={1} minWidth={isMobile ? "100%" : 100}>
                <Button
                  variant="primary"
                  size="md"
                  onPress={handleSubmit}
                  disabled={isSubmitting || !formData.name.trim()}
                >
                  {isSubmitting
                    ? "En cours..."
                    : isEditing
                      ? "Modifier"
                      : "Créer"}
                </Button>
              </YStack>
            </XStack>
          </YStack>
        )}

        {/* Bouton pour créer un nouvel établissement */}
        {!isCreating && !isEditing && (
          <Button
            variant="outline"
            size="md"
            onPress={handleCreate}
            icon={<Plus size={16} />}
            width={isMobile ? "100%" : undefined}
            alignSelf={isMobile ? "stretch" : undefined}
          >
            Créer un établissement
          </Button>
        )}

        {/* Liste des établissements */}
        {establishments.length === 0 && !isCreating ? (
          <EmptyState
            title="Aucun établissement"
            description="Créez votre premier établissement pour pouvoir y associer des missions"
          />
        ) : (
          <XStack
            flexWrap="wrap"
            gap={isMobile ? "$5" : "$4"}
            flexDirection={isMobile ? "column" : "row"}
          >
            {establishments.map((establishment) => (
              <YStack
                key={establishment.id}
                padding={isMobile ? "$5" : "$4"}
                backgroundColor={colors.white}
                borderRadius={isMobile ? 16 : "$4"}
                borderWidth={1}
                borderColor={colors.gray200}
                width={isMobile ? "100%" : "calc(33.333% - 12px)"}
                minWidth={isMobile ? undefined : 280}
                gap={isMobile ? "$4" : "$3"}
                shadowColor={isMobile ? "rgba(0,0,0,0.06)" : undefined}
                shadowOffset={isMobile ? { width: 0, height: 2 } : undefined}
                shadowOpacity={isMobile ? 1 : undefined}
                shadowRadius={isMobile ? 8 : undefined}
                elevation={isMobile ? 2 : undefined}
              >
                <XStack alignItems="center" gap="$3">
                  <YStack
                    width={isMobile ? 44 : 36}
                    height={isMobile ? 44 : 36}
                    borderRadius={12}
                    backgroundColor={colors.shiftlyViolet + "15"}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Building2
                      size={isMobile ? 22 : 20}
                      color={colors.shiftlyViolet}
                    />
                  </YStack>
                  <Text
                    fontSize={isMobile ? 20 : 18}
                    fontWeight="600"
                    color={colors.gray900}
                    flex={1}
                    numberOfLines={2}
                  >
                    {establishment.name}
                  </Text>
                </XStack>

                {establishment.address && (
                  <XStack alignItems="flex-start" gap="$2">
                    <MapPin
                      size={18}
                      color={colors.gray500}
                      style={{ marginTop: 2 }}
                    />
                    <YStack flex={1} minWidth={0}>
                      <Text
                        fontSize={isMobile ? 15 : 14}
                        color={colors.gray700}
                        lineHeight={20}
                      >
                        {establishment.address}
                      </Text>
                      {(establishment.city || establishment.postal_code) && (
                        <Text fontSize={14} color={colors.gray500}>
                          {[establishment.postal_code, establishment.city]
                            .filter(Boolean)
                            .join(" ")}
                        </Text>
                      )}
                    </YStack>
                  </XStack>
                )}

                {establishment.secret_code && (
                  <SecretCodeDisplay
                    code={establishment.secret_code}
                    id={establishment.id}
                  />
                )}

                <XStack
                  gap="$2"
                  marginTop="$2"
                  flexWrap="wrap"
                  flexDirection={isMobile ? "column" : "row"}
                >
                  <Button
                    variant="primary"
                    size={isMobile ? "md" : "sm"}
                    onPress={() => handleCreateMission(establishment.id)}
                    icon={<Briefcase size={14} />}
                    width={isMobile ? "100%" : undefined}
                    flex={isMobile ? undefined : 1}
                    minWidth={isMobile ? undefined : 100}
                  >
                    Créer mission
                  </Button>
                  <XStack
                    gap="$2"
                    flex={1}
                    width={isMobile ? "100%" : undefined}
                    minWidth={isMobile ? undefined : 100}
                  >
                    <Button
                      variant="outline"
                      size={isMobile ? "md" : "sm"}
                      onPress={() => handleEdit(establishment)}
                      icon={<Edit2 size={14} />}
                      flex={1}
                    >
                      Modifier
                    </Button>
                    <Button
                      variant="outline"
                      size={isMobile ? "md" : "sm"}
                      onPress={() => handleDelete(establishment.id)}
                      icon={<Trash2 size={14} />}
                      borderColor="#EF4444"
                      flex={1}
                    >
                      Supprimer
                    </Button>
                  </XStack>
                </XStack>
              </YStack>
            ))}
          </XStack>
        )}
      </YStack>
    </PageSection>
  );
}
