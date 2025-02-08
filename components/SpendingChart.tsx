import { Dimensions } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';

type InputData = {
  labels: string[];
  datasets: {
    data: number[];
  }[];
};

type SpendingChartProps = {
  data: InputData;
  isBarChart: boolean;
};

const SpendingChart = ({ data, isBarChart }: SpendingChartProps) => {
  const screenWidth = Dimensions.get('window').width - 40;

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(76, 217, 100, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
  };

  if (isBarChart) {
    return (
      <BarChart
        data={data}
        width={screenWidth}
        height={220}
        yAxisLabel="$"
        yAxisSuffix=""
        chartConfig={chartConfig}
        showBarTops={false}
        fromZero
      />
    );
  }

  return (
    <LineChart
      data={data}
      width={screenWidth}
      height={220}
      yAxisLabel="$"
      yAxisSuffix=""
      chartConfig={chartConfig}
      bezier
      fromZero
    />
  );
};

export default SpendingChart;
