
import { Card } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';

interface OverallSentimentChartProps {
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

const COLORS = {
  positive: '#10b981',
  neutral: '#6b7280',
  negative: '#ef4444'
};

export function OverallSentimentChart({ sentiment }: OverallSentimentChartProps) {
  const pieData = [
    { name: 'Positive', value: sentiment.positive, color: COLORS.positive },
    { name: 'Neutral', value: sentiment.neutral, color: COLORS.neutral },
    { name: 'Negative', value: sentiment.negative, color: COLORS.negative },
  ];

  const barData = [
    { name: 'Positive', value: sentiment.positive, fill: COLORS.positive },
    { name: 'Neutral', value: sentiment.neutral, fill: COLORS.neutral },
    { name: 'Negative', value: sentiment.negative, fill: COLORS.negative },
  ];

  const chartConfig = {
    positive: { label: 'Positive', color: COLORS.positive },
    neutral: { label: 'Neutral', color: COLORS.neutral },
    negative: { label: 'Negative', color: COLORS.negative },
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-gray-800/50 to-gray-700/50 border-gray-600 backdrop-blur-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Overall Market Sentiment</h2>
        <p className="text-gray-300">Real-time sentiment analysis across all sources</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Distribution</h3>
          <ChartContainer config={chartConfig} className="h-64">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
        </div>

        {/* Bar Chart */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Breakdown</h3>
          <ChartContainer config={chartConfig} className="h-64">
            <BarChart data={barData}>
              <XAxis dataKey="name" tick={{ fill: '#d1d5db' }} />
              <YAxis tick={{ fill: '#d1d5db' }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} />
              <ChartTooltip content={<ChartTooltipContent />} />
            </BarChart>
          </ChartContainer>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-600">
        <div className="text-center">
          <div className="text-3xl font-bold text-green-400">{sentiment.positive}%</div>
          <div className="text-sm text-gray-300">Positive</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-400">{sentiment.neutral}%</div>
          <div className="text-sm text-gray-300">Neutral</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-red-400">{sentiment.negative}%</div>
          <div className="text-sm text-gray-300">Negative</div>
        </div>
      </div>
    </Card>
  );
}
