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
import Transaction from '../components/transaction';
import { supabase } from "@/utils/supabase";

type Post = {
  id: number;
  restaurant: string;
  amount: number;
  userID: string;
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

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select(`
            id,
            restaurant,
            amount,
            userID,
            created_at,
            likes,
            comments
          `)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Error fetching posts:', error);
          return;
        }

        if (!data) {
          setPosts([]);
          return;
        }

        const formattedPosts: Post[] = data.map(post => ({
          id: post.id,
          restaurant: post.restaurant,
          amount: post.amount,
          userID: post.userID,
          timestamp: new Date(post.created_at).toLocaleString(),
          likes: post.likes ?? 0,
          comments: post.comments ?? 0,
          isLiked: false
        }));

        setPosts(formattedPosts);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchPosts();

    const subscription = supabase
      .channel('transactions_channel')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'transactions' },
        (payload) => {
          const newTransaction = payload.new;
          setPosts(currentPosts => [{
            id: newTransaction.id,
            restaurant: newTransaction.restaurant,
            amount: newTransaction.amount,
            userID: newTransaction.userID,
            timestamp: new Date(newTransaction.created_at).toLocaleString(),
            likes: newTransaction.likes ?? 0,
            comments: newTransaction.comments ?? 0,
            isLiked: false
          }, ...currentPosts]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          restaurant: newRestaurant,
          amount: parseFloat(newAmount),
          userID: "currentUser",  // You'll want to replace this with actual user ID
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Clear inputs
      setNewRestaurant("");
      setNewAmount("");
      setNewPost("");
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const renderPost = ({ item }: { item: Post }) => (
    <Transaction
      id={item.id}
      restaurant={item.restaurant}
      amount={item.amount}
      userID={item.userID}
      timestamp={item.timestamp}
      likes={item.likes}
      comments={item.comments}
      isLiked={item.isLiked}
      onLike={handleLike}
      onComment={(id) => {
        console.log('Comment pressed for post:', id);
      }}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.newPostContainer}>
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
        />

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
          style={[styles.postButton, { 
            opacity: (newRestaurant.trim() && newAmount.trim()) ? 1 : 0.5 
          }]}
          onPress={handlePost}
          disabled={!newRestaurant.trim() || !newAmount.trim()}
        >
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  newPostContainer: {
    padding: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  input: {
    height: 100,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    marginBottom: 10,
  },
  postButton: {
    backgroundColor: "#4CD964",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  postButtonText: {
    color: "white",
    fontWeight: "bold",
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
});
