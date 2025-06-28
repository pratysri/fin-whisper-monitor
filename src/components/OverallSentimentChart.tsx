
import { Card } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { SENTIMENT_COLORS } from '@/constants/dashboard';

interface OverallSentimentChartProps {
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export function OverallSentimentChart({ sentiment }: OverallSentimentChartProps) {
  const pieData = [
    { name: 'Positive', value: sentiment.positive, color: SENTIMENT_COLORS.positive },
    { name: 'Neutral', value: sentiment.neutral, color: SENTIMENT_COLORS.neutral },
    { name: 'Negative', value: sentiment.negative, color: SENTIMENT_COLORS.negative },
  ];

  const chartConfig = {
    positive: { label: 'Positive', color: SENTIMENT_COLORS.positive },
    neutral: { label: 'Neutral', color: SENTIMENT_COLORS.neutral },
    negative: { label: 'Negative', color: SENTIMENT_COLORS.negative },
  };

  return (
    <Card className="p-6 dashboard-card">
      <div className="mb-6">
        <h2 className="text-2xl font-bold dashboard-text-primary mb-2">Overall Market Sentiment</h2>
        <p className="dashboard-text-secondary">Real-time sentiment analysis across all sources</p>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Pie Chart */}
        <div className="flex-1">
          <ChartContainer config={chartConfig} className="h-80">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={140}
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

        {/* Summary Stats */}
        <div className="flex-1 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="text-center p-6 dashboard-card rounded-lg">
              <div className="text-4xl font-bold text-emerald-400 mb-2">{sentiment.positive}%</div>
              <div className="dashboard-text-secondary">Positive Sentiment</div>
            </div>
            <div className="text-center p-6 dashboard-card rounded-lg">
              <div className="text-4xl font-bold text-gray-400 mb-2">{sentiment.neutral}%</div>
              <div className="dashboard-text-secondary">Neutral Sentiment</div>
            </div>
            <div className="text-center p-6 dashboard-card rounded-lg">
              <div className="text-4xl font-bold text-red-400 mb-2">{sentiment.negative}%</div>
              <div className="dashboard-text-secondary">Negative Sentiment</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
