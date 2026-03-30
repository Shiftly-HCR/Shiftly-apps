"use client";

import { useState } from "react";
import { YStack, XStack, Text } from "tamagui";
import { Button, Input, colors } from "@shiftly/ui";
import { useRouter } from "next/navigation";
import { useRegisterPage } from "@/hooks";
import {
  FiEye,
  FiEyeOff,
  FiArrowLeft,
  FiCheck,
  FiUser,
  FiBriefcase,
  FiUsers,
  FiTrendingUp,
} from "react-icons/fi";
import type { IconType } from "react-icons";

type UserType = "freelance" | "recruiter" | "commercial";

const ACCOUNT_TYPES: {
  value: UserType;
  label: string;
  icon: IconType;
  description: string;
  badge?: string;
}[] = [
  {
    value: "freelance",
    label: "Freelance",
    icon: FiBriefcase,
    description:
      "Je suis un travailleur indépendant à la recherche de missions ponctuelles.",
  },
  {
    value: "recruiter",
    label: "Recruteur",
    icon: FiUsers,
    description:
      "Je représente une entreprise et je souhaite recruter des freelances.",
    badge: "Entreprise",
  },
  {
    value: "commercial",
    label: "Commercial",
    icon: FiTrendingUp,
    description:
      "Je suis un apporteur d'affaires ou un partenaire commercial de Shiftly.",
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
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

  const selectedType = ACCOUNT_TYPES.find((t) => t.value === userType);

  function handleSelectType(value: UserType) {
    setUserType(value);
    setStep(2);
  }

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
        maxWidth={step === 1 ? 560 : 440}
        padding="$6"
        style={{ width: "100%", transition: "max-width 0.3s ease" }}
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
            <FiUser size={22} color={colors.shiftlyViolet} />
          </YStack>

          {/* Indicateur d'étapes */}
          <XStack gap="$2" alignItems="center">
            <StepDot active={step >= 1} done={step > 1} label="1" />
            <YStack
              height={2}
              width={32}
              backgroundColor={step > 1 ? colors.shiftlyViolet : "#E5E5E5"}
              borderRadius={1}
            />
            <StepDot active={step >= 2} done={false} label="2" />
          </XStack>

          {/* ---- ÉTAPE 1 : choix du type de compte ---- */}
          {step === 1 && (
            <YStack gap="$5" style={{ width: "100%" }} alignItems="center">
              <YStack gap="$2" alignItems="center">
                <Text fontSize={22} fontWeight="700" color="#2B2B2B" textAlign="center">
                  Quel type de compte souhaitez-vous créer ?
                </Text>
                <Text fontSize={14} color="#6B7280" textAlign="center" lineHeight={20}>
                  Choisissez attentivement — cela détermine vos accès et fonctionnalités.
                </Text>
              </YStack>

              <YStack gap="$3" style={{ width: "100%" }}>
                {ACCOUNT_TYPES.map((type) => (
                  <AccountTypeCard
                    key={type.value}
                    type={type}
                    onSelect={handleSelectType}
                  />
                ))}
              </YStack>

              <XStack gap="$1" marginTop="$1">
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
          )}

          {/* ---- ÉTAPE 2 : informations personnelles ---- */}
          {step === 2 && (
            <YStack gap="$4" style={{ width: "100%" }}>
              {/* En-tête avec type sélectionné */}
              <YStack gap="$2" alignItems="center">
                <Text fontSize={22} fontWeight="700" color="#2B2B2B" textAlign="center">
                  Créer votre compte
                </Text>
                {selectedType && (
                  <XStack
                    gap="$2"
                    alignItems="center"
                    paddingHorizontal="$3"
                    paddingVertical="$1"
                    backgroundColor={colors.shiftlyVioletLight}
                    borderRadius="$4"
                    borderWidth={1}
                    borderColor={colors.shiftlyViolet}
                  >
                    <selectedType.icon size={14} color={colors.shiftlyViolet} />
                    <Text fontSize={13} fontWeight="600" color={colors.shiftlyViolet}>
                      {selectedType.label}
                    </Text>
                    <Text
                      fontSize={12}
                      color={colors.shiftlyViolet}
                      cursor="pointer"
                      onPress={() => setStep(1)}
                      opacity={0.7}
                      hoverStyle={{ opacity: 1 }}
                    >
                      · Modifier
                    </Text>
                  </XStack>
                )}
              </YStack>

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

              {/* Actions */}
              <XStack gap="$3" marginTop="$2">
                <XStack
                  alignItems="center"
                  gap="$1"
                  cursor="pointer"
                  onPress={() => setStep(1)}
                  paddingVertical="$2"
                  paddingHorizontal="$3"
                  borderRadius="$3"
                  borderWidth={1}
                  borderColor="#E5E5E5"
                  hoverStyle={{ backgroundColor: "#F9FAFB" }}
                >
                  <FiArrowLeft size={16} color="#6B7280" />
                  <Text fontSize={14} color="#6B7280" fontWeight="500">
                    Retour
                  </Text>
                </XStack>

                <YStack flex={1}>
                  <Button
                    variant="primary"
                    size="lg"
                    onPress={handleRegister}
                    disabled={isLoading}
                    opacity={isLoading ? 0.6 : 1}
                  >
                    {isLoading ? "Création en cours..." : "Créer mon compte"}
                  </Button>
                </YStack>
              </XStack>

              <XStack gap="$1" justifyContent="center">
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
          )}
        </YStack>
      </YStack>
    </YStack>
  );
}

