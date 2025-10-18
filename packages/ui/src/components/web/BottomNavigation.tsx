import { XStack, Button, YStack } from "tamagui";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNavigation({
  activeTab,
  onTabChange,
}: BottomNavigationProps) {
  const tabs = [
    { id: "home", icon: "🏠", label: "Accueil" },
    { id: "missions", icon: "💼", label: "Missions" },
    { id: "chat", icon: "💬", label: "Chat" },
    { id: "profile", icon: "👤", label: "Profil" },
  ];

  return (
    <XStack
      alignItems="center"
      justifyContent="space-around"
      padding="$3"
      backgroundColor="$background"
      borderTopWidth={1}
      borderTopColor="$borderColor"
    >
      {tabs.map((tab) => {
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
            backgroundColor="transparent"
            borderWidth={0}
          >
            <YStack alignItems="center" gap="$1">
              <span
                style={{
                  fontSize: "18px",
                  color: isActive ? "#f97316" : "#666",
                }}
              >
                {tab.icon}
              </span>
              <YStack
                size="$1"
                backgroundColor={isActive ? "$orange10" : "transparent"}
                borderRadius="$2"
              />
            </YStack>
          </Button>
        );
      })}
    </XStack>
  );
}
