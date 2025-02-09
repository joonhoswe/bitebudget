import { Stack, useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

import logoImage from "@/assets/images/logo.png";

export default function Index() {
  const router = useRouter();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#FFFFFF",
        padding: 20,
        justifyContent: "center",
      }}
    >
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <Image
        source={logoImage}
        style={{
          width: 270,
          height: 270,
          alignSelf: "center",
          marginBottom: 30,
          resizeMode: "contain",
        }}
      />

      <TouchableOpacity
        style={{
          backgroundColor: "#4CD964",
          padding: 15,
          borderRadius: 25,
          alignItems: "center",
          marginBottom: 20,
        }}
        onPress={() => router.push("./auth/login")}
      >
        <Text
          style={{
            color: "white",
            fontSize: 16,
            fontFamily: "InriaSans-Bold",
          }}
        >
          login
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: "#4CD964",
          padding: 15,
          borderRadius: 25,
          alignItems: "center",
          marginBottom: 20,
        }}
        onPress={() => router.push("/auth/signup")}
      >
        <Text
          style={{
            color: "white",
            fontSize: 16,
            fontFamily: "InriaSans-Bold",
          }}
        >
          sign up
        </Text>
      </TouchableOpacity>
    </View>
  );
}
