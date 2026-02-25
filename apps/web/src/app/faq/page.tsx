"use client";

import { YStack, Text, ScrollView } from "tamagui";
import { AppLayout, PageHeader, FAQSection } from "@/components";
import { useResponsive } from "@/hooks";
import { colors } from "@shiftly/ui";

export default function FAQPage() {
  const generalQuestions = [
    {
      question: "Qu'est-ce que Shiftly ?",
      answer:
        "Shiftly est une plateforme de recrutement spécialisée dans l'hôtellerie et la restauration. Elle permet aux recruteurs de trouver des talents qualifiés et aux freelances de trouver des missions adaptées à leurs compétences.",
    },
    {
      question: "Comment créer un compte ?",
      answer:
        "Pour créer un compte, cliquez sur 'Inscription' en haut à droite de la page. Remplissez le formulaire avec vos informations et choisissez votre rôle (recruteur ou freelance). Votre compte sera créé en quelques minutes.",
    },
    {
      question: "Quels sont les différents types de comptes ?",
      answer:
        "Il existe deux types de comptes : Recruteur (pour les établissements qui cherchent des talents) et Freelance (pour les professionnels qui cherchent des missions). Vous pouvez choisir votre rôle lors de l'inscription.",
    },
    {
      question: "La plateforme est-elle gratuite ?",
      answer:
        "Shiftly propose différents plans d'abonnement selon vos besoins. Consultez notre page d'abonnement pour découvrir les tarifs et fonctionnalités disponibles.",
    },
  ];

  const recruiterQuestions = [
    {
      question: "Comment publier une mission ?",
      answer:
        "Une fois connecté en tant que recruteur, allez dans 'Missions' puis cliquez sur 'Créer une mission'. Remplissez les informations requises (titre, description, localisation, horaires, compétences requises) et publiez votre offre.",
    },
    {
      question: "Comment gérer les candidatures ?",
      answer:
        "Dans la section 'Missions', cliquez sur une mission pour voir toutes les candidatures reçues. Vous pouvez accepter, refuser ou mettre en attente chaque candidature. Vous pouvez également communiquer directement avec les candidats via la messagerie.",
    },
    {
      question: "Comment filtrer les candidats ?",
      answer:
        "Utilisez les filtres disponibles sur la page des candidatures pour rechercher selon les compétences, l'expérience, la localisation ou d'autres critères spécifiques à votre mission.",
    },
    {
      question: "Comment fonctionne le paiement ?",
      answer:
        "Le paiement se fait via notre système sécurisé intégré. Une fois qu'un freelance est accepté pour une mission, vous pouvez gérer le paiement directement depuis la plateforme. Les fonds sont sécurisés jusqu'à la fin de la mission.",
    },
  ];

  const freelanceQuestions = [
    {
      question: "Comment postuler à une mission ?",
      answer:
        "Parcourez les missions disponibles sur la page d'accueil ou dans la section 'Missions'. Cliquez sur une mission qui vous intéresse, puis cliquez sur 'Postuler'. Remplissez votre candidature et envoyez-la. Le recruteur recevra une notification.",
    },
    {
      question: "Comment créer mon profil freelance ?",
      answer:
        "Allez dans 'Profil' puis complétez votre profil avec vos compétences, expériences, formations et disponibilités. Un profil complet augmente vos chances d'être sélectionné pour des missions.",
    },
    {
      question: "Comment suivre mes candidatures ?",
      answer:
        "Dans la section 'Missions', vous pouvez voir toutes vos candidatures et leur statut (en attente, acceptée, refusée). Vous recevrez également des notifications lorsque votre statut change.",
    },
    {
      question: "Comment recevoir mes paiements ?",
      answer:
        "Une fois une mission terminée et validée par le recruteur, les paiements sont traités automatiquement. Vous pouvez configurer vos informations de paiement dans les paramètres de votre compte.",
    },
  ];

  const technicalQuestions = [
    {
      question: "J'ai oublié mon mot de passe, que faire ?",
      answer:
        "Sur la page de connexion, cliquez sur 'Mot de passe oublié'. Entrez votre adresse email et vous recevrez un lien pour réinitialiser votre mot de passe.",
    },
    {
      question: "Comment modifier mes informations personnelles ?",
      answer:
        "Allez dans 'Profil' puis cliquez sur 'Modifier'. Vous pouvez mettre à jour toutes vos informations personnelles, votre photo de profil et vos préférences.",
    },
    {
      question: "Comment supprimer mon compte ?",
      answer:
        "Pour supprimer votre compte, contactez notre support à support@shiftly.pro. Nous traiterons votre demande dans les plus brefs délais.",
    },
    {
      question: "La plateforme est-elle sécurisée ?",
      answer:
        "Oui, Shiftly utilise les dernières technologies de sécurité pour protéger vos données personnelles et vos paiements. Toutes les transactions sont cryptées et sécurisées.",
    },
  ];

  const { isMobile } = useResponsive();
  return (
    <AppLayout>
      <ScrollView flex={1}>
        <YStack
          maxWidth={1200}
          width="100%"
          alignSelf="center"
          padding={isMobile ? "$4" : "$6"}
          gap="$6"
        >
          <PageHeader
            title="Questions fréquentes (FAQ)"
            description="Trouvez rapidement les réponses à vos questions"
          />

          <YStack gap="$6">
            <FAQSection title="Questions générales" items={generalQuestions} />
            <FAQSection title="Pour les recruteurs" items={recruiterQuestions} />
            <FAQSection title="Pour les freelances" items={freelanceQuestions} />
            <FAQSection title="Questions techniques" items={technicalQuestions} />

            {/* Section contact */}
            <YStack
              padding="$6"
              backgroundColor={colors.shiftlyVioletLight}
              borderRadius="$4"
              gap="$3"
            >
              <Text fontSize={18} fontWeight="600" color={colors.gray900}>
                Vous ne trouvez pas la réponse à votre question ?
              </Text>
              <Text fontSize={14} color={colors.gray700} lineHeight={22}>
                Contactez notre équipe de support à{" "}
                <Text
                  fontSize={14}
                  color={colors.shiftlyViolet}
                  fontWeight="600"
                  cursor="pointer"
                  hoverStyle={{ textDecorationLine: "underline" }}
                  onPress={() => {
                    window.location.href = "mailto:support@shiftly.pro";
                  }}
                >
                  support@shiftly.pro
                </Text>{" "}
                ou consultez notre{" "}
                <Text
                  fontSize={14}
                  color={colors.shiftlyViolet}
                  fontWeight="600"
                  cursor="pointer"
                  hoverStyle={{ textDecorationLine: "underline" }}
                  onPress={() => {
                    window.location.href = "/help";
                  }}
                >
                  centre d'aide
                </Text>
                .
              </Text>
            </YStack>
          </YStack>
        </YStack>
      </ScrollView>
    </AppLayout>
  );
}
