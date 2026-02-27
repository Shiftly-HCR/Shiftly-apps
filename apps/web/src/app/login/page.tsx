"use client";

import { YStack, XStack, Text, Image, Spinner } from "tamagui";
import { Button, Input, colors } from "@shiftly/ui";
import { useRouter } from "next/navigation";
import { useLoginPage } from "@/hooks";

export default function LoginPage() {
  const router = useRouter();
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    isLoading,
    handleLogin,
  } = useLoginPage();

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
      {/* Overlay de chargement */}
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
            Connexion en cours...
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
          {/* Logo */}
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

          {/* Titre et sous-titre */}
          <YStack gap="$2" alignItems="center">
            <Text
              fontSize={24}
              fontWeight="700"
              color="#2B2B2B"
              textAlign="center"
            >
              Connexion
            </Text>
            <Text
              fontSize={14}
              color="#6B7280"
              textAlign="center"
              lineHeight={20}
            >
              Accédez à votre espace personnel
            </Text>
          </YStack>

          {/* Formulaire */}
          <YStack gap="$4" style={{ width: "100%" }}>
            {/* Message d'erreur */}
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

            {/* Email */}
            <Input
              label="Adresse e-mail"
              placeholder="exemple@email.com"
              value={email}
              onChangeText={setEmail}
              autoComplete="email"
              keyboardType="email-address"
            />

            {/* Mot de passe */}
            <YStack gap="$2" flex={1}>
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize={14} fontWeight="600" color="#2B2B2B">
                  Mot de passe
                </Text>
                <Text
                  fontSize={14}
                  color={colors.shiftlyViolet}
                  fontWeight="600"
                  cursor="pointer"
                  hoverStyle={{ textDecorationLine: "underline" }}
                  onPress={() => router.push("/forgot-password")}
                >
                  Mot de passe oublié ?
                </Text>
              </XStack>
              <Input
                placeholder="Entrez votre mot de passe"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="current-password"
              />
            </YStack>

            {/* Bouton de connexion */}
            <Button
              variant="primary"
              size="lg"
              onPress={handleLogin}
              marginTop="$2"
              disabled={isLoading}
              opacity={isLoading ? 0.6 : 1}
            >
              {isLoading ? "Connexion..." : "Se connecter"}
            </Button>
          </YStack>

          {/* Lien d'inscription - masqué temporairement (inscriptions fermées) */}
          {/* <XStack gap="$1" marginTop="$2">
            <Text fontSize={14} color="#6B7280">
              Vous n'avez pas de compte ?
            </Text>
            <Text
              fontSize={14}
              color={colors.shiftlyViolet}
              fontWeight="600"
              cursor="pointer"
              hoverStyle={{ textDecorationLine: "underline" }}
              onPress={() => router.push("/register")}
            >
              Inscrivez-vous
            </Text>
          </XStack> */}
        </YStack>
      </YStack>
    </YStack>
  );
}
