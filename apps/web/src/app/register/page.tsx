"use client";

import { YStack, XStack, Text } from "tamagui";
import { Button, Input } from "@hestia/ui";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@hestia/data";

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    setError("");
    setIsLoading(true);

    // Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError("Veuillez remplir tous les champs");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      setIsLoading(false);
      return;
    }

    const result = await signUp({
      email,
      password,
      firstName,
      lastName,
    });

    if (result.success) {
      router.push("/home");
    } else {
      setError(result.error || "Une erreur est survenue");
    }

    setIsLoading(false);
  };

  return (
    <YStack
      flex={1}
      backgroundColor="#F9FAFB"
      alignItems="center"
      justifyContent="center"
      padding="$4"
      minHeight="100vh"
      paddingVertical="$8"
    >
      <YStack
        maxWidth={440}
        width="100%"
        padding="$6"
        backgroundColor="white"
        borderRadius="$4"
        borderWidth={1}
        borderColor="#E5E5E5"
        shadowColor="rgba(0, 0, 0, 0.1)"
        shadowOffset={{ width: 0, height: 4 }}
        shadowOpacity={1}
        shadowRadius={12}
        elevation={4}
      >
        <YStack gap="$5" alignItems="center">
          {/* Logo */}
          <YStack
            width={48}
            height={48}
            borderRadius={24}
            backgroundColor="#FFF4E6"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize={24}>👤</Text>
          </YStack>

          {/* Titre et sous-titre */}
          <YStack gap="$2" alignItems="center">
            <Text
              fontSize={24}
              fontWeight="700"
              color="#2B2B2B"
              textAlign="center"
            >
              Créer un compte
            </Text>
            <Text
              fontSize={14}
              color="#6B7280"
              textAlign="center"
              lineHeight={20}
            >
              Rejoignez Hestia et commencez à gérer vos missions
            </Text>
          </YStack>

          {/* Formulaire */}
          <YStack gap="$4" width="100%">
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

            {/* Nom et Prénom */}
            <XStack gap="$3" width="100%">
              <YStack flex={1}>
                <Input
                  label="Prénom"
                  placeholder="Jean"
                  value={firstName}
                  onChangeText={setFirstName}
                  required
                />
              </YStack>
              <YStack flex={1}>
                <Input
                  label="Nom"
                  placeholder="Dupont"
                  value={lastName}
                  onChangeText={setLastName}
                  required
                />
              </YStack>
            </XStack>

            {/* Email */}
            <Input
              label="Adresse e-mail"
              placeholder="exemple@email.com"
              value={email}
              onChangeText={setEmail}
              autoComplete="email"
              keyboardType="email-address"
              required
            />

            {/* Mot de passe */}
            <Input
              label="Mot de passe"
              placeholder="Minimum 8 caractères"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
              required
            />

            {/* Confirmation mot de passe */}
            <Input
              label="Confirmer le mot de passe"
              placeholder="Répétez votre mot de passe"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoComplete="new-password"
              required
            />

            {/* Bouton d'inscription */}
            <Button
              variant="primary"
              size="lg"
              onPress={handleRegister}
              marginTop="$2"
              disabled={isLoading}
              opacity={isLoading ? 0.6 : 1}
            >
              {isLoading ? "Création en cours..." : "Créer mon compte"}
            </Button>
          </YStack>

          {/* Lien de connexion */}
          <XStack gap="$1" marginTop="$2">
            <Text fontSize={14} color="#6B7280">
              Vous avez déjà un compte ?
            </Text>
            <Text
              fontSize={14}
              color="#FF5900"
              fontWeight="600"
              cursor="pointer"
              hoverStyle={{ textDecorationLine: "underline" }}
              onPress={() => router.push("/login")}
            >
              Connectez-vous
            </Text>
          </XStack>
        </YStack>
      </YStack>
    </YStack>
  );
}
