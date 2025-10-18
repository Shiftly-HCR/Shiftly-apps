import { XStack, Button, YStack } from "tamagui";
import { Home, Briefcase, MessageCircle, User } from "@tamagui/lucide-icons";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNavigation({
  activeTab,
  onTabChange,
}: BottomNavigationProps) {
  const tabs = [
    { id: "home", icon: Home, label: "Accueil" },
    { id: "missions", icon: Briefcase, label: "Missions" },
    { id: "chat", icon: MessageCircle, label: "Chat" },
    { id: "profile", icon: User, label: "Profil" },
  ];

  return (
    <XStack
      alignItems="center"
      jc="space-around"
      padding="$3"
      backgroundColor="$background"
      borderTopWidth={1}
      borderTopColor="$borderColor"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <Button
            key={tab.id}
            variant="ghost"
            size="$3"
            onPress={() => onTabChange(tab.id)}
            alignItems="center"
            justifyContent="center"
            flex={1}
            bg="transparent"
            borderWidth={0}
          >
            <YStack alignItems="center" gap="$1">
              <Icon size="$1.5" color={isActive ? "$orange10" : "$gray10"} />
              <YStack
                size="$1"
                bg={isActive ? "$orange10" : "transparent"}
                borderRadius="$2"
              />
            </YStack>
          </Button>
        );
      })}
    </XStack>
  );
}
