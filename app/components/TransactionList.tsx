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
  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionHeader}>
        <View>
          <Text style={styles.merchant}>{item.restaurant}</Text>
          <Text style={styles.type}>{item.type}</Text>
        </View>
        <Text style={styles.amount}>-${item.amount.toFixed(2)}</Text>
      </View>
      <Text style={styles.timestamp}>
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </View>
  );

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
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  merchant: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'InriaSans-Bold',
    color: '#333333',
  },
  type: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'InriaSans-Regular',
    marginTop: 2,
  },
  amount: {
    fontSize: 16,
    color: '#FF4444',
    fontFamily: 'InriaSans-Bold',
  },
  timestamp: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'InriaSans-Regular',
  },
});

export default TransactionList; 