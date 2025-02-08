import React, { FC } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from "@expo/vector-icons";

interface TransactionProps {
    id: number;
    restaurant: string;
    amount: number;
    userID: string;
    timestamp: string;
    likes: number;
    comments: number;
    isLiked: boolean;
    onLike: (id: number) => void;
    onComment: (id: number) => void;
}

const Transaction: FC<TransactionProps> = ({
    id,
    restaurant,
    amount,
    userID,
    timestamp,
    likes,
    comments,
    isLiked,
    onLike,
    onComment
}) => {
    const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerText}>
                    <Text style={styles.username}>{userID}</Text>
                    <Text style={styles.timestamp}>{timestamp}</Text>
                </View>
            </View>

            <View style={styles.transactionDetails}>
                <Text style={styles.content}>
                    Spent {formattedAmount} at <Text style={styles.restaurant}>{restaurant}</Text>
                </Text>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => onLike(id)}
                >
                    <Ionicons
                        name={isLiked ? "heart" : "heart-outline"}
                        size={24}
                        color={isLiked ? "#ff4444" : "#666"}
                    />
                    <Text style={styles.actionText}>{likes}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => onComment(id)}
                >
                    <Ionicons name="chatbubble-outline" size={24} color="#666" />
                    <Text style={styles.actionText}>{comments}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        padding: 15,
        marginBottom: 10,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    headerText: {
        flex: 1,
    },
    username: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    timestamp: {
        color: '#666',
        fontSize: 12,
    },
    transactionDetails: {
        marginBottom: 10,
    },
    content: {
        fontSize: 16,
        lineHeight: 22,
    },
    restaurant: {
        fontWeight: 'bold',
    },
    actions: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 10,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    actionText: {
        marginLeft: 5,
        color: '#666',
    },
});

export default Transaction;