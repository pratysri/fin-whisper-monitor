
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SentimentPost } from '@/pages/Index';
import { Twitter, MessageCircle, TrendingUp, Newspaper, Heart, MessageSquare, Repeat } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const sourceConfig = {
  twitter: { icon: Twitter, color: 'bg-blue-500' },
  reddit: { icon: MessageCircle, color: 'bg-orange-500' },
  stocktwits: { icon: TrendingUp, color: 'bg-green-500' },
  news: { icon: Newspaper, color: 'bg-purple-500' }
};

const sentimentConfig = {
  positive: { 
    label: 'Positive', 
    color: 'bg-green-100 text-green-800 border-green-200',
    emoji: '📈'
  },
  neutral: { 
    label: 'Neutral', 
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    emoji: '➡️'
  },
  negative: { 
    label: 'Negative', 
    color: 'bg-red-100 text-red-800 border-red-200',
    emoji: '📉'
  }
};

interface PostCardProps {
  post: SentimentPost;
}

export function PostCard({ post }: PostCardProps) {
  const sourceInfo = sourceConfig[post.source];
  const sentimentInfo = sentimentConfig[post.sentiment];
  const SourceIcon = sourceInfo.icon;

  return (
    <Card className="p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-gray-200 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`p-1.5 rounded-lg ${sourceInfo.color}`}>
            <SourceIcon className="h-3 w-3 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-blue-600">${post.ticker}</span>
              <Badge 
                variant="outline" 
                className={`text-xs ${sentimentInfo.color} transition-all duration-200 group-hover:scale-105`}
              >
                <span className="mr-1">{sentimentInfo.emoji}</span>
                {sentimentInfo.label}
              </Badge>
            </div>
            <p className="text-xs text-gray-500">{post.company}</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-xs text-gray-500">
            {formatDistanceToNow(post.timestamp, { addSuffix: true })}
          </p>
          <p className="text-xs text-gray-400">@{post.author}</p>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-sm text-gray-700 leading-relaxed">{post.content}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center space-x-3 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <Heart className="h-3 w-3" />
            <span>{post.engagement}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>Confidence:</span>
            <span className="font-medium">{post.confidence}%</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${
            post.confidence >= 80 ? 'bg-green-500' : 
            post.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
          }`}></div>
        </div>
      </div>
    </Card>
  );
}
