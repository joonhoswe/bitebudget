import { Tabs } from "expo-router";
import React from "react";
import { Platform, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

const TabBarIcon = ({ name, color, title }: { name: keyof typeof Ionicons.glyphMap; color: string; title: string }) => (
  <React.Fragment>
    <Ionicons name={name} size={30} color={color} />
    <Text numberOfLines={1} style={{ color, fontSize: 9, marginTop: 2 }}>{title}</Text>
  </React.Fragment>
);

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#4CD964", // Color when selected
        tabBarInactiveTintColor: "#666666", // Color when not selected
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarShowLabel: false,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
            paddingTop: 10,
            height: 90,
          },
          default: {
            paddingTop: 10,
          },
        }),
      }}
    >
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Leaderboard",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="trophy" color={color} title="Ranks" />
          ),
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: "Social",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="people" color={color} title="Social" />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="wallet" color={color} title="Wallet" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="person" color={color} title="Profile" />
          ),
        }}
      />
    </Tabs>
  );
}
