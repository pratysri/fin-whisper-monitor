
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { SentimentPost } from '@/pages/Index';
import { Twitter, MessageCircle, TrendingUp, Newspaper } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const sourceConfig = {
  twitter: { icon: Twitter, label: 'Twitter', color: 'text-blue-600' },
  reddit: { icon: MessageCircle, label: 'Reddit', color: 'text-orange-600' },
  stocktwits: { icon: TrendingUp, label: 'StockTwits', color: 'text-green-600' },
  news: { icon: Newspaper, label: 'News', color: 'text-purple-600' }
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

interface PostTableProps {
  posts: SentimentPost[];
}

export function PostTable({ posts }: PostTableProps) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ticker</TableHead>
            <TableHead>Content</TableHead>
            <TableHead>Sentiment</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Confidence</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Engagement</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => {
            const sourceInfo = sourceConfig[post.source];
            const sentimentInfo = sentimentConfig[post.sentiment];
            const SourceIcon = sourceInfo.icon;

            return (
              <TableRow key={post.id} className="hover:bg-gray-50/80 transition-colors">
                <TableCell className="font-medium">
                  <div>
                    <span className="font-bold text-blue-600">${post.ticker}</span>
                    <p className="text-xs text-gray-500">{post.company}</p>
                  </div>
                </TableCell>
                
                <TableCell className="max-w-xs">
                  <p className="text-sm text-gray-700 truncate" title={post.content}>
                    {post.content}
                  </p>
                  <p className="text-xs text-gray-400">@{post.author}</p>
                </TableCell>
                
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${sentimentInfo.color}`}
                  >
                    <span className="mr-1">{sentimentInfo.emoji}</span>
                    {sentimentInfo.label}
                  </Badge>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <SourceIcon className={`h-4 w-4 ${sourceInfo.color}`} />
                    <span className="text-sm">{sourceInfo.label}</span>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{post.confidence}%</span>
                    <div className={`w-2 h-2 rounded-full ${
                      post.confidence >= 80 ? 'bg-green-500' : 
                      post.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                </TableCell>
                
                <TableCell className="text-sm text-gray-500">
                  {formatDistanceToNow(post.timestamp, { addSuffix: true })}
                </TableCell>
                
                <TableCell className="text-sm">
                  {post.engagement}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
