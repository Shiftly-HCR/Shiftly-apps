"use client";

import { YStack, XStack, Text } from "tamagui";
import { colors } from "@shiftly/ui";
import dynamic from "next/dynamic";

// Import dynamique du PieChart pour éviter les erreurs SSR
const PieChart = dynamic(() => import("recharts").then((mod) => mod.PieChart), {
  ssr: false,
});
const Pie = dynamic(() => import("recharts").then((mod) => mod.Pie), {
  ssr: false,
});
const Cell = dynamic(() => import("recharts").then((mod) => mod.Cell), {
  ssr: false,
});
const Legend = dynamic(() => import("recharts").then((mod) => mod.Legend), {
  ssr: false,
});
const ResponsiveContainer = dynamic(
  () => import("recharts").then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);

interface RevenueData {
  name: string;
  value: number;
  color: string;
}

interface RevenuePieChartProps {
  data: RevenueData[];
  title?: string;
  subtitle?: string;
}

/**
 * Composant pour afficher un graphique pie chart des revenus
 */
export function RevenuePieChart({
  data,
  title = "Bénéfice total mensuel",
  subtitle = "Répartition des revenus par source",
}: RevenuePieChartProps) {
  const totalRevenue = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <YStack
      backgroundColor="white"
      borderRadius="$4"
      padding="$6"
      borderWidth={1}
      borderColor={colors.gray200}
      gap="$4"
    >
      <YStack gap="$2">
        <Text fontSize={20} fontWeight="600" color={colors.gray900}>
          {title}
        </Text>
        <Text fontSize={14} color={colors.gray500}>
          {subtitle}
        </Text>
      </YStack>

      <XStack gap="$6" alignItems="center" flexWrap="wrap">
        {/* Graphique */}
        <YStack flex={1} minWidth={300} alignItems="center">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                }
                outerRadius={100}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value, entry: any) => (
                  <span style={{ color: entry.color }}>
                    {value}: {entry.payload.value}€
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </YStack>

        {/* Total */}
        <YStack
          minWidth={200}
          alignItems="center"
          justifyContent="center"
          gap="$2"
        >
          <Text fontSize={14} color={colors.gray500}>
            Total mensuel
          </Text>
          <Text fontSize={40} fontWeight="700" color={colors.shiftlyViolet}>
            {totalRevenue.toLocaleString("fr-FR")}€
          </Text>
        </YStack>
      </XStack>
    </YStack>
  );
}

