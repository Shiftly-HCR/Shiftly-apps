"use client";

import { YStack, XStack, Text, Image } from "tamagui";
import { Button, Input, BaseCard } from "@hestia/ui";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    console.log("Login:", { email, password });
  };

  const handleGoogleLogin = () => {
    console.log("Google login");
  };

  const handleFacebookLogin = () => {
    console.log("Facebook login");
  };

  return (
    <YStack
      flex={1}
      backgroundColor="#F9FAFB"
      alignItems="center"
      justifyContent="center"
      padding="$4"
      minHeight="100vh"
    >
      <BaseCard
        elevated
        maxWidth={440}
        width="100%"
        padding="$6"
        backgroundColor="white"
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
              Connexion Recruteur
            </Text>
            <Text
              fontSize={14}
              color="#6B7280"
              textAlign="center"
              lineHeight={20}
            >
              Accédez à votre espace pour gérer vos missions
            </Text>
          </YStack>

          {/* Formulaire */}
          <YStack gap="$4" width="100%">
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
            <YStack gap="$2" width="100%">
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize={14} fontWeight="600" color="#2B2B2B">
                  Mot de passe
                </Text>
                <Text
                  fontSize={14}
                  color="#FF5900"
                  fontWeight="600"
                  cursor="pointer"
                  hoverStyle={{ textDecorationLine: "underline" }}
                  onPress={() => console.log("Forgot password")}
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
            >
              Se connecter
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
            <XStack
              flex={1}
              paddingVertical="$3"
              paddingHorizontal="$4"
              backgroundColor="white"
              borderRadius="$3"
              borderWidth={1}
              borderColor="#E5E5E5"
              alignItems="center"
              justifyContent="center"
              gap="$2"
              cursor="pointer"
              hoverStyle={{
                backgroundColor: "#F9FAFB",
                borderColor: "#D1D5DB",
              }}
              pressStyle={{ scale: 0.98 }}
              onPress={handleGoogleLogin}
            >
              <FcGoogle size={20} />
              <Text fontSize={14} fontWeight="600" color="#2B2B2B">
                Google
              </Text>
            </XStack>

            <XStack
              flex={1}
              paddingVertical="$3"
              paddingHorizontal="$4"
              backgroundColor="white"
              borderRadius="$3"
              borderWidth={1}
              borderColor="#E5E5E5"
              alignItems="center"
              justifyContent="center"
              gap="$2"
              cursor="pointer"
              hoverStyle={{
                backgroundColor: "#F9FAFB",
                borderColor: "#D1D5DB",
              }}
              pressStyle={{ scale: 0.98 }}
              onPress={handleFacebookLogin}
            >
              <FaFacebook size={20} color="#1877F2" />
              <Text fontSize={14} fontWeight="600" color="#2B2B2B">
                Facebook
              </Text>
            </XStack>
          </XStack>

          {/* Lien d'inscription */}
          <XStack gap="$1" marginTop="$2">
            <Text fontSize={14} color="#6B7280">
              Vous n'avez pas de compte ?
            </Text>
            <Text
              fontSize={14}
              color="#FF5900"
              fontWeight="600"
              cursor="pointer"
              hoverStyle={{ textDecorationLine: "underline" }}
              onPress={() => console.log("Navigate to signup")}
            >
              Inscrivez-vous
            </Text>
          </XStack>
        </YStack>
      </BaseCard>
    </YStack>
  );
}
