"use client";

import { XStack, YStack, Text } from "tamagui";
import { colors } from "@shiftly/ui";
import { useResponsive } from "@/hooks";
import type { RecruiterDashboardRow } from "@/types/adminDashboard";

interface RecruitersTableProps {
  recruiters: RecruiterDashboardRow[];
}

const RECRUITER_COLUMN_WIDTH = "30%";
const EMAIL_COLUMN_WIDTH = "32%";
const SUBSCRIPTION_COLUMN_WIDTH = "20%";
const ESTABLISHMENTS_COLUMN_WIDTH = "10%";
const MISSIONS_COLUMN_WIDTH = "8%";

function getRecruiterIdentity(recruiter: RecruiterDashboardRow): string {
  const fullName =
    `${recruiter.first_name || ""} ${recruiter.last_name || ""}`.trim();
  if (fullName) return fullName;
  if (recruiter.email) return recruiter.email;
  return "Inconnu";
}

function getSubscriptionLabel(isPremium: boolean | null): {
  label: string;
  backgroundColor: string;
  color: string;
} {
  if (isPremium) {
    return {
      label: "Abonné",
      backgroundColor: colors.green100,
      color: colors.green800,
    };
  }

  return {
    label: "Non abonné",
    backgroundColor: colors.red100,
    color: colors.red800,
  };
}

export function RecruitersTable({ recruiters }: RecruitersTableProps) {
  const { isMobile } = useResponsive();

  if (recruiters.length === 0) {
    return (
      <YStack
        padding="$5"
        backgroundColor={colors.white}
        borderWidth={1}
        borderColor={colors.gray200}
        borderRadius={12}
      >
        <Text fontSize={14} color={colors.gray700}>
          Aucun recruteur à afficher.
        </Text>
      </YStack>
    );
  }

  if (isMobile) {
    return (
      <YStack gap="$3">
        {recruiters.map((recruiter) => {
          const subscription = getSubscriptionLabel(recruiter.is_premium);
          return (
            <YStack
              key={recruiter.recruiter_id}
              backgroundColor={colors.white}
              borderWidth={1}
              borderColor={colors.gray200}
              borderRadius={12}
              padding="$4"
              gap="$2"
            >
              <Text fontSize={16} fontWeight="600" color={colors.gray900}>
                {getRecruiterIdentity(recruiter)}
              </Text>
              <Text fontSize={13} color={colors.gray700}>
                {recruiter.email || "Email non renseigné"}
              </Text>
              <XStack
                alignSelf="flex-start"
                paddingHorizontal="$2"
                paddingVertical="$1"
                borderRadius={999}
                backgroundColor={subscription.backgroundColor}
              >
                <Text fontSize={12} fontWeight="600" color={subscription.color}>
                  {subscription.label}
                </Text>
              </XStack>
              <Text fontSize={13} color={colors.gray700}>
                Etablissements: {recruiter.establishments_count}
              </Text>
              <Text fontSize={13} color={colors.gray700}>
                Missions: {recruiter.missions_count}
              </Text>
            </YStack>
          );
        })}
      </YStack>
    );
  }

  return (
    <YStack
      backgroundColor={colors.white}
      borderWidth={1}
      borderColor={colors.gray200}
      borderRadius={12}
      overflow="hidden"
    >
      <XStack
        padding="$4"
        backgroundColor={colors.gray050}
        borderBottomWidth={1}
        borderBottomColor={colors.gray200}
      >
        <XStack width={RECRUITER_COLUMN_WIDTH}>
          <Text fontSize={13} fontWeight="700" color={colors.gray700}>
            Recruteur
          </Text>
        </XStack>
        <XStack width={EMAIL_COLUMN_WIDTH}>
          <Text fontSize={13} fontWeight="700" color={colors.gray700}>
            Email
          </Text>
        </XStack>
        <XStack width={SUBSCRIPTION_COLUMN_WIDTH}>
          <Text fontSize={13} fontWeight="700" color={colors.gray700}>
            Abonnement
          </Text>
        </XStack>
        <XStack width={ESTABLISHMENTS_COLUMN_WIDTH}>
          <Text fontSize={13} fontWeight="700" color={colors.gray700}>
            Etablissements
          </Text>
        </XStack>
        <XStack width={MISSIONS_COLUMN_WIDTH}>
          <Text fontSize={13} fontWeight="700" color={colors.gray700}>
            Missions
          </Text>
        </XStack>
      </XStack>

      {recruiters.map((recruiter, index) => {
        const subscription = getSubscriptionLabel(recruiter.is_premium);
        const isLast = index === recruiters.length - 1;

        return (
          <XStack
            key={recruiter.recruiter_id}
            padding="$4"
            borderBottomWidth={isLast ? 0 : 1}
            borderBottomColor={colors.gray100}
          >
            <XStack width={RECRUITER_COLUMN_WIDTH} paddingRight="$3">
              <Text fontSize={14} color={colors.gray900} numberOfLines={1}>
                {getRecruiterIdentity(recruiter)}
              </Text>
            </XStack>
            <XStack width={EMAIL_COLUMN_WIDTH} paddingRight="$3">
              <Text fontSize={14} color={colors.gray700} numberOfLines={1}>
                {recruiter.email || "Email non renseigné"}
              </Text>
            </XStack>
            <XStack width={SUBSCRIPTION_COLUMN_WIDTH}>
              <XStack
                paddingHorizontal="$2"
                paddingVertical="$1"
                borderRadius={999}
                backgroundColor={subscription.backgroundColor}
              >
                <Text fontSize={12} fontWeight="600" color={subscription.color}>
                  {subscription.label}
                </Text>
              </XStack>
            </XStack>
            <XStack width={ESTABLISHMENTS_COLUMN_WIDTH}>
              <Text fontSize={14} color={colors.gray900}>
                {recruiter.establishments_count}
              </Text>
            </XStack>
            <XStack width={MISSIONS_COLUMN_WIDTH}>
              <Text fontSize={14} color={colors.gray900}>
                {recruiter.missions_count}
              </Text>
            </XStack>
          </XStack>
        );
      })}
    </YStack>
  );
}
