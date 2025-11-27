"use client";

import { YStack, XStack, Text, ScrollView } from "tamagui";
import { Button, BaseCard, colors } from "@shiftly/ui";
import { AppLayout } from "../../components/AppLayout";
import { FiCheck, FiHome, FiUser, FiBriefcase } from "react-icons/fi";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: React.ReactNode;
  features: string[];
  popular?: boolean;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "establishment",
    name: "Établissement",
    price: 50,
    description: "Pour les restaurants, hôtels et établissements HCR",
    icon: <FiHome size={32} color={colors.shiftlyOrange} />,
    features: [
      "Publication illimitée de missions",
      "Accès à tous les freelances",
      "Gestion des candidatures",
      "Support prioritaire",
      "Statistiques détaillées",
      "Recherche avancée",
    ],
  },
  {
    id: "freelance-student",
    name: "Freelance Étudiant",
    price: 25,
    description: "Tarif préférentiel pour les étudiants",
    icon: <FiUser size={32} color={colors.shiftlyOrange} />,
    features: [
      "Accès à toutes les missions",
      "Profil visible pour les recruteurs",
      "Notifications en temps réel",
      "Support client",
      "Gestion de disponibilité",
      "Historique des missions",
    ],
    popular: true,
  },
  {
    id: "freelance-classic",
    name: "Freelance Classique",
    price: 35,
    description: "Pour freelances et bénéficiaires Pôle Emploi",
    icon: <FiBriefcase size={32} color={colors.shiftlyOrange} />,
    features: [
      "Accès à toutes les missions",
      "Profil visible pour les recruteurs",
      "Notifications en temps réel",
      "Support client",
      "Gestion de disponibilité",
      "Historique des missions",
      "Badge Pôle Emploi",
    ],
  },
];

