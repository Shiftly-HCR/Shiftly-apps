"use client";

import { useCallback, useEffect, useState } from "react";
import { XStack, YStack, Text, Spinner } from "tamagui";
import { Button, colors } from "@shiftly/ui";
import { AppLayout, PageHeader, RecruitersTable, EstablishmentsTable } from "@/components";
import { useCurrentProfile } from "@/hooks";
import { getAdminDashboardData } from "@/services/adminDashboard";
import type { AdminDashboardResponse } from "@/types/adminDashboard";

const emptyDashboardData: AdminDashboardResponse = {
  recruiters: [],
  establishments: [],
};

export default function AdminDashboardPage() {
  const { profile, isLoading: isLoadingProfile } = useCurrentProfile();
  const [dashboardData, setDashboardData] = useState<AdminDashboardResponse>(
    emptyDashboardData,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = profile?.role?.toLowerCase().trim() === "admin";

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getAdminDashboardData();
      setDashboardData(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement du dashboard admin";
      setError(message);
      setDashboardData(emptyDashboardData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoadingProfile && isAdmin) {
      loadDashboard();
    } else if (!isLoadingProfile && !isAdmin) {
      setIsLoading(false);
    }
  }, [isLoadingProfile, isAdmin, loadDashboard]);

  if (isLoadingProfile || isLoading) {
    return (
      <AppLayout>
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          backgroundColor={colors.backgroundLight}
          gap="$3"
        >
          <Spinner size="large" color={colors.shiftlyViolet} />
          <Text fontSize={15} color={colors.gray700}>
            Chargement du dashboard admin...
          </Text>
        </YStack>
      </AppLayout>
    );
  }

  if (!isAdmin) {
    return (
      <AppLayout>
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          backgroundColor={colors.backgroundLight}
          padding="$6"
          gap="$2"
        >
          <Text fontSize={22} fontWeight="700" color={colors.gray900}>
            Acces refuse
          </Text>
          <Text fontSize={15} color={colors.gray700} textAlign="center">
            Cette page est reservee aux administrateurs.
          </Text>
        </YStack>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <YStack
        flex={1}
        backgroundColor={colors.backgroundLight}
        padding="$4"
        gap="$5"
        width="100%"
        maxWidth={1400}
        alignSelf="center"
      >
        <XStack justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="$3">
          <PageHeader
            title="Dashboard admin"
            description="Vue de pilotage des recruiters et des etablissements."
          />
          <Button variant="outline" size="sm" onPress={loadDashboard}>
            Actualiser
          </Button>
        </XStack>

        {error && (
          <YStack
            backgroundColor={colors.red50}
            borderColor={colors.red200}
            borderWidth={1}
            borderRadius={12}
            padding="$4"
            gap="$3"
          >
            <Text fontSize={14} fontWeight="600" color={colors.red700}>
              {error}
            </Text>
            <XStack>
              <Button variant="outline" size="sm" onPress={loadDashboard}>
                Reessayer
              </Button>
            </XStack>
          </YStack>
        )}

        {!error && (
          <>
            <YStack gap="$3">
              <XStack justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="$2">
                <Text fontSize={22} fontWeight="700" color={colors.gray900}>
                  Recruiters
                </Text>
                <Text fontSize={14} color={colors.gray700}>
                  Total: {dashboardData.recruiters.length}
                </Text>
              </XStack>
              <RecruitersTable recruiters={dashboardData.recruiters} />
            </YStack>

            <YStack gap="$3">
              <XStack justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="$2">
                <Text fontSize={22} fontWeight="700" color={colors.gray900}>
                  Etablissements
                </Text>
                <Text fontSize={14} color={colors.gray700}>
                  Total: {dashboardData.establishments.length}
                </Text>
              </XStack>
              <EstablishmentsTable establishments={dashboardData.establishments} />
            </YStack>
          </>
        )}
      </YStack>
    </AppLayout>
  );
}
