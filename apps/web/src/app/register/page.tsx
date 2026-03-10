"use client";

import { useState } from "react";
import { YStack, XStack, Text } from "tamagui";
import { Button, Input, RadioGroup, colors } from "@shiftly/ui";
import { useRouter } from "next/navigation";
import { useRegisterPage } from "@/hooks";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    userType,
    setUserType,
    error,
    isLoading,
    handleRegister,
  } = useRegisterPage();

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
              Rejoignez Shiftly et commencez à gérer vos missions
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

            {/* Type de compte */}
            <RadioGroup
              label="Type de compte"
              options={[
                { label: "Recruteur", value: "recruiter" },
                { label: "Freelance", value: "freelance" },
                { label: "Commercial", value: "commercial" },
              ]}
              value={userType}
              onChange={(value) =>
                setUserType(
                  value as "freelance" | "recruiter" | "commercial",
                )
              }
              required
              helperText="Sélectionnez votre type de compte"
            />

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
            <YStack gap="$2" width="100%" position="relative">
              <Text fontSize={14} fontWeight="600" color="#2B2B2B">
                Mot de passe <Text color={colors.shiftlyViolet}>*</Text>
              </Text>
              <Input
                placeholder="Minimum 8 caractères"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                paddingRight={48}
              />
              <XStack
                position="absolute"
                right={12}
                bottom={13}
                onPress={() => setShowPassword((prev) => !prev)}
                cursor="pointer"
                alignItems="center"
                justifyContent="center"
                width={24}
                height={24}
              >
                {showPassword ? (
                  <FiEyeOff size={18} color="#6B7280" />
                ) : (
                  <FiEye size={18} color="#6B7280" />
                )}
              </XStack>
            </YStack>

            {/* Confirmation mot de passe */}
            <YStack gap="$2" width="100%" position="relative">
              <Text fontSize={14} fontWeight="600" color="#2B2B2B">
                Confirmer le mot de passe{" "}
                <Text color={colors.shiftlyViolet}>*</Text>
              </Text>
              <Input
                placeholder="Répétez votre mot de passe"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                paddingRight={48}
              />
              <XStack
                position="absolute"
                right={12}
                bottom={13}
                onPress={() => setShowConfirmPassword((prev) => !prev)}
                cursor="pointer"
                alignItems="center"
                justifyContent="center"
                width={24}
                height={24}
              >
                {showConfirmPassword ? (
                  <FiEyeOff size={18} color="#6B7280" />
                ) : (
                  <FiEye size={18} color="#6B7280" />
                )}
              </XStack>
            </YStack>

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
              color={colors.shiftlyViolet}
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