export default function SubscriptionPage() {
  const handleSubscribe = (planId: string) => {
    // TODO: Implémenter la logique d'abonnement
    console.log(`Abonnement à ${planId}`);
  };

  return (
    <AppLayout>
      <ScrollView flex={1}>
        <YStack
          maxWidth={1400}
          width="100%"
          alignSelf="center"
          padding="$6"
          gap="$8"
        >
          {/* En-tête */}
          <YStack alignItems="center" gap="$3" marginTop="$4">
            <Text
              fontSize={40}
              fontWeight="700"
              color={colors.gray900}
              textAlign="center"
            >
              Choisissez votre abonnement
            </Text>
            <Text
              fontSize={18}
              color={colors.gray700}
              textAlign="center"
              maxWidth={600}
            >
              Sélectionnez l'offre qui correspond le mieux à vos besoins et
              commencez à utiliser Shiftly dès aujourd'hui
            </Text>
          </YStack>

          {/* Cartes d'abonnement */}
          <XStack
            flexWrap="wrap"
            gap="$6"
            justifyContent="center"
            alignItems="stretch"
            marginTop="$4"
          >
            {subscriptionPlans.map((plan) => (
              <YStack
                key={plan.id}
                flex={1}
                minWidth={320}
                maxWidth={400}
                position="relative"
              >
                {plan.popular && (
                  <YStack
                    position="absolute"
                    top={-12}
                    alignSelf="center"
                    zIndex={10}
                    paddingHorizontal="$4"
                    paddingVertical="$2"
                    backgroundColor={colors.shiftlyOrange}
                    borderRadius="$4"
                  >
                    <Text
                      fontSize={12}
                      fontWeight="700"
                      color={colors.white}
                      textTransform="uppercase"
                    >
                      Populaire
                    </Text>
                  </YStack>
                )}

                <BaseCard
                  elevated={plan.popular}
                  clickable={false}
                  padding="$6"
                  gap="$5"
                  borderWidth={plan.popular ? 2 : 1}
                  borderColor={
                    plan.popular ? colors.shiftlyOrange : colors.gray200
                  }
                  backgroundColor={colors.white}
                  minHeight={600}
                >
                  {/* Icône et nom */}
                  <YStack alignItems="center" gap="$3">
                    <YStack
                      width={80}
                      height={80}
                      borderRadius={40}
                      backgroundColor={colors.gray050}
                      alignItems="center"
                      justifyContent="center"
                    >
                      {plan.icon}
                    </YStack>
                    <YStack alignItems="center" gap="$1">
                      <Text
                        fontSize={24}
                        fontWeight="700"
                        color={colors.gray900}
                      >
                        {plan.name}
                      </Text>
                      <Text
                        fontSize={14}
                        color={colors.gray700}
                        textAlign="center"
                      >
                        {plan.description}
                      </Text>
                    </YStack>
                  </YStack>

                  {/* Prix */}
                  <YStack alignItems="center" gap="$1">
                    <XStack alignItems="baseline" gap="$1">
                      <Text
                        fontSize={48}
                        fontWeight="700"
                        color={colors.gray900}
                      >
                        {plan.price}€
                      </Text>
                      <Text fontSize={18} color={colors.gray700}>
                        TTC
                      </Text>
                    </XStack>
                    <Text fontSize={14} color={colors.gray500}>
                      par mois
                    </Text>
                  </YStack>

                  {/* Liste des fonctionnalités */}
                  <YStack gap="$3" flex={1}>
                    {plan.features.map((feature, index) => (
                      <XStack key={index} gap="$3" alignItems="flex-start">
                        <YStack
                          width={20}
                          height={20}
                          borderRadius={10}
                          backgroundColor={colors.shiftlyOrange + "20"}
                          alignItems="center"
                          justifyContent="center"
                          marginTop={2}
                          flexShrink={0}
                        >
                          <FiCheck
                            size={14}
                            color={colors.shiftlyOrange}
                            strokeWidth={3}
                          />
                        </YStack>
                        <Text
                          fontSize={15}
                          color={colors.gray700}
                          flex={1}
                          lineHeight={22}
                        >
                          {feature}
                        </Text>
                      </XStack>
                    ))}
                  </YStack>

                  {/* Bouton d'abonnement */}
                  <Button
                    variant={plan.popular ? "primary" : "outline"}
                    size="lg"
                    onPress={() => handleSubscribe(plan.id)}
                    width="100%"
                  >
                    {plan.popular ? "Choisir ce plan" : "S'abonner"}
                  </Button>
                </BaseCard>
              </YStack>
            ))}
          </XStack>

          {/* Section FAQ ou informations supplémentaires */}
          <YStack
            marginTop="$8"
            padding="$6"
            backgroundColor={colors.gray050}
            borderRadius={12}
            gap="$4"
          >
            <Text fontSize={20} fontWeight="700" color={colors.gray900}>
              Questions fréquentes
            </Text>
            <YStack gap="$3">
              <YStack gap="$1">
                <Text fontSize={16} fontWeight="600" color={colors.gray900}>
                  Puis-je changer de plan à tout moment ?
                </Text>
                <Text fontSize={14} color={colors.gray700} lineHeight={20}>
                  Oui, vous pouvez mettre à jour ou annuler votre abonnement à
                  tout moment depuis votre profil.
                </Text>
              </YStack>
              <YStack gap="$1">
                <Text fontSize={16} fontWeight="600" color={colors.gray900}>
                  Y a-t-il un engagement ?
                </Text>
                <Text fontSize={14} color={colors.gray700} lineHeight={20}>
                  Non, tous nos abonnements sont sans engagement. Vous pouvez
                  résilier à tout moment.
                </Text>
              </YStack>
              <YStack gap="$1">
                <Text fontSize={16} fontWeight="600" color={colors.gray900}>
                  Comment puis-je prouver mon statut étudiant ou Pôle Emploi ?
                </Text>
                <Text fontSize={14} color={colors.gray700} lineHeight={20}>
                  Vous devrez fournir une preuve lors de votre inscription. Nos
                  équipes vérifieront votre éligibilité sous 48h.
                </Text>
              </YStack>
            </YStack>
          </YStack>
        </YStack>
      </ScrollView>
    </AppLayout>
  );
}
