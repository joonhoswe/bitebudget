import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import SpendingChart from '../../components/SpendingChart';
import TransactionList from '../../components/TransactionList';
import { supabase } from '../../utils/supabase';

const mockTransactions = [
  {
    id: '1',
    merchant: 'Starbucks',
    amount: 170.0,
    timestamp: '2024-02-20T10:00:00Z',
    type: 'coffee',
  },
  {
    id: '2',
    merchant: 'McDonalds',
    amount: 250.0,
    timestamp: '2024-02-20T12:30:00Z',
    type: 'food',
  },
  {
    id: '3',
    merchant: 'Uniqlo',
    amount: 120.0,
    timestamp: '2024-02-20T15:00:00Z',
    type: 'clothing',
  },
];

const chartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June'],
  datasets: [
    {
      data: [50, 100, 150, 170, 120, 80],
    },
  ],
};

type TimeRange = 'week' | 'month' | 'year';

export default function ProfileScreen() {
  const [/*user*/, setUser] = useState<any>(null);
  const [isBarChart, setIsBarChart] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('week');

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);
    };
    getUser();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <Stack.Screen
        options={{
          headerTitle: 'Profile',
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTintColor: '#4CD964',
          headerTitleStyle: {
            fontFamily: 'InriaSans-Bold',
          },
        }}
      />

      <View style={{ padding: 20 }}>
        {/* Time Range Selector */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: '#F0F0F0',
            borderRadius: 25,
            padding: 5,
            marginBottom: 20,
          }}
        >
          {(['week', 'month', 'year'] as TimeRange[]).map((range) => (
            <TouchableOpacity
              key={range}
              style={{
                backgroundColor: timeRange === range ? '#4CD964' : 'transparent',
                borderRadius: 20,
                paddingVertical: 8,
                paddingHorizontal: 20,
                flex: 1,
                alignItems: 'center',
              }}
              onPress={() => setTimeRange(range)}
            >
              <Text
                style={{
                  color: timeRange === range ? 'white' : '#666666',
                  fontFamily: 'InriaSans-Regular',
                  fontSize: 16,
                  textTransform: 'capitalize',
                }}
              >
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Amount Display */}
        <View style={{ marginBottom: 30 }}>
          <Text
            style={{
              fontSize: 36,
              fontFamily: 'InriaSans-Bold',
              color: '#333333',
            }}
          >
            $170.00
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontFamily: 'InriaSans-Regular',
              color: '#666666',
              marginTop: 5,
            }}
          >
            September 2023
          </Text>
        </View>

        {/* Chart */}
        <View style={{ marginBottom: 30 }}>
          <TouchableOpacity
            onPress={() => setIsBarChart(!isBarChart)}
            style={{
              alignSelf: 'flex-end',
              marginBottom: 10,
            }}
          >
            <Text
              style={{
                color: '#4CD964',
                fontFamily: 'InriaSans-Regular',
                fontSize: 14,
              }}
            >
              Show {isBarChart ? 'Line' : 'Bar'} Chart
            </Text>
          </TouchableOpacity>
          <SpendingChart data={chartData} isBarChart={isBarChart} />
        </View>

        {/* Transactions List */}
        <TransactionList transactions={mockTransactions} />
      </View>
    </View>
  );
}
