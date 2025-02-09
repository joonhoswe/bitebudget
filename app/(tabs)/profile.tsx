import { Stack } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import SpendingChart from "../../components/SpendingChart";
import TransactionList from "../../components/TransactionList";
import { supabase } from "../../utils/supabase";

// Add Transaction type definition
type Transaction = {
  id: string;
  restaurant: string;
  amount: number;
  created_at: string;
  type: "coffee" | "food" | "clothing";
  userID: string;
};

const chartData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "June"],
  datasets: [
    {
      data: [50, 100, 150, 170, 120, 80],
    },
  ],
};

type TimeRange = "week" | "month" | "year";

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [isBarChart, setIsBarChart] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>("week");

  const slideAnim = useRef(new Animated.Value(0)).current;

  const handleTimeRangeChange = (newRange: TimeRange) => {
    const rangeIndex = ["week", "month", "year"].indexOf(newRange);
    Animated.spring(slideAnim, {
      toValue: rangeIndex,
      useNativeDriver: true,
      tension: 100,
      friction: 20,
    }).start();
    setTimeRange(newRange);
  };

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);
      
      if (currentUser) {
        // Fetch transactions for the current user
        const { data: userTransactions, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('userID', currentUser.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching transactions:', error);
          return;
        }

        setTransactions(userTransactions as Transaction[]);
        
        // Calculate total spent
        const total = userTransactions.reduce((sum, transaction) => 
          sum + transaction.amount, 0
        );
        setTotalSpent(total);
      }
    };
    getUser();
  }, []);

  const buttonWidth = (Dimensions.get("window").width - 40) / 3; // 40 is total horizontal padding

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#FFFFFF" }}
      edges={["top"]}
    >
      <Stack.Screen
        options={{
          headerTitle: "Profile",
          headerStyle: {
            backgroundColor: "#FFFFFF",
          },
          headerTintColor: "#4CD964",
          headerTitleStyle: {
            fontFamily: "InriaSans-Bold",
          },
        }}
      />

      <View style={{ padding: 20 }}>
        {/* Time Range Selector */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: "#F0F0F0",
            borderRadius: 25,
            padding: 4,
            marginBottom: 20,
            position: "relative",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Animated Background */}
          <Animated.View
            style={{
              position: "absolute",
              left: 4,
              top: 4,
              bottom: 4,
              width: buttonWidth - 8,
              backgroundColor: "#4CD964",
              borderRadius: 21,
              transform: [
                {
                  translateX: slideAnim.interpolate({
                    inputRange: [0, 1, 2],
                    outputRange: [0, buttonWidth, buttonWidth * 2],
                  }),
                },
              ],
            }}
          />

          {(["week", "month", "year"] as TimeRange[]).map((range) => (
            <TouchableOpacity
              key={range}
              style={{
                borderRadius: 21,
                paddingVertical: 8,
                width: buttonWidth - 8,
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={() => handleTimeRangeChange(range)}
            >
              <Text
                style={{
                  color: timeRange === range ? "white" : "#666666",
                  fontFamily: "InriaSans-Regular",
                  fontSize: 16,
                  textTransform: "capitalize",
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
              fontFamily: "InriaSans-Bold",
              color: "#333333",
            }}
          >
            ${totalSpent.toFixed(2)}
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "InriaSans-Regular",
              color: "#666666",
              marginTop: 5,
            }}
          >
            Total Spent
          </Text>
        </View>

        {/* Chart */}
        <View style={{ marginBottom: 30 }}>
          <TouchableOpacity
            onPress={() => setIsBarChart(!isBarChart)}
            style={{
              alignSelf: "flex-end",
              marginBottom: 10,
            }}
          >
            <Text
              style={{
                color: "#4CD964",
                fontFamily: "InriaSans-Regular",
                fontSize: 14,
              }}
            >
              Show {isBarChart ? "Line" : "Bar"} Chart
            </Text>
          </TouchableOpacity>
          <SpendingChart data={chartData} isBarChart={isBarChart} />
        </View>

        {/* Transactions List */}
        <TransactionList transactions={transactions} />
      </View>
    </SafeAreaView>
  );
}
