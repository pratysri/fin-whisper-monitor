
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SentimentPost } from '@/pages/Index';
import { Twitter, MessageCircle, TrendingUp, Newspaper, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { SOURCE_CONFIG, SENTIMENT_CONFIG } from '@/constants/dashboard';

const sourceIcons = {
  twitter: Twitter,
  reddit: MessageCircle,
  stocktwits: TrendingUp,
  news: Newspaper
};

interface PostCardProps {
  post: SentimentPost;
}

export function PostCard({ post }: PostCardProps) {
  const sourceInfo = SOURCE_CONFIG[post.source];
  const sentimentInfo = SENTIMENT_CONFIG[post.sentiment];
  const SourceIcon = sourceIcons[post.source];

  return (
    <Card className="p-4 dashboard-card-hover group">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`p-1.5 rounded-lg ${sourceInfo.bgColor}`}>
            <SourceIcon className={`h-3 w-3 ${sourceInfo.color}`} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-blue-400">${post.ticker}</span>
              <Badge 
                variant="outline" 
                className={`text-xs border-gray-700 ${sentimentInfo.color} transition-all duration-200 group-hover:scale-105`}
              >
                <span className="mr-1">{sentimentInfo.emoji}</span>
                {sentimentInfo.label}
              </Badge>
            </div>
            <p className="text-xs dashboard-text-muted">{post.company}</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-xs dashboard-text-muted">
            {formatDistanceToNow(post.timestamp, { addSuffix: true })}
          </p>
          <p className="text-xs dashboard-text-muted">@{post.author}</p>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-sm dashboard-text-secondary leading-relaxed">{post.content}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-700/50">
        <div className="flex items-center space-x-3 text-xs dashboard-text-muted">
          <div className="flex items-center space-x-1">
            <Heart className="h-3 w-3" />
            <span>{post.engagement}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>Confidence:</span>
            <span className="font-medium dashboard-text-secondary">{post.confidence}%</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${
            post.confidence >= 80 ? 'bg-emerald-500' : 
            post.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
          }`}></div>
        </div>
      </div>
    </Card>
  );
}
