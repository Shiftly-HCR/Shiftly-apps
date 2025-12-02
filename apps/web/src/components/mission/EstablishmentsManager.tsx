"use client";

import { YStack, XStack, Text, ScrollView } from "tamagui";
import { Button, Input, colors } from "@shiftly/ui";
import { PageSection, EmptyState, PageLoading } from "@/components";
import { useEstablishmentsManager } from "@/hooks";
import {
  Building2,
  Plus,
  MapPin,
  Trash2,
  Edit2,
  Briefcase,
} from "lucide-react";
import { useRouter } from "next/navigation";

export function EstablishmentsManager() {
  const router = useRouter();
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

            <XStack gap="$3">
              <YStack flex={2}>
                <Input
                  label="Ville"
                  placeholder="Paris"
                  value={formData.city || ""}
                  onChangeText={(value) =>
                    setFormData({ ...formData, city: value })
                  }
                />
              </YStack>
              <YStack flex={1}>
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

            <XStack gap="$3" marginTop="$2">
              <YStack flex={1}>
                <Button
                  variant="outline"
                  size="md"
                  onPress={handleCancel}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
              </YStack>
              <YStack flex={1}>
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
          <XStack flexWrap="wrap" gap="$4">
            {establishments.map((establishment) => (
              <YStack
                key={establishment.id}
                padding="$4"
                backgroundColor={colors.white}
                borderRadius="$4"
                borderWidth={1}
                borderColor={colors.gray200}
                width="calc(33.333% - 12px)"
                minWidth={280}
                gap="$3"
              >
                <XStack alignItems="center" gap="$2">
                  <Building2 size={20} color={colors.shiftlyViolet} />
                  <Text
                    fontSize={18}
                    fontWeight="600"
                    color={colors.gray900}
                    flex={1}
                  >
                    {establishment.name}
                  </Text>
                </XStack>

                {establishment.address && (
                  <XStack alignItems="flex-start" gap="$2">
                    <MapPin size={16} color={colors.gray500} />
                    <YStack flex={1}>
                      <Text fontSize={14} color={colors.gray700}>
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
                  <YStack
                    padding="$2"
                    backgroundColor={colors.backgroundLight}
                    borderRadius="$2"
                    gap="$1"
                  >
                    <Text fontSize={12} color={colors.gray500} fontWeight="600">
                      Code secret
                    </Text>
                    <Text
                      fontSize={16}
                      fontWeight="700"
                      color={colors.shiftlyViolet}
                    >
                      {establishment.secret_code}
                    </Text>
                  </YStack>
                )}

                <XStack gap="$2" marginTop="$2" flexWrap="wrap">
                  <YStack flex={1} minWidth={100}>
                    <Button
                      variant="primary"
                      size="sm"
                      onPress={() => handleCreateMission(establishment.id)}
                      icon={<Briefcase size={14} />}
                    >
                      Créer mission
                    </Button>
                  </YStack>
                  <YStack flex={1} minWidth={100}>
                    <Button
                      variant="outline"
                      size="sm"
                      onPress={() => handleEdit(establishment)}
                      icon={<Edit2 size={14} />}
                    >
                      Modifier
                    </Button>
                  </YStack>
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => handleDelete(establishment.id)}
                    icon={<Trash2 size={14} />}
                    borderColor="#EF4444"
                  >
                    Supprimer
                  </Button>
                </XStack>
              </YStack>
            ))}
          </XStack>
        )}
      </YStack>
    </PageSection>
  );
}
