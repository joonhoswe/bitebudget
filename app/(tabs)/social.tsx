import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Transaction from "../components/transaction";
import { supabase } from "@/utils/supabase";
import Friends from "../components/Friends";

type Post = {
  id: number;
  restaurant: string;
  amount: number;
  userID: string;
  userEmail: string;
  timestamp: string;
  likes: number;
  comments: number;
  isLiked: boolean;
};

export default function SocialScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<"feed" | "friends">("feed");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from("transactions")
          .select(
            `
            id,
            restaurant,
            amount,
            userID,
            created_at,
            likes,
            comments
          `
          )
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) {
          console.error("Error fetching posts:", error);
          return;
        }

        if (!data) {
          setPosts([]);
          return;
        }

        const postsWithEmails = await Promise.all(
          data.map(async (post) => {
            try {
              const { data: emailData } = await supabase.rpc(
                "get_email_from_auth_users",
                {
                  user_id: post.userID,
                }
              );
              const userEmail = emailData?.[0]?.email || "Unknown User";

              return {
                id: post.id,
                restaurant: post.restaurant,
                amount: post.amount,
                userID: post.userID,
                userEmail: userEmail,
                timestamp: new Date(post.created_at).toLocaleString(),
                likes: post.likes ?? 0,
                comments: post.comments ?? 0,
                isLiked: false,
              };
            } catch (err) {
              console.error("Error fetching email:", err);
              return {
                ...post,
                userEmail: "Unknown User",
                timestamp: new Date(post.created_at).toLocaleString(),
                likes: post.likes ?? 0,
                comments: post.comments ?? 0,
                isLiked: false,
              };
            }
          })
        );

        setPosts(postsWithEmails);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchPosts();

    const subscription = supabase
      .channel("transactions_channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "transactions" },
        async (payload) => {
          const newTransaction = payload.new;
          try {
            const { data: emailData } = await supabase.rpc(
              "get_email_from_auth_users",
              {
                user_id: newTransaction.userID,
              }
            );
            const userEmail = emailData?.[0]?.email || "Unknown User";

            setPosts((currentPosts) => [
              {
                id: newTransaction.id,
                restaurant: newTransaction.restaurant,
                amount: newTransaction.amount,
                userID: newTransaction.userID,
                userEmail: userEmail,
                timestamp: new Date(newTransaction.created_at).toLocaleString(),
                likes: newTransaction.likes ?? 0,
                comments: newTransaction.comments ?? 0,
                isLiked: false,
              },
              ...currentPosts,
            ]);
          } catch (err) {
            console.error("Error fetching email for new transaction:", err);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLike = async (postId: number) => {
    try {
      const post = posts.find((p) => p.id === postId);
      if (!post) return;

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.error("User not authenticated");
        return;
      }

      // Update likes in the transactions table
      const { error } = await supabase
        .from("transactions")
        .update({
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
        })
        .eq("id", postId)
        .eq("userID", post.userID);

      if (error) {
        console.error("Error updating likes:", error);
        return;
      }

      // Update local state
      setPosts(
        posts.map((p) =>
          p.id === postId
            ? {
                ...p,
                likes: p.isLiked ? p.likes - 1 : p.likes + 1,
                isLiked: !p.isLiked,
              }
            : p
        )
      );
    } catch (err) {
      console.error("Error in handleLike:", err);
    }
  };

  const renderPost = ({ item }: { item: Post }) => (
    <Transaction
      id={item.id}
      restaurant={item.restaurant}
      amount={item.amount}
      userID={item.userEmail}
      timestamp={item.timestamp}
      likes={item.likes}
      comments={item.comments}
      isLiked={item.isLiked}
      onLike={handleLike}
      onComment={(id) => {
        console.log("Comment pressed for post:", id);
      }}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "feed" && styles.activeTab]}
          onPress={() => setActiveTab("feed")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "feed" && styles.activeTabText,
            ]}
          >
            Feed
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "friends" && styles.activeTab]}
          onPress={() => setActiveTab("friends")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "friends" && styles.activeTabText,
            ]}
          >
            Friends
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "feed" ? (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      ) : (
        <Friends />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "white",
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#4CD964",
  },
  tabText: {
    color: "#666666",
    fontSize: 16,
  },
  activeTabText: {
    color: "#4CD964",
    fontWeight: "bold",
  },
});
