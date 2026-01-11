"use client";

import { YStack, XStack, Text, Image } from "tamagui";
import { Button, Input, ImagePicker, colors } from "@shiftly/ui";
import { useRouter } from "next/navigation";
import { AppLayout, FreelanceProfileForm, PageLoading } from "@/components";
import { useProfilePage } from "@/hooks";
import {
  FiCreditCard,
  FiChevronRight,
  FiCheck,
  FiAlertTriangle,
} from "react-icons/fi";

export default function ProfilePage() {
  const router = useRouter();
  const {
    profile,
    isLoading,
    refresh,
    isEditing,
    setIsEditing,
    isSaving,
    error,
    success,
    // Champs du formulaire
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    phone,
    setPhone,
    bio,
    setBio,
    photoUrl,
    isUploadingPhoto,
    // Handlers
    handleSave,
    handlePhotoChange,
    handlePhotoRemove,
    handleCancel,
  } = useProfilePage();

  if (isLoading) {
    return <PageLoading />;
  }

  return (
    <AppLayout>
      <YStack flex={1} alignItems="center" padding="$4" paddingVertical="$8">
        <YStack maxWidth={800} gap="$4" style={{ width: "100%" }}>
          {/* En-tête */}
          <YStack
            padding="$6"
            backgroundColor="white"
            borderRadius="$4"
            borderWidth={1}
            borderColor="#E5E5E5"
            shadowColor="rgba(0, 0, 0, 0.1)"
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={1}
            shadowRadius={12}
          >
            <XStack justifyContent="space-between" alignItems="center">
              <YStack gap="$2">
                <Text fontSize={24} fontWeight="700" color="#2B2B2B">
                  Mon Profil
                </Text>
                <Text fontSize={14} color="#6B7280">
                  {firstName && lastName
                    ? `${firstName} ${lastName}`
                    : email || "Utilisateur"}
                </Text>
              </YStack>
              {photoUrl ? (
                <YStack
                  width={64}
                  height={64}
                  borderRadius={32}
                  overflow="hidden"
                  borderWidth={2}
                  borderColor={colors.shiftlyViolet}
                >
                  <Image
                    source={{ uri: photoUrl }}
                    width={64}
                    height={64}
                    style={{
                      width: 64,
                      height: 64,
                      objectFit: "cover",
                    }}
                  />
                </YStack>
              ) : (
                <YStack
                  width={64}
                  height={64}
                  borderRadius={32}
                  backgroundColor={colors.shiftlyViolet}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize={28} color="white" fontWeight="600">
                    {firstName.charAt(0).toUpperCase() || "?"}
                    {lastName.charAt(0).toUpperCase() || ""}
                  </Text>
                </YStack>
              )}
            </XStack>
          </YStack>

          {/* Messages */}
          {error && (
            <YStack
              padding="$3"
              backgroundColor="#FEE2E2"
              borderRadius="$3"
              borderWidth={1}
              borderColor="#EF4444"
            >
              <Text fontSize={14} color="#DC2626" fontWeight="500">
                {error}
              </Text>
            </YStack>
          )}

          {success && (
            <YStack
              padding="$3"
              backgroundColor="#D1FAE5"
              borderRadius="$3"
              borderWidth={1}
              borderColor="#10B981"
            >
              <Text fontSize={14} color="#059669" fontWeight="500">
                {success}
              </Text>
            </YStack>
          )}

          {/* Photo de profil */}
          <YStack
            padding="$6"
            backgroundColor="white"
            borderRadius="$4"
            borderWidth={1}
            borderColor="#E5E5E5"
            shadowColor="rgba(0, 0, 0, 0.1)"
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={1}
            shadowRadius={12}
            gap="$4"
          >
            <Text fontSize={18} fontWeight="600" color="#2B2B2B">
              Photo de profil
            </Text>
            <ImagePicker
              value={photoUrl}
              onChange={handlePhotoChange}
              onRemove={handlePhotoRemove}
              disabled={isUploadingPhoto}
              shape="circle"
              size={150}
              placeholder="Cliquez pour ajouter une photo"
            />
            {isUploadingPhoto && (
              <Text fontSize={14} color={colors.shiftlyViolet} fontWeight="500">
                Upload en cours...
              </Text>
            )}
          </YStack>

          {/* Informations du profil */}
          <YStack
            padding="$6"
            backgroundColor="white"
            borderRadius="$4"
            borderWidth={1}
            borderColor="#E5E5E5"
            shadowColor="rgba(0, 0, 0, 0.1)"
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={1}
            shadowRadius={12}
            gap="$4"
          >
            <Text fontSize={18} fontWeight="600" color="#2B2B2B">
              Informations personnelles
            </Text>

            {/* Nom et Prénom */}
            <XStack gap="$3" style={{ width: "100%" }}>
              <YStack flex={1}>
                <Input
                  label="Prénom"
                  placeholder="Votre prénom"
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </YStack>
              <YStack flex={1}>
                <Input
                  label="Nom"
                  placeholder="Votre nom"
                  value={lastName}
                  onChangeText={setLastName}
                />
              </YStack>
            </XStack>

            {/* Email */}
            <Input
              label="Adresse e-mail"
              placeholder="exemple@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoComplete="email"
            />

            {/* Téléphone */}
            <Input
              label="Téléphone"
              placeholder="0612345678"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            {/* Bio */}
            <YStack gap="$2">
              <Text fontSize={14} fontWeight="600" color="#2B2B2B">
                Biographie
              </Text>
              <Input
                placeholder={
                  bio && bio.trim() ? undefined : "Parlez-nous de vous..."
                }
                value={bio || ""}
                onChangeText={setBio}
                multiline
                numberOfLines={4}
              />
            </YStack>
          </YStack>

          {/* Section Freelance - Affichage conditionnel */}
          {profile?.role === "freelance" && (
            <FreelanceProfileForm
              firstName={firstName}
              lastName={lastName}
              email={email}
              phone={phone}
              bio={bio}
              onSave={async () => {
                await refresh();
              }}
            />
          )}

          {/* Informations supplémentaires */}
          <YStack
            padding="$6"
            backgroundColor="white"
            borderRadius="$4"
            borderWidth={1}
            borderColor="#E5E5E5"
            shadowColor="rgba(0, 0, 0, 0.1)"
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={1}
            shadowRadius={12}
            gap="$3"
          >
            <Text fontSize={18} fontWeight="600" color="#2B2B2B">
              Détails du compte
            </Text>

            <XStack justifyContent="space-between">
              <Text fontSize={14} color="#6B7280">
                Rôle
              </Text>
              <Text fontSize={14} fontWeight="500" color="#2B2B2B">
                {profile?.role || "Non défini"}
              </Text>
            </XStack>

            <XStack justifyContent="space-between">
              <Text fontSize={14} color="#6B7280">
                Date d'inscription
              </Text>
              <Text fontSize={14} fontWeight="500" color="#2B2B2B">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString("fr-FR")
                  : "N/A"}
              </Text>
            </XStack>

            <XStack justifyContent="space-between">
              <Text fontSize={14} color="#6B7280">
                Dernière modification
              </Text>
              <Text fontSize={14} fontWeight="500" color="#2B2B2B">
                {profile?.updated_at
                  ? new Date(profile.updated_at).toLocaleDateString("fr-FR")
                  : "N/A"}
              </Text>
            </XStack>
          </YStack>

          {/* Section Paramètres de paiement - Visible uniquement pour freelances et commerciaux */}
          {(profile?.role === "freelance" ||
            profile?.role === "commercial") && (
            <YStack
              padding="$6"
              backgroundColor="white"
              borderRadius="$4"
              borderWidth={1}
              borderColor="#E5E5E5"
              shadowColor="rgba(0, 0, 0, 0.1)"
              shadowOffset={{ width: 0, height: 4 }}
              shadowOpacity={1}
              shadowRadius={12}
              gap="$4"
            >
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize={18} fontWeight="600" color="#2B2B2B">
                  Paramètres de paiement
                </Text>
                {profile?.connect_onboarding_status === "complete" &&
                profile?.connect_payouts_enabled ? (
                  <XStack
                    backgroundColor={colors.shiftlyViolet + "20"}
                    paddingHorizontal="$2"
                    paddingVertical="$1"
                    borderRadius="$2"
                    alignItems="center"
                    gap="$1"
                  >
                    <FiCheck size={14} color={colors.shiftlyViolet} />
                    <Text
                      fontSize={12}
                      fontWeight="600"
                      color={colors.shiftlyViolet}
                    >
                      Activé
                    </Text>
                  </XStack>
                ) : profile?.connect_onboarding_status === "pending" ? (
                  <XStack
                    backgroundColor="#FEF3C7"
                    paddingHorizontal="$2"
                    paddingVertical="$1"
                    borderRadius="$2"
                    alignItems="center"
                    gap="$1"
                  >
                    <FiAlertTriangle size={14} color="#D97706" />
                    <Text fontSize={12} fontWeight="600" color="#D97706">
                      En attente
                    </Text>
                  </XStack>
                ) : null}
              </XStack>

              <Text fontSize={14} color="#6B7280">
                {profile?.role === "freelance"
                  ? "Configurez votre compte pour recevoir vos paiements de missions."
                  : "Configurez votre compte pour recevoir vos commissions."}
              </Text>

              <XStack
                backgroundColor={colors.gray100}
                padding="$4"
                borderRadius="$3"
                alignItems="center"
                justifyContent="space-between"
                pressStyle={{ opacity: 0.8 }}
                cursor="pointer"
                onPress={() => router.push("/settings/payments")}
              >
                <XStack alignItems="center" gap="$3">
                  <XStack
                    width={40}
                    height={40}
                    borderRadius={20}
                    backgroundColor={colors.shiftlyViolet + "20"}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <FiCreditCard size={20} color={colors.shiftlyViolet} />
                  </XStack>
                  <YStack>
                    <Text fontSize={15} fontWeight="600" color="#2B2B2B">
                      Gérer mes paiements
                    </Text>
                    <Text fontSize={13} color="#6B7280">
                      {profile?.connect_onboarding_status === "complete" &&
                      profile?.connect_payouts_enabled
                        ? "Voir et modifier mes informations de paiement"
                        : "Activer mes paiements via Stripe"}
                    </Text>
                  </YStack>
                </XStack>
                <FiChevronRight size={20} color="#6B7280" />
              </XStack>
            </YStack>
          )}

          {/* Bouton retour */}
          <Button
            variant="outline"
            size="lg"
            onPress={() => router.push("/home")}
          >
            Retour à l'accueil
          </Button>
        </YStack>
      </YStack>
    </AppLayout>
  );
}
