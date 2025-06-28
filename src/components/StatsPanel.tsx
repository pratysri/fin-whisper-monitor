
import { Card } from '@/components/ui/card';
import { SentimentPost } from '@/pages/Index';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsPanelProps {
  posts: SentimentPost[];
}

export function StatsPanel({ posts }: StatsPanelProps) {
  const positiveCount = posts.filter(p => p.sentiment === 'positive').length;
  const neutralCount = posts.filter(p => p.sentiment === 'neutral').length;
  const negativeCount = posts.filter(p => p.sentiment === 'negative').length;
  const total = posts.length;

  const positivePercentage = total > 0 ? (positiveCount / total * 100).toFixed(1) : '0';
  const neutralPercentage = total > 0 ? (neutralCount / total * 100).toFixed(1) : '0';
  const negativePercentage = total > 0 ? (negativeCount / total * 100).toFixed(1) : '0';

  const stats = [
    {
      label: 'Positive',
      count: positiveCount,
      percentage: positivePercentage,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      label: 'Neutral',
      count: neutralCount,
      percentage: neutralPercentage,
      icon: Minus,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    },
    {
      label: 'Negative',
      count: negativeCount,
      percentage: negativePercentage,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className={`p-6 ${stat.bgColor} ${stat.borderColor} border-2 transition-all duration-200 hover:scale-105`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label} Sentiment</p>
                <p className="text-2xl font-bold mt-1">{stat.count}</p>
                <p className="text-sm text-gray-500">{stat.percentage}% of total</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
