import { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Transaction from '../components/transaction';

type Post = {
  id: string;
  restaurant: string;
  amount: number;
  userId: string;
  username: string;
  userAvatar: string;
  timestamp: string;
  likes: number;
  comments: number;
  isLiked: boolean;
};

const DUMMY_DATA: Post[] = [
  {
    id: "1",
    restaurant: "McDonalds",
    amount: 15.00,
    userId: "user1",
    username: "johndoe",
    userAvatar: "https://i.pravatar.cc/150?img=1",
    timestamp: "2h ago",
    likes: 42,
    comments: 5,
    isLiked: false,
  },
  {
    id: "2",
    restaurant: "Steakhouse",
    amount: 40.00,
    userId: "user2",
    username: "janedoe",
    userAvatar: "https://i.pravatar.cc/150?img=2",
    timestamp: "4h ago",
    likes: 28,
    comments: 3,
    isLiked: true,
  },
];

export default function SocialScreen() {
  const [posts, setPosts] = useState<Post[]>(DUMMY_DATA);
  const [newPost, setNewPost] = useState("");
  const [newRestaurant, setNewRestaurant] = useState("");
  const [newAmount, setNewAmount] = useState("");

  const handleLike = (postId: string) => {
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

  const handlePost = () => {
    if (!newRestaurant.trim() || !newAmount.trim()) return;

    const post: Post = {
      id: Date.now().toString(),
      restaurant: newRestaurant,
      amount: parseFloat(newAmount),
      userId: "currentUser",
      username: "me",
      userAvatar: "https://i.pravatar.cc/150?img=3",
      timestamp: "now",
      likes: 0,
      comments: 0,
      isLiked: false,
    };

    setPosts([post, ...posts]);
    setNewRestaurant("");
    setNewAmount("");
    setNewPost("");
  };

  const renderPost = ({ item }: { item: Post }) => (
    <Transaction
      id={item.id}
      restaurant={item.restaurant}
      amount={item.amount}
      userId={item.userId}
      username={item.username}
      userAvatar={item.userAvatar}
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
          keyExtractor={(item) => item.id}
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
