import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
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
    <View style={{ flex: 1 }}>
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
              <Ionicons name="trophy" size={30} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="social"
          options={{
            title: "Social",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name="people" size={30} color={color}/>
            ),
          }}
        />
        <Tabs.Screen
          name="wallet"
          options={{
            title: "Wallet",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name="wallet" size={30} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name="person" size={30} color={color} />
            ),
          }}
        />
      </Tabs>
      
      <TouchableOpacity style={styles.fab} onPress={() => {/* Your action here */}}>
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CD964', 
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 73, 
    alignSelf: 'center',
    elevation: 8, 
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1, // Ensure it appears above other elements
  },
});
