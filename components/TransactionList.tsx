import { Text, View } from 'react-native';

type Transaction = {
  id: string;
  merchant: string;
  amount: number;
  timestamp: string;
  type: 'food' | 'clothing' | 'coffee';
};

const TransactionList = ({ transactions }: { transactions: Transaction[] }) => {
  return (
    <View style={{ marginTop: 20 }}>
      <Text
        style={{
          fontSize: 16,
          marginBottom: 10,
          fontFamily: 'InriaSans-Bold',
          color: '#666666',
        }}
      >
        Today
      </Text>
      {transactions.map((transaction) => (
        <View
          key={transaction.id}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 15,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              backgroundColor: '#F0F0F0',
              borderRadius: 20,
              marginRight: 10,
            }}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: 'InriaSans-Regular',
                fontSize: 14,
                color: '#333333',
              }}
            >
              {transaction.merchant}
            </Text>
            <Text
              style={{
                fontFamily: 'InriaSans-Regular',
                fontSize: 12,
                color: '#666666',
              }}
            >
              {transaction.type}
            </Text>
          </View>
          <Text
            style={{
              fontFamily: 'InriaSans-Bold',
              fontSize: 14,
              color: '#FF4444',
            }}
          >
            -${transaction.amount.toFixed(2)}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default TransactionList;