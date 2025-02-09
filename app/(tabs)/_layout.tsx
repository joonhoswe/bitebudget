import { Tabs, router } from "expo-router";
import React, { useState, useRef } from "react";
import { Platform, Text, StyleSheet, Animated, TouchableOpacity, View, Image, Linking, Alert, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Camera } from 'expo-camera';

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

export default function TabLayout(): JSX.Element {
  const colorScheme = useColorScheme();
  const [isOpen, setIsOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const handleCameraPress = async () => {
    // Request camera permissions when the camera button is pressed
    const { status } = await Camera.requestCameraPermissionsAsync();
    
    if (status === 'granted') {
      // Navigate to the camera screen if permission is granted
      router.push('/camera');
    } else {
      Alert.alert(
        'Permission required',
        'Please allow camera access to take photos of receipts.',
        [
          { 
            text: 'Open Settings', 
            onPress: () => Linking.openSettings() 
          },
          { 
            text: 'Cancel', 
            style: 'cancel' 
          }
        ]
      );
    }
    
    // Close the menu after handling the camera press
    toggleMenu();
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    
    const toValue = !isOpen ? 1 : 0;
    Animated.spring(animation, {
      toValue,
      useNativeDriver: true,
      friction: 5,
      tension: 40,
    }).start();
  };

  return (
    <View>
      <StatusBar barStyle="dark-content" />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#4CD964",
          tabBarInactiveTintColor: "#666666",
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
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name="person" color={color} title="Profile" />
            ),
          }}
        />
      </Tabs>

      {isOpen && (
        <Animated.View 
          style={[
            styles.menuContainer, 
            {
              opacity: animation,
              transform: [
                {
                  translateY: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [100, 0],
                  })
                }
              ]
            }
          ]}
        >
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuButton}>
              <Image 
                source={require('../../assets/images/pencil.png')} 
                style={styles.menuIcon}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleCameraPress}
          >
            <View style={styles.menuButton}>
              <Image 
                source={require('../../assets/images/camera.png')} 
                style={styles.menuIcon}
              />
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}

      <TouchableOpacity 
        style={styles.fab}
        onPress={toggleMenu}
        activeOpacity={0.8}
      >
        <Ionicons 
          name="add"
          size={30} 
          color="white" 
        />
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
    bottom: 78,
    alignSelf: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 2,
  },
  menuContainer: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 20,
    zIndex: 1,
  },
  menuItem: {
    alignItems: 'center',
  },
  menuButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
});
