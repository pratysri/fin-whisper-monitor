
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
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20',
      borderColor: 'border-emerald-500/30',
      iconBg: 'bg-emerald-500/20'
    },
    {
      label: 'Neutral',
      count: neutralCount,
      percentage: neutralPercentage,
      icon: Minus,
      color: 'text-gray-400',
      bgColor: 'bg-gray-500/20',
      borderColor: 'border-gray-500/30',
      iconBg: 'bg-gray-500/20'
    },
    {
      label: 'Negative',
      count: negativeCount,
      percentage: negativePercentage,
      icon: TrendingDown,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/30',
      iconBg: 'bg-red-500/20'
    }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold dashboard-text-primary mb-2">Sentiment Statistics</h2>
        <p className="dashboard-text-secondary">Live sentiment breakdown from {total} posts</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={stat.label} 
              className={`p-6 dashboard-card-hover ${stat.bgColor} border ${stat.borderColor}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium dashboard-text-secondary">{stat.label} Sentiment</p>
                  <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.count}</p>
                  <p className="text-sm dashboard-text-muted mt-1">{stat.percentage}% of total</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.iconBg}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
