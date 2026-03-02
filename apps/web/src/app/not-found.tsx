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
          flexDirection="row-reverse"
          $sm={{
            flexDirection: "column",
            paddingHorizontal: "$3",
            paddingVertical: "$5",
          }}
        >
          {/* Illustration — première dans le DOM : en haut sur mobile, à droite sur desktop */}
          <YStack
            flex={1}
            alignItems="center"
            justifyContent="center"
            minWidth={280}
            maxWidth={400}
            $sm={{
              minWidth: 0,
              maxWidth: "100%",
              marginBottom: "$5",
            }}
          >
            <Image
              src="/image.png"
              alt="404"
              width={280}
              height={280}
              className="object-contain"
              style={{ width: "100%", maxWidth: 280, height: "auto" }}
            />
          </YStack>

          {/* Texte — deuxième dans le DOM : en bas sur mobile, à gauche sur desktop */}
          <YStack
            flex={1}
            gap="$4"
            paddingRight="$6"
            maxWidth={480}
            $sm={{
              maxWidth: "100%",
              paddingRight: 0,
              alignItems: "center",
            }}
          >
            <Text
              fontSize={48}
              fontWeight="700"
              color="#222222"
              lineHeight={52}
              $sm={{ fontSize: 36, lineHeight: 42, textAlign: "center" }}
            >
              Oups !
            </Text>
            <Text
              fontSize={20}
              color="#222222"
              lineHeight={28}
              $sm={{ fontSize: 16, lineHeight: 24, textAlign: "center" }}
            >
              La page que vous recherchez semble introuvable.
            </Text>
            <Text
              fontSize={14}
              color="#717171"
              marginTop="$2"
              $sm={{ textAlign: "center" }}
            >
              Code d&apos;erreur : 404
            </Text>
            <Text
              fontSize={16}
              color="#222222"
              fontWeight="600"
              marginTop="$6"
              $sm={{ marginTop: "$4", textAlign: "center" }}
            >
              Voici quelques liens utiles à la place :
            </Text>
            <YStack
              gap="$3"
              marginTop="$2"
              $sm={{ alignItems: "center" }}
            >
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
        </XStack>
      </YStack>
    </AppLayout>
  );
}
