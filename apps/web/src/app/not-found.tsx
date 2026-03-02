"use client";

import Image from "next/image";
import { YStack, XStack, Text } from "tamagui";
import { colors } from "@shiftly/ui";
import Link from "next/link";
import { AppLayout } from "@/components";

export default function NotFound() {
  const usefulLinks = [
    { label: "Page d'accueil", href: "/" },
    { label: "Missions", href: "/missions" },
    { label: "Aide", href: "/help" },
    { label: "Contact", href: "/contact" },
    { label: "Mon profil", href: "/profile" },
    { label: "Paiements", href: "/payments" },
  ];

  return (
    <AppLayout>
      <YStack
        flex={1}
        backgroundColor="#F5F5F5"
        padding="$4"
      >
        <XStack
          flex={1}
          alignItems="center"
          justifyContent="space-between"
          paddingHorizontal="$6"
          paddingVertical="$8"
          maxWidth={1200}
          width="100%"
          alignSelf="center"
        >
          {/* Colonne gauche - Texte */}
          <YStack flex={1} gap="$4" paddingRight="$6" maxWidth={480}>
            <Text
              fontSize={48}
              fontWeight="700"
              color="#222222"
              lineHeight={52}
            >
              Oups !
            </Text>
            <Text
              fontSize={20}
              color="#222222"
              lineHeight={28}
            >
              La page que vous recherchez semble introuvable.
            </Text>
            <Text fontSize={14} color="#717171" marginTop="$2">
              Code d&apos;erreur : 404
            </Text>
            <Text
              fontSize={16}
              color="#222222"
              fontWeight="600"
              marginTop="$6"
            >
              Voici quelques liens utiles à la place :
            </Text>
            <YStack gap="$3" marginTop="$2">
              {usefulLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Text
                    fontSize={16}
                    color={colors.shiftlyViolet}
                    fontWeight="600"
                    hoverStyle={{ textDecorationLine: "underline" }}
                  >
                    {link.label}
                  </Text>
                </Link>
              ))}
            </YStack>
          </YStack>

          {/* Colonne droite - Illustration */}
          <YStack
            flex={1}
            alignItems="center"
            justifyContent="center"
            minWidth={280}
            maxWidth={400}
          >
            <Image
              src="/image.png"
              alt="404"
              width={280}
              height={280}
              className="object-contain"
            />
          </YStack>
        </XStack>
      </YStack>
    </AppLayout>
  );
}
