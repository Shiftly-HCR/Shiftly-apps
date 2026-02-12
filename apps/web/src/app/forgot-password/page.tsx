"use client";

import { useState } from "react";
import { YStack, XStack, Text, Spinner } from "tamagui";
import { Button, Input, colors } from "@shiftly/ui";
import { useRouter } from "next/navigation";
import { supabase } from "@shiftly/data";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setSuccess(false);

    if (!email || !email.trim()) {
      setError("Veuillez entrer votre adresse e-mail");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Veuillez entrer une adresse e-mail valide");
      return;
    }

    setIsLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo: `${APP_URL}/reset-password` }
      );

      if (resetError) {
        setError(
          resetError.message ||
            "Une erreur est survenue lors de l'envoi du lien. Veuillez réessayer."
        );
        return;
      }

      setSuccess(true);
    } catch {
      setError("Une erreur inattendue est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

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
            Envoi en cours...
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
            <Text fontSize={24}>🔐</Text>
          </YStack>

          <YStack gap="$2" alignItems="center">
            <Text
              fontSize={24}
              fontWeight="700"
              color="#2B2B2B"
              textAlign="center"
            >
              Mot de passe oublié ?
            </Text>
            <Text
              fontSize={14}
              color="#6B7280"
              textAlign="center"
              lineHeight={20}
            >
              Entrez votre e-mail et nous vous enverrons un lien pour réinitialiser
              votre mot de passe.
            </Text>
          </YStack>

          {success ? (
            <YStack gap="$4" style={{ width: "100%" }} alignItems="center">
              <YStack
                padding="$3"
                backgroundColor="#ECFDF5"
                borderRadius="$3"
                borderWidth={1}
                borderColor="#10B981"
              >
                <Text fontSize={14} color="#059669" fontWeight="500">
                  Vérifiez votre boîte mail. Si un compte existe avec cette
                  adresse, vous recevrez un lien pour réinitialiser votre mot de
                  passe.
                </Text>
              </YStack>
              <Button
                variant="outline"
                size="lg"
                onPress={() => router.push("/login")}
              >
                Retour à la connexion
              </Button>
            </YStack>
          ) : (
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
                label="Adresse e-mail"
                placeholder="exemple@email.com"
                value={email}
                onChangeText={setEmail}
                autoComplete="email"
                keyboardType="email-address"
              />

              <Button
                variant="primary"
                size="lg"
                onPress={handleSubmit}
                marginTop="$2"
                disabled={isLoading}
                opacity={isLoading ? 0.6 : 1}
              >
                Envoyer le lien
              </Button>
            </YStack>
          )}

          {!success && (
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
          )}
        </YStack>
      </YStack>
    </YStack>
  );
}
