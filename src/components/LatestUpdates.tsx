
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SentimentPost } from '@/pages/Index';
import { Twitter, MessageCircle, TrendingUp, Newspaper, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const sourceConfig = {
  twitter: { icon: Twitter, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  reddit: { icon: MessageCircle, color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
  stocktwits: { icon: TrendingUp, color: 'text-green-400', bgColor: 'bg-green-500/20' },
  news: { icon: Newspaper, color: 'text-purple-400', bgColor: 'bg-purple-500/20' }
};

const sentimentConfig = {
  positive: { 
    label: 'Positive', 
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
    emoji: '📈'
  },
  neutral: { 
    label: 'Neutral', 
    color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    emoji: '➡️'
  },
  negative: { 
    label: 'Negative', 
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    emoji: '📉'
  }
};

interface LatestUpdatesProps {
  posts: SentimentPost[];
}

export function LatestUpdates({ posts }: LatestUpdatesProps) {
  const recentPosts = posts
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg">
          <Clock className="h-5 w-5 text-green-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Latest Updates</h2>
          <p className="text-gray-300">Real-time sentiment changes</p>
        </div>
      </div>

      <Card className="p-6 bg-gradient-to-br from-gray-800/60 to-gray-700/60 border-gray-600">
        <div className="space-y-4">
          {recentPosts.map((post) => {
            const sourceInfo = sourceConfig[post.source];
            const sentimentInfo = sentimentConfig[post.sentiment];
            const SourceIcon = sourceInfo.icon;

            return (
              <div 
                key={post.id} 
                className="flex items-start space-x-4 p-4 rounded-lg bg-gray-800/40 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200"
              >
                {/* Source Icon */}
                <div className={`p-2 rounded-lg ${sourceInfo.bgColor}`}>
                  <SourceIcon className={`h-4 w-4 ${sourceInfo.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-blue-400">${post.ticker}</span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${sentimentInfo.color}`}
                      >
                        <span className="mr-1">{sentimentInfo.emoji}</span>
                        {sentimentInfo.label}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDistanceToNow(post.timestamp, { addSuffix: true })}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-300 mb-2 line-clamp-2">{post.content}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="text-gray-400">@{post.author}</span>
                    <div className="flex items-center space-x-3">
                      <span>Confidence: {post.confidence}%</span>
                      <span>Engagement: {post.engagement}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {posts.length > 8 && (
          <div className="mt-6 text-center">
            <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
              View All Updates →
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
