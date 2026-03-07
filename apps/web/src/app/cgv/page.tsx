"use client";

import { useEffect, useState } from "react";
import { ScrollView, Text, YStack } from "tamagui";
import { colors } from "@shiftly/ui";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";

export default function CgvPage() {
  const [cgvContent, setCgvContent] = useState("");

  useEffect(() => {
    const loadCgv = async () => {
      const response = await fetch("/cgv-content.txt");
      const text = await response.text();
      setCgvContent(text);
    };

    void loadCgv();
  }, []);

  return (
    <AppLayout>
      <ScrollView flex={1}>
        <YStack maxWidth={1000} width="100%" alignSelf="center" padding="$6" gap="$6">
          <PageHeader
            title="Conditions générales d'utilisation et de vente (CGV)"
            description="Document officiel Shiftly"
          />

          <YStack
            padding="$6"
            backgroundColor="white"
            borderRadius="$4"
            borderWidth={1}
            borderColor={colors.gray200}
          >
            <Text
              fontSize={14}
              color={colors.gray800}
              lineHeight={24}
              style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
            >
              {cgvContent || "Chargement des CGV..."}
            </Text>
          </YStack>
        </YStack>
      </ScrollView>
    </AppLayout>
  );
}
