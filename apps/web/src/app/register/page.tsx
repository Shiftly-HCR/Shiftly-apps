"use client";

import { YStack, XStack, Text } from "tamagui";
import { Button, Input } from "@hestia/ui";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = () => {
    console.log("Register:", {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    });
  };

  const handleGoogleRegister = () => {
    console.log("Google register");
  };

  const handleFacebookRegister = () => {
    console.log("Facebook register");
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
            >
              Créer mon compte
            </Button>
          </YStack>

          {/* Séparateur */}
          <XStack gap="$3" alignItems="center" width="100%">
            <YStack flex={1} height={1} backgroundColor="#E5E5E5" />
            <Text fontSize={13} color="#6B7280">
              Ou continuer avec
            </Text>
            <YStack flex={1} height={1} backgroundColor="#E5E5E5" />
          </XStack>

          {/* Boutons sociaux */}
          <XStack gap="$3" width="100%">
            <YStack flex={1}>
              <Button variant="ghost" size="md" onPress={handleGoogleRegister}>
                <XStack gap="$2" alignItems="center">
                  <FcGoogle size={20} />
                  <Text fontSize={14} fontWeight="600" color="#2B2B2B">
                    Google
                  </Text>
                </XStack>
              </Button>
            </YStack>

            <YStack flex={1}>
              <Button
                variant="ghost"
                size="md"
                onPress={handleFacebookRegister}
              >
                <XStack gap="$2" alignItems="center">
                  <FaFacebook size={20} color="#1877F2" />
                  <Text fontSize={14} fontWeight="600" color="#2B2B2B">
                    Facebook
                  </Text>
                </XStack>
              </Button>
            </YStack>
          </XStack>

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
