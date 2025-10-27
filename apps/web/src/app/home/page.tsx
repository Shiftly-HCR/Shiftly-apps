"use client";

import { YStack, XStack, Text, ScrollView } from "tamagui";
import { Navbar, Badge, Button, MissionCard, colors } from "@hestia/ui";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiMap } from "react-icons/fi";
import { getCurrentUser, signOut } from "@hestia/data";

export default function HomePage() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [activeFilters, setActiveFilters] = useState([
    "Serveur",
    "Paris",
    "Disponible demain",
    "Rémunération 18€/heure",
  ]);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser();

      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    const result = await signOut();

    if (result.success) {
      router.push("/login");
    }
  };

  const missions = [
    {
      id: 1,
      title: "Chef de rang – Hôtel de la Plage",
      establishment: "Hôtel de la Plage",
      date: "Du 21 au 24 juil, 4 jours",
      price: "23€/h",
      image:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
      isNew: true,
    },
    {
      id: 2,
      title: "Serveur – Brasserie du Centre",
      establishment: "Brasserie du Centre",
      date: "Le 20 juil, 1 jour",
      price: "20€/h",
      image:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop",
    },
    {
      id: 3,
      title: "Barman – Rooftop Le Ciel",
      establishment: "Rooftop Le Ciel",
      date: "Du 15 au 19 juil",
      price: "25€/h",
      image:
        "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=400&h=300&fit=crop",
    },
    {
      id: 4,
      title: "Plongeur – Restaurant Le Zinc",
      establishment: "Restaurant Le Zinc",
      date: "Du 22 au 28 juil, 6 jours",
      price: "18€/h",
      image:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop",
    },
    {
      id: 5,
      title: "Réceptionniste – Hôtel Le Grand",
      establishment: "Hôtel Le Grand",
      date: "Dès que possible, 2 semaines",
      price: "22€/h",
      image:
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400&h=300&fit=crop",
    },
    {
      id: 6,
      title: "Sommelier – Restaurant L'Étoile",
      establishment: "Restaurant L'Étoile",
      date: "Du lun au ven, 13 juil",
      price: "28€/h",
      image:
        "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop",
    },
  ];

  const removeFilter = (filter: string) => {
    setActiveFilters(activeFilters.filter((f) => f !== filter));
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
  };

  // Afficher un loader pendant la vérification
  if (isLoading) {
    return (
      <YStack
        flex={1}
        backgroundColor={colors.backgroundLight}
        alignItems="center"
        justifyContent="center"
      >
        <Text fontSize={16} color={colors.gray700}>
          Chargement...
        </Text>
      </YStack>
    );
  }

  return (
    <YStack flex={1} backgroundColor={colors.backgroundLight}>
      {/* Navbar */}
      <Navbar
        searchValue={searchValue}
        onSearch={setSearchValue}
        userName={
          user?.user_metadata?.first_name ||
          user?.email?.split("@")[0] ||
          "Utilisateur"
        }
        onProfileClick={() => console.log("Profile")}
        onMissionsClick={() => console.log("Missions")}
        onSubscriptionClick={() => console.log("Subscription")}
        onHelpClick={() => console.log("Help")}
        onLogoutClick={handleLogout}
      />

      {/* Contenu principal */}
      <ScrollView flex={1}>
        <YStack maxWidth={1400} width="100%" alignSelf="center" padding="$6">
          {/* Filtres actifs */}
          {activeFilters.length > 0 && (
            <XStack
              paddingVertical="$4"
              gap="$3"
              flexWrap="wrap"
              alignItems="center"
            >
              <Text fontSize={14} color={colors.gray700} fontWeight="600">
                Filtres actifs:
              </Text>

              {activeFilters.map((filter) => (
                <XStack
                  key={filter}
                  paddingHorizontal="$3"
                  paddingVertical="$1.5"
                  backgroundColor={colors.white}
                  borderRadius="$3"
                  borderWidth={1}
                  borderColor={colors.gray200}
                  gap="$2"
                  alignItems="center"
                >
                  <Text fontSize={13} color={colors.gray900} fontWeight="500">
                    {filter}
                  </Text>
                  <Text
                    fontSize={16}
                    color={colors.gray700}
                    cursor="pointer"
                    hoverStyle={{ color: "#EF4444" }}
                    onPress={() => removeFilter(filter)}
                  >
                    ✕
                  </Text>
                </XStack>
              ))}

              <Text
                fontSize={13}
                color={colors.hestiaOrange}
                fontWeight="600"
                cursor="pointer"
                textDecorationLine="underline"
                hoverStyle={{ opacity: 0.8 }}
                onPress={clearAllFilters}
              >
                Effacer tout
              </Text>

              <XStack
                marginLeft="auto"
                paddingHorizontal="$3"
                paddingVertical="$2"
                backgroundColor={colors.white}
                borderRadius="$3"
                borderWidth={1}
                borderColor={colors.gray200}
                gap="$2"
                alignItems="center"
                cursor="pointer"
                hoverStyle={{
                  borderColor: colors.hestiaOrange,
                  backgroundColor: "#FFF4E6",
                }}
              >
                <FiMap size={16} color={colors.hestiaOrange} />
                <Text fontSize={13} color={colors.gray900} fontWeight="600">
                  Carte
                </Text>
              </XStack>
            </XStack>
          )}

          {/* Grille de missions */}
          <YStack gap="$4" marginTop="$4">
            <XStack flexWrap="wrap" gap="$4" justifyContent="flex-start">
              {missions.map((mission) => (
                <YStack
                  key={mission.id}
                  width="calc(33.333% - 12px)"
                  minWidth={300}
                  position="relative"
                >
                  {mission.isNew && (
                    <YStack position="absolute" top={12} left={12} zIndex={10}>
                      <Badge variant="new" size="sm">
                        Nouveau
                      </Badge>
                    </YStack>
                  )}
                  <MissionCard
                    title={mission.title}
                    date={mission.date}
                    price={mission.price}
                    priceUnit="/ heure"
                    image={mission.image}
                  />
                </YStack>
              ))}
            </XStack>
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
