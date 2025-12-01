"use client";

import {
  YStack,
  XStack,
  H2,
  H3,
  Paragraph,
  ScrollView,
  Separator,
} from "tamagui";
import {
  Button,
  Badge,
  Avatar,
  Header,
  ChatBubble,
  FormField,
  Stack,
  Input,
  RadioGroup,
  Select,
  Checkbox,
  FileUpload,
  DatePicker,
  BaseCard,
  MissionCard,
  FreelanceCard,
  StatCard,
  MissionDetailCard,
  useShiftlyToast,
  colors,
} from "@shiftly/ui";
import { SearchBar } from "@shiftly/ui/components/web/SearchBar";
import { BottomNavigation } from "@shiftly/ui/components/web/BottomNavigation";
import { ProfileCard } from "@shiftly/ui/components/web/ProfileCard";

export default function PlaygroundPage() {
  const toast = useShiftlyToast();

  return (
    <YStack flex={1} backgroundColor="$background">
      <Header
        title="Shiftly UI Playground"
        showAvatar={true}
        avatarUrl="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
      />

      <ScrollView flex={1} padding="$4">
        <YStack gap="$6">
          {/* Buttons Section */}
          <YStack gap="$3">
            <H2>Boutons</H2>
            <XStack gap="$3" flexWrap="wrap">
              <Button variant="primary">Bouton Principal</Button>
              <Button variant="secondary">Bouton Secondaire</Button>
              <Button variant="ghost">Bouton Ghost</Button>
            </XStack>
          </YStack>

          <Separator />

          {/* Badges Section */}
          <YStack gap="$3">
            <H2>Badges</H2>

            <YStack gap="$2">
              <H3>Variants de statut</H3>
              <XStack gap="$2" flexWrap="wrap">
                <Badge variant="default">Par défaut</Badge>
                <Badge variant="success">Succès</Badge>
                <Badge variant="warning">Avertissement</Badge>
                <Badge variant="error">Erreur</Badge>
                <Badge variant="info">Information</Badge>
              </XStack>
            </YStack>

            <YStack gap="$2">
              <H3>Variants de mission</H3>
              <XStack gap="$2" flexWrap="wrap">
                <Badge variant="inProgress">En cours</Badge>
                <Badge variant="completed">Terminé</Badge>
                <Badge variant="cancelled">Annulé</Badge>
                <Badge variant="new">Nouvelle mission</Badge>
                <Badge variant="urgent">Urgent</Badge>
              </XStack>
            </YStack>

            <YStack gap="$2">
              <H3>Variants spéciaux</H3>
              <XStack gap="$2" flexWrap="wrap">
                <Badge variant="premium">Premium</Badge>
                <Badge variant="certified">Certifié</Badge>
              </XStack>
            </YStack>

            <YStack gap="$2">
              <H3>Tailles</H3>
              <XStack gap="$2" flexWrap="wrap" alignItems="center">
                <Badge variant="inProgress" size="sm">
                  Petit
                </Badge>
                <Badge variant="inProgress" size="md">
                  Moyen
                </Badge>
                <Badge variant="inProgress" size="lg">
                  Grand
                </Badge>
              </XStack>
            </YStack>

            <YStack gap="$2">
              <H3>Exemples d'usage</H3>
              <XStack gap="$2" flexWrap="wrap">
                <Badge>26€/h</Badge>
                <Badge variant="inProgress">En mission</Badge>
                <Badge variant="premium" size="sm">
                  Premium
                </Badge>
                <Badge variant="new" size="sm">
                  Nouveau
                </Badge>
              </XStack>
            </YStack>
          </YStack>

          <Separator />
          {/* Input Section */}
          <YStack gap="$3">
            <H2>Champs de saisie</H2>
            <YStack gap="$4" maxWidth={600}>
              {/* Input simple avec label */}
              <Input label="Titre attendu" placeholder="Du lac du Der" />

              {/* Input requis */}
              <Input label="Ville" placeholder="Paris" required />

              {/* Input avec texte d'aide */}
              <Input
                label="Parcours diplômant"
                placeholder="Ex: Formation sous-officier"
                helperText="Indiquez le parcours ou formation diplômante"
              />

              {/* TextArea multiligne */}
              <Input
                label="Description"
                placeholder="Décrivez votre mission..."
                multiline
              />

              {/* Input avec erreur */}
              <Input
                label="Email"
                placeholder="exemple@email.com"
                error="Format d'email invalide"
                required
              />

              {/* Input désactivé */}
              <Input
                label="Champ désactivé"
                placeholder="Non modifiable"
                disabled
              />

              {/* RadioGroup */}
              <RadioGroup
                label="Uniforme"
                options={[
                  { label: "Oui", value: "yes" },
                  { label: "Non", value: "no" },
                ]}
                required
              />

              {/* RadioGroup vertical */}
              <RadioGroup
                label="Niveau requis"
                options={[
                  { label: "Débutant", value: "beginner" },
                  { label: "Intermédiaire", value: "intermediate" },
                  { label: "Avancé", value: "advanced" },
                ]}
                orientation="vertical"
              />

              {/* Select */}
              <Select
                label="Ville"
                placeholder="Sélectionnez une ville"
                options={[
                  { label: "Paris", value: "paris" },
                  { label: "Lyon", value: "lyon" },
                  { label: "Marseille", value: "marseille" },
                  { label: "Toulouse", value: "toulouse" },
                ]}
                required
              />

              {/* Checkbox */}
              <Checkbox label="J'accepte les conditions générales d'utilisation" />

              {/* DatePicker */}
              <DatePicker
                label="Date de début"
                required
                helperText="Sélectionnez la date de début de la mission"
              />

              {/* FileUpload */}
              <FileUpload
                label="Documents à fournir"
                accept="image/*,.pdf"
                multiple
                helperText="Carte d'identité et Carte Vitale"
                required
              />
            </YStack>
          </YStack>

          <Separator />

          {/* Cards Section */}
          <YStack gap="$3">
            <H2>Cartes</H2>

            {/* StatCards */}
            <YStack gap="$2">
              <H3>Cartes de statistiques</H3>
              <XStack gap="$3" flexWrap="wrap">
                <StatCard label="Missions actives" value="2" color="$primary" />
                <StatCard
                  label="Candidatures en attente"
                  value="15"
                  color="$gold"
                />
                <StatCard
                  label="Taux de réussite"
                  value="80%"
                  color="#4CAF50"
                  trend="up"
                  trendValue="12%"
                />
              </XStack>
            </YStack>

            {/* MissionCards */}
            <YStack gap="$2">
              <H3>Cartes de missions</H3>
              <XStack gap="$3" flexWrap="wrap">
                <MissionCard
                  title="Serveur(se) pour soirée événementielle"
                  date="18 Juillet 2024"
                  time="18:00 - 00:30"
                  price="25€"
                  priceUnit="/ heure"
                  image="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop"
                  isPremium
                />
                <MissionCard
                  title="Chef de rang - Hôtel Le Gourmet"
                  date="20 Juillet 2024"
                  time="12:00 - 22:00"
                  price="24€"
                  priceUnit="/ heure"
                  image="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop"
                />
              </XStack>
            </YStack>

            {/* FreelanceCards */}
            <YStack gap="$2">
              <H3>Cartes de freelances</H3>
              <XStack gap="$3" flexWrap="wrap">
                <FreelanceCard
                  name="Léa Martin"
                  subtitle="Serveuse expérimentée"
                  avatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
                  rating={4.8}
                  isOnline
                  tags={["Contacter", "Service client", "Anglais"]}
                  onViewProfile={() => console.log("View profile")}
                />
                <FreelanceCard
                  name="Jean Dupont"
                  subtitle="Chef de rang professionnel"
                  avatar="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
                  rating={4.9}
                  tags={["Restauration", "Hôtellerie"]}
                  onViewProfile={() => console.log("View profile")}
                />
              </XStack>
            </YStack>

            {/* BaseCard */}
            <YStack gap="$2">
              <H3>Carte de base</H3>
              <BaseCard elevated>
                <YStack gap="$2">
                  <Paragraph fontSize={18} fontWeight="600">
                    Contenu personnalisé
                  </Paragraph>
                  <Paragraph>
                    Utilisez BaseCard pour créer vos propres designs de cartes
                    avec le style Shiftly.
                  </Paragraph>
                </YStack>
              </BaseCard>
            </YStack>
          </YStack>

          <Separator />

          {/* Toast Section */}
          <YStack gap="$3">
            <H2>Toasts (Notifications)</H2>

            <YStack gap="$2">
              <H3>Types de notifications</H3>
              <XStack gap="$3" flexWrap="wrap">
                <XStack
                  paddingHorizontal="$4"
                  paddingVertical="$2.5"
                  backgroundColor="#22C55E"
                  borderRadius="$3"
                  cursor="pointer"
                  hoverStyle={{ opacity: 0.85 }}
                  pressStyle={{ scale: 0.97 }}
                  onPress={() =>
                    toast.success("Mission acceptée", {
                      description: "La mission a été ajoutée à votre planning",
                    })
                  }
                >
                  <Paragraph color="white" fontWeight="600" fontSize={14}>
                    Toast Succès
                  </Paragraph>
                </XStack>
                <XStack
                  paddingHorizontal="$4"
                  paddingVertical="$2.5"
                  backgroundColor="#EF4444"
                  borderRadius="$3"
                  cursor="pointer"
                  hoverStyle={{ opacity: 0.85 }}
                  pressStyle={{ scale: 0.97 }}
                  onPress={() =>
                    toast.error("Erreur de connexion", {
                      description: "Impossible de se connecter au serveur",
                    })
                  }
                >
                  <Paragraph color="white" fontWeight="600" fontSize={14}>
                    Toast Erreur
                  </Paragraph>
                </XStack>
                <XStack
                  paddingHorizontal="$4"
                  paddingVertical="$2.5"
                  backgroundColor="#F3F3F3"
                  borderColor="#E5E5E5"
                  borderWidth={1}
                  borderRadius="$3"
                  cursor="pointer"
                  hoverStyle={{ backgroundColor: "#EAEAEA" }}
                  pressStyle={{ scale: 0.97 }}
                  onPress={() =>
                    toast.info("Nouvelle fonctionnalité", {
                      description: "Découvrez le nouveau système de badges",
                    })
                  }
                >
                  <Paragraph color="#2B2B2B" fontWeight="600" fontSize={14}>
                    Toast Info
                  </Paragraph>
                </XStack>
              </XStack>
            </YStack>

            <YStack gap="$2">
              <H3>Notifications personnalisées</H3>
              <XStack gap="$3" flexWrap="wrap">
                <XStack
                  paddingHorizontal="$4"
                  paddingVertical="$2.5"
                  backgroundColor={colors.shiftlyViolet}
                  borderRadius="$3"
                  cursor="pointer"
                  hoverStyle={{ opacity: 0.85 }}
                  pressStyle={{ scale: 0.97 }}
                  onPress={() =>
                    toast.show("Notification simple", {
                      duration: 3000,
                    })
                  }
                >
                  <Paragraph color="white" fontWeight="600" fontSize={14}>
                    Toast Simple (3s)
                  </Paragraph>
                </XStack>
                <XStack
                  paddingHorizontal="$4"
                  paddingVertical="$2.5"
                  backgroundColor="#FFE5D9"
                  borderColor={colors.shiftlyViolet}
                  borderWidth={1}
                  borderRadius="$3"
                  cursor="pointer"
                  hoverStyle={{ backgroundColor: "#FFD5C2" }}
                  pressStyle={{ scale: 0.97 }}
                  onPress={() =>
                    toast.success("Profil mis à jour", {
                      duration: 5000,
                      description:
                        "Vos modifications ont été enregistrées avec succès",
                    })
                  }
                >
                  <Paragraph color={colors.shiftlyViolet} fontWeight="600" fontSize={14}>
                    Toast Long (5s)
                  </Paragraph>
                </XStack>
              </XStack>
            </YStack>

            <YStack gap="$2">
              <H3>Cas d'usage réels</H3>
              <XStack gap="$3" flexWrap="wrap">
                <XStack
                  paddingHorizontal="$4"
                  paddingVertical="$2.5"
                  backgroundColor="#2B2B2B"
                  borderRadius="$3"
                  cursor="pointer"
                  alignItems="center"
                  gap="$2"
                  hoverStyle={{ opacity: 0.85 }}
                  pressStyle={{ scale: 0.97 }}
                  onPress={() =>
                    toast.success("Candidature envoyée", {
                      description: "Le client examinera votre profil sous 24h",
                    })
                  }
                >
                  <Paragraph fontSize={16}>📝</Paragraph>
                  <Paragraph color="white" fontWeight="600" fontSize={14}>
                    Candidature
                  </Paragraph>
                </XStack>
                <XStack
                  paddingHorizontal="$4"
                  paddingVertical="$2.5"
                  backgroundColor="#FFE5D9"
                  borderColor={colors.shiftlyViolet}
                  borderWidth={1}
                  borderRadius="$3"
                  cursor="pointer"
                  alignItems="center"
                  gap="$2"
                  hoverStyle={{ backgroundColor: "#FFD5C2" }}
                  pressStyle={{ scale: 0.97 }}
                  onPress={() =>
                    toast.info("Nouveau message", {
                      description: "Jean Dupont vous a envoyé un message",
                    })
                  }
                >
                  <Paragraph fontSize={16}>💬</Paragraph>
                  <Paragraph color={colors.shiftlyViolet} fontWeight="600" fontSize={14}>
                    Message
                  </Paragraph>
                </XStack>
                <XStack
                  paddingHorizontal="$4"
                  paddingVertical="$2.5"
                  backgroundColor="#F3F3F3"
                  borderColor="#E5E5E5"
                  borderWidth={1}
                  borderRadius="$3"
                  cursor="pointer"
                  alignItems="center"
                  gap="$2"
                  hoverStyle={{ backgroundColor: "#EAEAEA" }}
                  pressStyle={{ scale: 0.97 }}
                  onPress={() =>
                    toast.error("Paiement refusé", {
                      description:
                        "Veuillez vérifier vos informations bancaires",
                    })
                  }
                >
                  <Paragraph fontSize={16}>💳</Paragraph>
                  <Paragraph color="#2B2B2B" fontWeight="600" fontSize={14}>
                    Paiement
                  </Paragraph>
                </XStack>
              </XStack>
            </YStack>
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
