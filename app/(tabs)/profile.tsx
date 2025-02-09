import { Stack } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import SpendingChart from "../../components/SpendingChart";
import TransactionList from "../../components/TransactionList";
import { supabase } from "../../utils/supabase";
import Budget from "@/components/Budget";

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

// Add these helper functions at the top of the file, before the component
const getDateRangeData = (
  transactions: Transaction[],
  timeRange: TimeRange
) => {
  const now = new Date();
  let startDate = new Date();
  let labels: string[] = [];

  switch (timeRange) {
    case "week":
      startDate.setDate(now.getDate() - 7);
      // Create labels for last 7 days
      labels = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(now);
        date.setDate(date.getDate() - (6 - i));
        return date.toLocaleDateString("en-US", { weekday: "short" });
      });
      break;
    case "month":
      startDate.setMonth(now.getMonth() - 1);
      // Create labels for last 4 weeks
      labels = Array.from({ length: 4 }, (_, i) => `Week ${i + 1}`);
      break;
    case "year":
      startDate.setFullYear(now.getFullYear() - 1);
      // Create labels for last 12 months
      labels = Array.from({ length: 12 }, (_, i) => {
        const date = new Date(now);
        date.setMonth(now.getMonth() - (11 - i));
        return date.toLocaleDateString("en-US", { month: "short" });
      });
      break;
  }

  return { startDate, labels };
};

const processTransactionData = (
  transactions: Transaction[],
  timeRange: TimeRange
) => {
  const now = new Date();
  const { startDate, labels } = getDateRangeData(transactions, timeRange);
  const filteredTransactions = transactions.filter(
    (t) => new Date(t.created_at) >= startDate
  );

  let data: number[] = [];

  switch (timeRange) {
    case "week":
      // Group by day
      data = Array(7).fill(0);
      filteredTransactions.forEach((t) => {
        const date = new Date(t.created_at);
        const dayIndex =
          6 -
          Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        if (dayIndex >= 0 && dayIndex < 7) {
          data[dayIndex] += t.amount;
        }
      });
      break;
    case "month":
      // Group by week
      data = Array(4).fill(0);
      filteredTransactions.forEach((t) => {
        const date = new Date(t.created_at);
        const weekIndex =
          3 -
          Math.floor(
            (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 7)
          );
        if (weekIndex >= 0 && weekIndex < 4) {
          data[weekIndex] += t.amount;
        }
      });
      break;
    case "year":
      // Group by month
      data = Array(12).fill(0);
      filteredTransactions.forEach((t) => {
        const date = new Date(t.created_at);
        const monthIndex =
          11 -
          (now.getMonth() -
            date.getMonth() +
            12 * (now.getFullYear() - date.getFullYear()));
        if (monthIndex >= 0 && monthIndex < 12) {
          data[monthIndex] += t.amount;
        }
      });
      break;
  }

  return { labels, data };
};

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [isBarChart, setIsBarChart] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  const [isBudgetModalVisible, setIsBudgetModalVisible] = useState(false);
  const [budget, setBudget] = useState(0);

  const slideAnim = useRef(new Animated.Value(0)).current;

  // Remove the static chartData and make it dynamic
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: { data: number[] }[];
  }>({
    labels: [],
    datasets: [{ data: [] }],
  });

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

  // Update the useEffect to include chart data processing
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);

      if (currentUser) {
        const { data: userTransactions, error } = await supabase
          .from("transactions")
          .select(
            `
            id,
            restaurant,
            amount,
            userID,
            created_at,
            likes,
            comments
          `
          )
          .eq("userID", currentUser.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching transactions:", error);
          return;
        }

        const formattedTransactions = userTransactions.map((transaction) => ({
          id: transaction.id.toString(),
          restaurant: transaction.restaurant,
          amount: transaction.amount,
          created_at: transaction.created_at,
          type: "food" as const,
          userID: transaction.userID,
        }));

        setTransactions(formattedTransactions);

        // Calculate total spent
        const total = formattedTransactions.reduce(
          (sum, transaction) => sum + transaction.amount,
          0
        );
        setTotalSpent(total);

        // Process chart data
        const { labels, data } = processTransactionData(
          formattedTransactions,
          timeRange
        );
        setChartData({
          labels,
          datasets: [{ data }],
        });

        const { data: profile } = await supabase
          .from("profiles")
          .select("budget")
          .eq("id", currentUser.id)
          .single();

        if (profile) {
          setBudget(profile.budget || 0);
        }
      }
    };
    getUser();
  }, [timeRange]); // Add timeRange as dependency to update chart when it changes

  const buttonWidth = (Dimensions.get("window").width - 40) / 3; // 40 is total horizontal padding

  const handleBudgetUpdate = (newBudget: number) => {
    setBudget(newBudget);
  };

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

        {/* Amount Display and Budget Button */}
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.amountText}>${totalSpent.toFixed(2)}</Text>
            <Text style={styles.labelText}>Total Spent</Text>
          </View>
          <TouchableOpacity
            style={styles.budgetButton}
            onPress={() => setIsBudgetModalVisible(true)}
          >
            <Text style={styles.budgetButtonText}>Budget: ${budget}</Text>
          </TouchableOpacity>
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

      <Budget
        isVisible={isBudgetModalVisible}
        onClose={() => setIsBudgetModalVisible(false)}
        currentBudget={budget}
        onBudgetUpdate={handleBudgetUpdate}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  amountText: {
    fontSize: 36,
    fontFamily: "InriaSans-Bold",
    color: "#333333",
  },
  labelText: {
    fontSize: 14,
    fontFamily: "InriaSans-Regular",
    color: "#666666",
    marginTop: 5,
  },
  budgetButton: {
    backgroundColor: "#4CD964",
    padding: 12,
    borderRadius: 8,
  },
  budgetButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