// --- Composants locaux ---

function StepDot({
  active,
  done,
  label,
}: {
  active: boolean;
  done: boolean;
  label: string;
}) {
  return (
    <YStack
      width={28}
      height={28}
      borderRadius={14}
      backgroundColor={active ? colors.shiftlyViolet : "#E5E5E5"}
      alignItems="center"
      justifyContent="center"
    >
      {done ? (
        <FiCheck size={14} color="white" />
      ) : (
        <Text fontSize={12} fontWeight="700" color={active ? "white" : "#9CA3AF"}>
          {label}
        </Text>
      )}
    </YStack>
  );
}

function AccountTypeCard({
  type,
  onSelect,
}: {
  type: (typeof ACCOUNT_TYPES)[number];
  onSelect: (value: UserType) => void;
}) {
  return (
    <XStack
      gap="$4"
      padding="$4"
      borderRadius="$4"
      borderWidth={1.5}
      borderColor="#E5E5E5"
      backgroundColor="white"
      cursor="pointer"
      alignItems="center"
      onPress={() => onSelect(type.value)}
      hoverStyle={{
        borderColor: colors.shiftlyViolet,
        backgroundColor: colors.shiftlyVioletLight,
      }}
      style={{ transition: "all 0.15s ease" }}
    >
      {/* Icône */}
      <YStack
        width={48}
        height={48}
        borderRadius={12}
        backgroundColor="#F3F4F6"
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
      >
        <type.icon size={22} color="#6B7280" />
      </YStack>

      {/* Texte */}
      <YStack flex={1} gap="$1">
        <XStack gap="$2" alignItems="center">
          <Text fontSize={16} fontWeight="700" color="#2B2B2B">
            {type.label}
          </Text>
          {type.badge && (
            <YStack
              paddingHorizontal={8}
              paddingVertical={2}
              backgroundColor="#FEF3C7"
              borderRadius={99}
            >
              <Text fontSize={11} fontWeight="600" color="#92400E">
                {type.badge}
              </Text>
            </YStack>
          )}
        </XStack>
        <Text fontSize={13} color="#6B7280" lineHeight={18}>
          {type.description}
        </Text>
      </YStack>

      {/* Flèche */}
      <FiArrowLeft size={18} color="#D1D5DB" style={{ transform: "rotate(180deg)" }} />
    </XStack>
  );
}
