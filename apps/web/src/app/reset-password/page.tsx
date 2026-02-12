"use client";

import { useState, useEffect } from "react";
import { YStack, XStack, Text, Spinner } from "tamagui";
import { Button, Input, colors } from "@shiftly/ui";
import { useRouter } from "next/navigation";
import { supabase } from "@shiftly/data";

const MIN_PASSWORD_LENGTH = 6;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setHasValidSession(!!session?.user);

        // If no session but we have hash (recovery flow), Supabase might still process it
        if (!session && typeof window !== "undefined" && window.location.hash) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const {
            data: { session: retrySession },
          } = await supabase.auth.getSession();
          setHasValidSession(!!retrySession?.user);
        }
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async () => {
    setError("");

    if (!newPassword || !confirmPassword) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères`);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setIsLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        if (
          updateError.message?.includes("session") ||
          updateError.message?.includes("expired") ||
          updateError.message?.includes("invalid")
        ) {
          setHasValidSession(false);
          setError("");
        } else {
          setError(
            updateError.message ||
              "Une erreur est survenue. Veuillez réessayer."
          );
        }
        return;
      }

      setSuccess(true);
    } catch {
      setError("Une erreur inattendue est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <YStack
        flex={1}
        backgroundColor="#F9FAFB"
        alignItems="center"
        justifyContent="center"
        padding="$4"
        minHeight="100vh"
        gap="$4"
      >
        <Spinner size="large" color={colors.shiftlyViolet} />
        <Text fontSize={16} fontWeight="600" color="#2B2B2B">
          Chargement...
        </Text>
      </YStack>
    );
  }

  if (!hasValidSession) {
    return (
      <YStack
        flex={1}
        backgroundColor="#F9FAFB"
        alignItems="center"
        justifyContent="center"
        padding="$4"
        minHeight="100vh"
      >
        <YStack
          maxWidth={440}
          padding="$6"
          style={{ width: "100%" }}
          backgroundColor="white"
          borderRadius="$4"
          borderWidth={1}
          borderColor="#E5E5E5"
          shadowColor="rgba(0, 0, 0, 0.1)"
          shadowOffset={{ width: 0, height: 4 }}
          shadowOpacity={1}
          shadowRadius={12}
          elevation={4}
          gap="$5"
          alignItems="center"
        >
          <YStack
            width={48}
            height={48}
            borderRadius={24}
            backgroundColor="#FEE2E2"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize={24}>⚠️</Text>
          </YStack>
          <YStack gap="$2" alignItems="center">
            <Text
              fontSize={20}
              fontWeight="700"
              color="#2B2B2B"
              textAlign="center"
            >
              Lien invalide ou expiré
            </Text>
            <Text
              fontSize={14}
              color="#6B7280"
              textAlign="center"
              lineHeight={20}
            >
              Ce lien de réinitialisation n'est plus valable. Merci de refaire une
              demande de réinitialisation.
            </Text>
          </YStack>
          <Button
            variant="primary"
            size="lg"
            onPress={() => router.push("/forgot-password")}
          >
            Réinitialiser mon mot de passe
          </Button>
          <XStack gap="$1" marginTop="$2">
            <Text fontSize={14} color="#6B7280">
              Vous vous souvenez de votre mot de passe ?
            </Text>
            <Text
              fontSize={14}
              color={colors.shiftlyViolet}
              fontWeight="600"
              cursor="pointer"
              hoverStyle={{ textDecorationLine: "underline" }}
              onPress={() => router.push("/login")}
            >
              Retour à la connexion
            </Text>
          </XStack>
        </YStack>
      </YStack>
    );
  }

  if (success) {
    return (
      <YStack
        flex={1}
        backgroundColor="#F9FAFB"
        alignItems="center"
        justifyContent="center"
        padding="$4"
        minHeight="100vh"
      >
        <YStack
          maxWidth={440}
          padding="$6"
          style={{ width: "100%" }}
          backgroundColor="white"
          borderRadius="$4"
          borderWidth={1}
          borderColor="#E5E5E5"
          shadowColor="rgba(0, 0, 0, 0.1)"
          shadowOffset={{ width: 0, height: 4 }}
          shadowOpacity={1}
          shadowRadius={12}
          elevation={4}
          gap="$5"
          alignItems="center"
        >
          <YStack
            width={48}
            height={48}
            borderRadius={24}
            backgroundColor="#ECFDF5"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize={24}>✓</Text>
          </YStack>
          <YStack gap="$2" alignItems="center">
            <Text
              fontSize={20}
              fontWeight="700"
              color="#2B2B2B"
              textAlign="center"
            >
              Mot de passe réinitialisé
            </Text>
            <Text
              fontSize={14}
              color="#6B7280"
              textAlign="center"
              lineHeight={20}
            >
              Votre mot de passe a été mis à jour avec succès. Vous pouvez
              maintenant vous connecter avec votre nouveau mot de passe.
            </Text>
          </YStack>
          <Button
            variant="primary"
            size="lg"
            onPress={() => router.push("/login")}
          >
            Retour à la connexion
          </Button>
        </YStack>
      </YStack>
    );
  }

  return (
    <YStack
      flex={1}
      backgroundColor="#F9FAFB"
      alignItems="center"
      justifyContent="center"
      padding="$4"
      minHeight="100vh"
      position="relative"
    >
      {isLoading && (
        <YStack
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          backgroundColor="rgba(249, 250, 251, 0.95)"
          alignItems="center"
          justifyContent="center"
          zIndex={1000}
          gap="$4"
        >
          <Spinner size="large" color={colors.shiftlyViolet} />
          <Text fontSize={16} fontWeight="600" color="#2B2B2B">
            Mise à jour en cours...
          </Text>
        </YStack>
      )}

      <YStack
        maxWidth={440}
        padding="$6"
        style={{ width: "100%" }}
        backgroundColor="white"
        borderRadius="$4"
        borderWidth={1}
        borderColor="#E5E5E5"
        shadowColor="rgba(0, 0, 0, 0.1)"
        shadowOffset={{ width: 0, height: 4 }}
        shadowOpacity={1}
        shadowRadius={12}
        elevation={4}
        opacity={isLoading ? 0.5 : 1}
      >
        <YStack gap="$5" alignItems="center">
          <YStack
            width={48}
            height={48}
            borderRadius={24}
            backgroundColor={colors.shiftlyVioletLight}
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize={24}>🔑</Text>
          </YStack>

          <YStack gap="$2" alignItems="center">
            <Text
              fontSize={24}
              fontWeight="700"
              color="#2B2B2B"
              textAlign="center"
            >
              Nouveau mot de passe
            </Text>
            <Text
              fontSize={14}
              color="#6B7280"
              textAlign="center"
              lineHeight={20}
            >
              Choisissez un mot de passe sécurisé pour votre compte.
            </Text>
          </YStack>

          <YStack gap="$4" style={{ width: "100%" }}>
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

            <Input
              label="Nouveau mot de passe"
              placeholder="Minimum 6 caractères"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              autoComplete="new-password"
            />

            <Input
              label="Confirmer le mot de passe"
              placeholder="Répétez votre mot de passe"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoComplete="new-password"
            />

            <Button
              variant="primary"
              size="lg"
              onPress={handleSubmit}
              marginTop="$2"
              disabled={isLoading}
              opacity={isLoading ? 0.6 : 1}
            >
              Réinitialiser le mot de passe
            </Button>
          </YStack>

          <XStack gap="$1" marginTop="$2">
            <Text fontSize={14} color="#6B7280">
              Retour à la
            </Text>
            <Text
              fontSize={14}
              color={colors.shiftlyViolet}
              fontWeight="600"
              cursor="pointer"
              hoverStyle={{ textDecorationLine: "underline" }}
              onPress={() => router.push("/login")}
            >
              connexion
            </Text>
          </XStack>
        </YStack>
      </YStack>
    </YStack>
  );
}
