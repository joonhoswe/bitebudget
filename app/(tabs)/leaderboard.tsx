import { Stack } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";

import coinImage from "../../assets/images/coin.png";
import profileImage from "../../assets/images/profile.png";

type FriendData = {
  id: string;
  email: string;
  totalAmount: number;
};

export default function Leaderboard() {
  const [friends, setFriends] = useState<FriendData[]>([]);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's friends list from profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("friends")
        .eq("id", user.id)
        .single();

      if (profile?.friends) {
        // Get email and total transactions for each friend
        const friendsWithData = await Promise.all(
          profile.friends.map(async (friendId: string) => {
            // Get email
            const { data: emailData } = await supabase.rpc(
              "get_email_from_auth_users",
              {
                user_id: friendId,
              }
            );

            // Get total transactions
            const { data: transactionData } = await supabase
              .from("transactions")
              .select("amount")
              .eq("userID", friendId);

            // Calculate total amount
            const totalAmount = transactionData
              ? transactionData.reduce(
                  (sum, transaction) => sum + (transaction.amount || 0),
                  0
                )
              : 0;

            return {
              id: friendId,
              email: emailData[0]?.email || "Unknown email",
              totalAmount: totalAmount,
            };
          })
        );

        // Sort friends by total amount in ascending order (least to most)
        const sortedFriends = friendsWithData.sort(
          (a, b) => a.totalAmount - b.totalAmount
        );
        setFriends(sortedFriends);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

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
              money saved
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
              longest streak
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
              discount hunter
            </Text>
          </TouchableOpacity>
        </View>

        {/* List Section */}
        <ScrollView>
          {friends.map((friend) => (
            <View
              key={friend.id}
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
                {friend.email}
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
                  ${friend.totalAmount.toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
