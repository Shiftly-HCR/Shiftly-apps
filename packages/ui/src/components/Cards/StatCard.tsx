import { YStack, XStack, Text } from "tamagui";
import React from "react";
import { BaseCard } from "./BaseCard";

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

export const StatCard = ({
  label,
  value,
  subtitle,
  icon,
  color = "$primary",
  trend,
  trendValue,
}: StatCardProps) => {
  return (
    <BaseCard gap="$3" minWidth={160}>
      <XStack alignItems="center" justifyContent="space-between">
        <Text fontSize={14} color="#999999" fontWeight="500">
          {label}
        </Text>
        {icon && <YStack>{icon}</YStack>}
      </XStack>

      <YStack gap="$1">
        <Text fontSize={32} fontWeight="700" color={color}>
          {value}
        </Text>

        {(subtitle || trend) && (
          <XStack alignItems="center" gap="$2">
            {trend && trendValue && (
              <XStack
                alignItems="center"
                gap="$1"
                paddingHorizontal={8}
                paddingVertical={4}
                borderRadius="$2"
                backgroundColor={
                  trend === "up"
                    ? "#E8F5E9"
                    : trend === "down"
                      ? "#FFEBEE"
                      : "$surface"
                }
              >
                <Text
                  fontSize={12}
                  fontWeight="600"
                  color={
                    trend === "up"
                      ? "#4CAF50"
                      : trend === "down"
                        ? "#F44336"
                        : "#999999"
                  }
                >
                  {trend === "up" ? "↑" : trend === "down" ? "↓" : "−"}{" "}
                  {trendValue}
                </Text>
              </XStack>
            )}

            {subtitle && (
              <Text fontSize={12} color="#999999">
                {subtitle}
              </Text>
            )}
          </XStack>
        )}
      </YStack>
    </BaseCard>
  );
};
