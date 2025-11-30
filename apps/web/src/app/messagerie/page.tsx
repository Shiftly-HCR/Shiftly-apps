"use client";

import { YStack, XStack, Text, ScrollView } from "tamagui";
import { colors } from "@shiftly/ui";
import { AppLayout } from "../../components/AppLayout";
import { MessageCircle } from "lucide-react";

export default function MessageriePage() {
  return (
    <AppLayout>
      <ScrollView flex={1}>
        <YStack maxWidth={1400} width="100%" alignSelf="center" padding="$6">
          <YStack
            flex={1}
            alignItems="center"
            justifyContent="center"
            gap="$4"
            paddingVertical="$12"
          >
            <MessageCircle size={64} color={colors.shiftlyViolet} />
            <Text fontSize={24} fontWeight="700" color={colors.gray900}>
              Messagerie
            </Text>
            <Text fontSize={16} color={colors.gray700} textAlign="center">
              Votre messagerie sera bientôt disponible
            </Text>
            <Text fontSize={14} color={colors.gray500} textAlign="center">
              Vous pourrez bientôt communiquer avec les recruteurs et les
              freelances
            </Text>
          </YStack>
        </YStack>
      </ScrollView>
    </AppLayout>
  );
}
