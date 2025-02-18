import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import { supabase } from "@/utils/supabase";

type FriendRequest = {
  id: string;
  email: string;
};

type Friend = {
  id: string;
  email: string;
};

export default function Friends() {
  const [searchEmail, setSearchEmail] = useState("");
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchRequests();
    fetchFriends();
  }, []);

  const fetchCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setCurrentUser(data);
    }
  };

  const fetchRequests = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("requests")
        .eq("id", user.id)
        .single();

      if (profile?.requests) {
        const requestDetails: FriendRequest[] = profile.requests.map(
          (email: string) => ({
            id: email,
            email: email,
          })
        );
        setRequests(requestDetails);
      }
    }
  };

  const fetchFriends = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("friends")
          .eq("id", user.id)
          .single();

        if (profile?.friends) {
          // Get email for each friend ID
          const friendsWithEmails = await Promise.all(
            profile.friends.map(async (friendId: string) => {
              const { data } = await supabase.rpc("get_email_from_auth_users", {
                user_id: friendId,
              });
              return {
                id: friendId,
                email: data[0]?.email || "Unknown email",
              };
            })
          );
          setFriends(friendsWithEmails);
        }
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
      Alert.alert("Error fetching friends");
    }
  };

  const sendFriendRequest = async () => {
    try {
      // First get the user ID using the RPC function
      const { data: userData, error: userError } = await supabase.rpc(
        "get_user_id_by_email",
        { email: searchEmail }
      );

      if (userError || !userData || userData.length === 0) {
        Alert.alert("User not found");
        return;
      }

      const targetUserId = userData[0].id;

      // Get the target user's current requests
      const { data: targetUser } = await supabase
        .from("profiles")
        .select("requests")
        .eq("id", targetUserId)
        .single();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Add the current user's ID to the target user's requests
      const newRequests = [...(targetUser?.requests || []), user.email];

      const { data, error } = await supabase
        .from("profiles")
        .update({ requests: newRequests })
        .eq("id", targetUserId)
        .select();

      if (error) {
        Alert.alert("Error sending friend request");
        return;
      }

      Alert.alert("Friend request sent!");
      setSearchEmail("");
    } catch (error) {
      Alert.alert("Error sending friend request");
    }
  };

  const handleRequest = async (requesterEmail: string, accept: boolean) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Remove request from current user's requests
      const newRequests = requests.filter((req) => req.id !== requesterEmail);
      await supabase
        .from("profiles")
        .update({ requests: newRequests.map((req) => req.id) })
        .eq("id", user.id);

      if (accept) {
        // Get requester's ID from their email using RPC function
        const { data: userData, error: userError } = await supabase.rpc(
          "get_user_id_by_email",
          { email: requesterEmail }
        );

        if (userError || !userData || userData.length === 0) {
          Alert.alert("Error finding requester");
          return;
        }

        const requesterId = userData[0].id;

        // Add to both users' friends lists
        const { data: currentProfile } = await supabase
          .from("profiles")
          .select("friends")
          .eq("id", user.id)
          .single();

        const { data: requesterProfile } = await supabase
          .from("profiles")
          .select("friends")
          .eq("id", requesterId)
          .single();

        await supabase
          .from("profiles")
          .update({
            friends: [...(currentProfile?.friends || []), requesterId],
          })
          .eq("id", user.id);

        await supabase
          .from("profiles")
          .update({
            friends: [...(requesterProfile?.friends || []), user.id],
          })
          .eq("id", requesterId);

        fetchFriends();
      }

      setRequests(newRequests);
    } catch (error) {
      console.error("Error handling friend request:", error);
      Alert.alert("Error handling friend request");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          value={searchEmail}
          onChangeText={setSearchEmail}
          placeholder="Enter friend's email"
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.addButton} onPress={sendFriendRequest}>
          <Text style={styles.buttonText}>Add Friend</Text>
        </TouchableOpacity>
      </View>

      {requests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Friend Requests</Text>
          <FlatList
            data={requests}
            renderItem={({ item }) => (
              <View style={styles.requestItem}>
                <Text style={styles.username}>{item.email}</Text>
                <View style={styles.requestButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={() => handleRequest(item.id, true)}
                  >
                    <Text style={styles.buttonText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.declineButton]}
                    onPress={() => handleRequest(item.id, false)}
                  >
                    <Text style={styles.buttonText}>Decline</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            keyExtractor={(item) => item.id}
          />
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Friends</Text>
        <FlatList
          data={friends}
          renderItem={({ item }) => (
            <View style={styles.friendItem}>
              <Text style={styles.username}>{item.email}</Text>
            </View>
          )}
          keyExtractor={(item) => item.id}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: 'white',
  },
  searchContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: "#4CD964",
    padding: 10,
    borderRadius: 8,
    justifyContent: "center",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  requestItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'white',
  },
  friendItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'white',
  },
  username: {
    fontSize: 16,
  },
  requestButtons: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    marginLeft: 10,
  },
  acceptButton: {
    backgroundColor: "#4CD964",
  },
  declineButton: {
    backgroundColor: "#FF3B30",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});
