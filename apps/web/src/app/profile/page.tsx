"use client";

import { YStack, XStack, Text, Image } from "tamagui";
import { Button, Input, ImagePicker } from "@shiftly/ui";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  updateProfile,
  uploadProfilePhoto,
  deleteProfilePhoto,
} from "@shiftly/data";
import { useCurrentProfile } from "../../hooks";
import { AppLayout } from "../../components/AppLayout";
import { FreelanceProfileForm } from "../../components/FreelanceProfileForm";

export default function ProfilePage() {
  const router = useRouter();
  const { profile, isLoading, refresh } = useCurrentProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Champs du formulaire
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Initialiser les champs du formulaire avec le profil
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setEmail(profile.email || "");
      setPhone(profile.phone || "");
      setBio(profile.bio || "");
      setPhotoUrl(profile.photo_url || null);
    }
  }, [profile]);

  const handleSave = async () => {
    setError("");
    setSuccess("");
    setIsSaving(true);

    // Mettre à jour les informations du profil
    const result = await updateProfile({
      firstName,
      lastName,
      email,
      phone,
      bio,
    });

    if (result.success) {
      // Rafraîchir le cache
      await refresh();
      setSuccess("Profil mis à jour avec succès !");
      setIsEditing(false);
    } else {
      setError(result.error || "Une erreur est survenue");
    }

    setIsSaving(false);
  };

  const handlePhotoChange = async (file: File) => {
    setError("");
    setSuccess("");
    setIsUploadingPhoto(true);

    const uploadResult = await uploadProfilePhoto(file);
    setIsUploadingPhoto(false);

    if (uploadResult.success) {
      setPhotoUrl(uploadResult.url || null);
      setSuccess("Photo mise à jour avec succès !");

      // Rafraîchir le cache
      await refresh();
    } else {
      setError(uploadResult.error || "Erreur lors de l'upload de la photo");
    }
  };

  const handlePhotoRemove = async () => {
    if (!photoUrl) {
      return;
    }

    setIsUploadingPhoto(true);
    const result = await deleteProfilePhoto();
    setIsUploadingPhoto(false);

    if (result.success) {
      setPhotoUrl(null);
      setSuccess("Photo supprimée avec succès !");

      // Rafraîchir le cache
      await refresh();
    } else {
      setError(result.error || "Erreur lors de la suppression de la photo");
    }
  };

  const handleCancel = () => {
    // Réinitialiser les champs avec les valeurs actuelles
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setEmail(profile.email || "");
      setPhone(profile.phone || "");
      setBio(profile.bio || "");
    }
    setIsEditing(false);
    setError("");
  };

  if (isLoading) {
    return (
      <AppLayout>
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          padding="$4"
          paddingVertical="$8"
        >
          <Text fontSize={16} color="#6B7280">
            Chargement...
          </Text>
        </YStack>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <YStack flex={1} alignItems="center" padding="$4" paddingVertical="$8">
        <YStack maxWidth={800} width="100%" gap="$4">
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
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize={18} fontWeight="600" color="#2B2B2B">
                Informations personnelles
              </Text>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => setIsEditing(true)}
                >
                  Modifier
                </Button>
              )}
            </XStack>

            {/* Nom et Prénom */}
            <XStack gap="$3" width="100%">
              <YStack flex={1}>
                <Input
                  label="Prénom"
                  placeholder="Votre prénom"
                  value={firstName}
                  onChangeText={setFirstName}
                  disabled={!isEditing}
                />
              </YStack>
              <YStack flex={1}>
                <Input
                  label="Nom"
                  placeholder="Votre nom"
                  value={lastName}
                  onChangeText={setLastName}
                  disabled={!isEditing}
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
              disabled={!isEditing}
            />

            {/* Téléphone */}
            <Input
              label="Téléphone"
              placeholder="0612345678"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              disabled={!isEditing}
            />

            {/* Bio */}
            <YStack gap="$2">
              <Text fontSize={14} fontWeight="600" color="#2B2B2B">
                Biographie
              </Text>
              <YStack
                padding="$3"
                backgroundColor={isEditing ? "white" : "#F9FAFB"}
                borderRadius="$3"
                borderWidth={1}
                borderColor={isEditing ? "#D1D5DB" : "#E5E5E5"}
                minHeight={120}
              >
                <Input
                  placeholder="Parlez-nous de vous..."
                  value={bio}
                  onChangeText={setBio}
                  disabled={!isEditing}
                  multiline
                  numberOfLines={4}
                />
              </YStack>
            </YStack>

            {/* Boutons d'action */}
            {isEditing && (
              <XStack gap="$3" marginTop="$2">
                <YStack flex={1}>
                  <Button
                    variant="outline"
                    size="lg"
                    onPress={handleCancel}
                    disabled={isSaving}
                  >
                    Annuler
                  </Button>
                </YStack>
                <YStack flex={1}>
                  <Button
                    variant="primary"
                    size="lg"
                    onPress={handleSave}
                    disabled={isSaving}
                    opacity={isSaving ? 0.6 : 1}
                  >
                    {isSaving ? "Enregistrement..." : "Enregistrer"}
                  </Button>
                </YStack>
              </XStack>
            )}
          </YStack>

          {/* Section Freelance - Affichage conditionnel */}
          {profile?.role === "freelance" ? (
            <FreelanceProfileForm
              onSave={async () => {
                // Rafraîchir le cache après sauvegarde
                await refresh();
              }}
            />
          ) : (
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
              alignItems="center"
            >
              <Text fontSize={16} color="#6B7280" textAlign="center">
                Cette section est réservée aux freelances.
              </Text>
            </YStack>
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
