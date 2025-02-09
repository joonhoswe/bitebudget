import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

type Transaction = {
  id: string;
  restaurant: string;
  amount: number;
  created_at: string;
  type: "coffee" | "food" | "clothing";
  userID: string;
};

interface TransactionListProps {
  transactions: Transaction[];
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  const renderTransaction = ({ item }: { item: Transaction }) => {
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(item.amount);

    return (
      <View style={styles.transactionItem}>
        <View style={styles.transactionHeader}>
          <View>
            <Text style={styles.content}>
              Spent {formattedAmount} at <Text style={styles.restaurant}>{item.restaurant}</Text>
            </Text>
            <Text style={styles.timestamp}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={transactions}
      renderItem={renderTransaction}
      keyExtractor={(item) => item.id}
      style={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  transactionItem: {
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
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  content: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'InriaSans-Regular',
  },
  restaurant: {
    fontFamily: 'InriaSans-Bold',
    color: '#333333',
  },
  timestamp: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'InriaSans-Regular',
    marginTop: 4,
  }
});

export default TransactionList; 