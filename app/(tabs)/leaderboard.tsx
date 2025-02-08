import { Stack } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import coinImage from "../../assets/images/coin.png";
import profileImage from "../../assets/images/profile.png";

const leaderboardData = [
  { id: "1", username: "joon**", time: "42:22:12", coins: 1921 },
  { id: "2", username: "joon**", time: "42:22:12", coins: 1921 },
  { id: "3", username: "joon**", time: "42:22:12", coins: 1921 },
  { id: "4", username: "joon**", time: "42:22:12", coins: 1921 },
  { id: "5", username: "joon**", time: "42:22:12", coins: 1921 },
];

export default function Leaderboard() {
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#FFFFFF" }}
      edges={["top"]}
    >
      <Stack.Screen
        options={{
          headerTitle: "Leaderboard",
          headerStyle: {
            backgroundColor: "#FFFFFF",
          },
          headerTintColor: "#4CD964",
          headerTitleStyle: {
            fontFamily: "InriaSans-Bold",
          },
        }}
      />

      <View style={{ padding: 20 }}>
        {/* Logo and Title */}
        <Image
          source={coinImage}
          style={{
            width: 40,
            height: 40,
            marginBottom: 10,
          }}
        />
        <Text
          style={{
            color: "#4CD964",
            fontFamily: "InriaSans-Regular",
            fontSize: 16,
          }}
        >
          bitebudget
        </Text>

        {/* Nav Bar Selector */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: "#F0F0F0",
            borderRadius: 25,
            padding: 5,
            marginVertical: 20,
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: "#4CD964",
              borderRadius: 20,
              paddingVertical: 8,
              paddingHorizontal: 20,
              flex: 1,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "white",
                fontFamily: "InriaSans-Regular",
                fontSize: 12,
              }}
            >
              Money Saved
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              alignItems: "center",
              paddingVertical: 8,
            }}
          >
            <Text
              style={{
                color: "#666666",
                fontFamily: "InriaSans-Regular",
                fontSize: 12,
              }}
            >
              Longest Streak
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              alignItems: "center",
              paddingVertical: 8,
            }}
          >
            <Text
              style={{
                color: "#666666",
                fontFamily: "InriaSans-Regular",
                fontSize: 12,
              }}
            >
              Discount Hunter
            </Text>
          </TouchableOpacity>
        </View>

        {/* Podium Section */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 30,
            height: 200,
          }}
        >
          {/* Second Place */}
          <View style={{ alignItems: "center", flex: 1 }}>
            <Image
              source={profileImage}
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                marginBottom: 10,
              }}
            />
            <View
              style={{
                backgroundColor: "#5CF4AE",
                borderTopLeftRadius: 15,
                borderTopRightRadius: 15,
                width: "80%",
                height: 120,
                alignItems: "center",
                paddingTop: 10,
              }}
            >
              <Text style={{ color: "white", fontFamily: "InriaSans-Bold" }}>
                Bob
              </Text>
              <Text style={{ color: "white", fontFamily: "InriaSans-Regular" }}>
                354
              </Text>
            </View>
          </View>

          {/* First Place */}
          <View style={{ alignItems: "center", flex: 1 }}>
            <Image
              source={profileImage}
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                marginBottom: 10,
              }}
            />
            <View
              style={{
                backgroundColor: "#3ADC91",
                borderTopLeftRadius: 15,
                borderTopRightRadius: 15,
                width: "80%",
                height: 150,
                alignItems: "center",
                paddingTop: 10,
              }}
            >
              <Text style={{ color: "white", fontFamily: "InriaSans-Bold" }}>
                Bob
              </Text>
              <Text style={{ color: "white", fontFamily: "InriaSans-Regular" }}>
                584
              </Text>
            </View>
          </View>

          {/* Third Place */}
          <View style={{ alignItems: "center", flex: 1 }}>
            <Image
              source={profileImage}
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                marginBottom: 10,
              }}
            />
            <View
              style={{
                backgroundColor: "#90DBB9",
                borderTopLeftRadius: 15,
                borderTopRightRadius: 15,
                width: "80%",
                height: 90,
                alignItems: "center",
                paddingTop: 10,
              }}
            >
              <Text style={{ color: "white", fontFamily: "InriaSans-Bold" }}>
                Bob
              </Text>
              <Text style={{ color: "white", fontFamily: "InriaSans-Regular" }}>
                187
              </Text>
            </View>
          </View>
        </View>

        {/* List Section */}
        <ScrollView>
          {leaderboardData.map((item) => (
            <View
              key={item.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#F0F0F0",
                padding: 15,
                borderRadius: 25,
                marginBottom: 10,
              }}
            >
              <Text
                style={{
                  flex: 1,
                  fontFamily: "InriaSans-Regular",
                  color: "#666666",
                }}
              >
                {item.username}
              </Text>
              <Text
                style={{
                  fontFamily: "InriaSans-Regular",
                  color: "#666666",
                  marginRight: 10,
                }}
              >
                {item.time}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={coinImage}
                  style={{
                    width: 20,
                    height: 20,
                    marginRight: 5,
                  }}
                />
                <Text
                  style={{
                    fontFamily: "InriaSans-Bold",
                    color: "#666666",
                  }}
                >
                  {item.coins}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
