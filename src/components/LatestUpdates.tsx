
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SentimentPost } from '@/pages/Index';
import { Twitter, MessageCircle, TrendingUp, Newspaper, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { SOURCE_CONFIG, SENTIMENT_CONFIG } from '@/constants/dashboard';

const sourceIcons = {
  twitter: Twitter,
  reddit: MessageCircle,
  stocktwits: TrendingUp,
  news: Newspaper
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
        <div className="p-2 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-lg">
          <Clock className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold dashboard-text-primary">Latest Updates</h2>
          <p className="dashboard-text-secondary">Real-time sentiment changes</p>
        </div>
      </div>

      <Card className="p-6 dashboard-card">
        <div className="space-y-4">
          {recentPosts.map((post) => {
            const sourceInfo = SOURCE_CONFIG[post.source];
            const sentimentInfo = SENTIMENT_CONFIG[post.sentiment];
            const SourceIcon = sourceIcons[post.source];

            return (
              <div 
                key={post.id} 
                className="flex items-start space-x-4 p-4 rounded-lg bg-gray-800/60 border border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-800/80 transition-all duration-200"
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
                        className={`text-xs border-gray-700 ${sentimentInfo.color}`}
                      >
                        <span className="mr-1">{sentimentInfo.emoji}</span>
                        {sentimentInfo.label}
                      </Badge>
                    </div>
                    <div className="text-xs dashboard-text-muted">
                      {formatDistanceToNow(post.timestamp, { addSuffix: true })}
                    </div>
                  </div>
                  
                  <p className="text-sm dashboard-text-secondary mb-2 line-clamp-2">{post.content}</p>
                  
                  <div className="flex items-center justify-between text-xs dashboard-text-muted">
                    <span className="dashboard-text-muted">@{post.author}</span>
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
