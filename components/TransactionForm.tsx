import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { supabase } from "@/utils/supabase";

type TransactionFormProps = {
  isVisible: boolean;
  onClose: () => void;
};

export default function TransactionForm({
  isVisible,
  onClose,
}: TransactionFormProps) {
  const [newRestaurant, setNewRestaurant] = useState("");
  const [newAmount, setNewAmount] = useState("");

  const handlePost = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.error("User not authenticated");
        return;
      }

      const { error } = await supabase.from("transactions").insert([
        {
          userID: user.id,
          restaurant: newRestaurant,
          amount: parseFloat(newAmount),
          created_at: new Date().toISOString(),
          likes: 0,
          comments: 0,
          is_liked: false,
        },
      ]);

      if (error) {
        console.error("Error creating post:", error.message);
        return;
      }

      // Clear input fields and close modal after successful post
      setNewRestaurant("");
      setNewAmount("");
      onClose();
    } catch (error) {
      console.error("Error in handlePost:", error);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContent}
        >
          <View style={styles.header}>
            <Text style={styles.headerText}>New Transaction</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

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
              { opacity: newRestaurant.trim() && newAmount.trim() ? 1 : 0.5 },
            ]}
            onPress={handlePost}
            disabled={!newRestaurant.trim() || !newAmount.trim()}
          >
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    paddingBottom: 30,
    minHeight: 250,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    fontSize: 24,
    color: "#666",
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  postButton: {
    backgroundColor: "#4CD964",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  postButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
