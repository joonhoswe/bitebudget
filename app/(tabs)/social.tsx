import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Transaction from "../components/transaction";
import { supabase } from "@/utils/supabase";
import Friends from "../../components/Friends";

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
  const [newPost, setNewPost] = useState("");
  const [newRestaurant, setNewRestaurant] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [activeTab, setActiveTab] = useState<"feed" | "friends">("feed");
  const [userId, setUserId] = useState<string | null>(null);

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

        const formattedPosts: Post[] = data.map((post) => ({
          id: post.id,
          restaurant: post.restaurant,
          amount: post.amount,
          userID: post.userID,
          timestamp: new Date(post.created_at).toLocaleString(),
          likes: post.likes ?? 0,
          comments: post.comments ?? 0,
          isLiked: false,
        }));

            return {
              id: post.id,
              restaurant: post.restaurant,
              amount: post.amount,
              userID: post.userID,
              userEmail: emailData?.[0]?.email || "Unknown User",
              timestamp: new Date(post.created_at).toLocaleString(),
              likes: post.likes ?? 0,
              comments: post.comments ?? 0,
              isLiked: false,
            };
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
        (payload) => {
          const newTransaction = payload.new;
          setPosts((currentPosts) => [
            {
              id: newTransaction.id,
              restaurant: newTransaction.restaurant,
              amount: newTransaction.amount,
              userID: newTransaction.userID,
              timestamp: new Date(newTransaction.created_at).toLocaleString(),
              likes: newTransaction.likes ?? 0,
              comments: newTransaction.comments ?? 0,
              isLiked: false,
            },
            ...currentPosts,
          ]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error getting user:', error.message);
      return;
    }
    if (user) {
      setUserId(user.id);
    }
  };
  
  const handleLike = (postId: number) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            isLiked: !post.isLiked,
          };
        }
        return post;
      })
    );
  };

  const handlePost = async () => {
    if (!newRestaurant.trim() || !newAmount.trim()) return;

    if (!newRestaurant.trim() || !newAmount.trim()) return;

    try {
      const { data, error } = await supabase
        .from("transactions")
        .insert({
          restaurant: newRestaurant,
          amount: parseFloat(newAmount),
          userID: userId,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Clear inputs
      setNewRestaurant("");
      setNewAmount("");
      setNewPost("");
    } catch (error) {
      console.error("Error creating post:", error);
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
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <View style={styles.feedContainer}>
            <FlatList
              data={posts}
              renderItem={renderPost}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 250 }}
            />
            <View style={styles.newPostContainer}>
              <TextInput
                style={styles.input}
                value={newRestaurant}
                onChangeText={setNewRestaurant}
                placeholder="Restaurant name"
              />
              <TextInput
                style={styles.input}
                value={newAmount}
                onChangeText={setNewAmount}
                placeholder="Amount spent"
                keyboardType="decimal-pad"
              />
              <TouchableOpacity
                style={[
                  styles.postButton,
                  {
                    opacity: newRestaurant.trim() && newAmount.trim() ? 1 : 0.5,
                  },
                ]}
                onPress={handlePost}
                disabled={!newRestaurant.trim() || !newAmount.trim()}
              >
                <Text style={styles.postButtonText}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
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
  feedContainer: {
    flex: 1,
    position: 'relative',
    paddingBottom: 0,
  },
  newPostContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
    paddingBottom: Platform.OS === 'ios' ? 25 : 15,a
  },
  input: {
    height: 100,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  postButton: {
    backgroundColor: "#4CD964",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 5,
  },
  postButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  postContainer: {
    backgroundColor: "white",
    padding: 15,
    marginBottom: 10,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontWeight: "bold",
    fontSize: 16,
  },
  timeAgo: {
    color: "#666",
    fontSize: 12,
  },
  content: {
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 22,
  },
  actions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  actionText: {
    marginLeft: 5,
    color: "#666",
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
    fontFamily: "InriaSans-Regular",
  },
  activeTabText: {
    color: "#4CD964",
    fontFamily: "InriaSans-Bold",
  },
});
