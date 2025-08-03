
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { SentimentPost } from '@/pages/Index';
import { Twitter, MessageCircle, TrendingUp, Newspaper } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { SOURCE_CONFIG, SENTIMENT_CONFIG } from '@/constants/dashboard';

const sourceIcons = {
  twitter: Twitter,
  reddit: MessageCircle,
  stocktwits: TrendingUp,
  news: Newspaper
};

interface PostTableProps {
  posts: SentimentPost[];
}

export function PostTable({ posts }: PostTableProps) {
  return (
    <Card className="dashboard-card">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-700 hover:bg-gray-800/50">
            <TableHead className="dashboard-text-primary">Ticker</TableHead>
            <TableHead className="dashboard-text-primary">Content</TableHead>
            <TableHead className="dashboard-text-primary">Sentiment</TableHead>
            <TableHead className="dashboard-text-primary">Source</TableHead>
            <TableHead className="dashboard-text-primary">Confidence</TableHead>
            <TableHead className="dashboard-text-primary">Time</TableHead>
            <TableHead className="dashboard-text-primary">Engagement</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => {
            const sourceInfo = SOURCE_CONFIG[post.source];
            const sentimentInfo = SENTIMENT_CONFIG[post.sentiment];
            const SourceIcon = sourceIcons[post.source];

            return (
              <TableRow key={post.id} className="border-gray-700/50 hover:bg-gray-800/60 transition-colors">
                <TableCell className="font-medium">
                  <div>
                    <span className="font-bold text-blue-400">${post.ticker}</span>
                    <p className="text-xs dashboard-text-muted">{post.company}</p>
                  </div>
                </TableCell>
                
                <TableCell className="max-w-xs">
                  <p className="text-sm dashboard-text-secondary truncate" title={post.content}>
                    {post.content}
                  </p>
                  <p className="text-xs dashboard-text-muted">@{post.author}</p>
                </TableCell>
                
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={`text-xs border-gray-700 ${sentimentInfo.color}`}
                  >
                    <span className="mr-1">{sentimentInfo.emoji}</span>
                    {sentimentInfo.label}
                  </Badge>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <div className={`p-1 rounded ${sourceInfo.bgColor}`}>
                      <SourceIcon className={`h-3 w-3 ${sourceInfo.color}`} />
                    </div>
                    <span className="text-sm dashboard-text-secondary">{sourceInfo.label}</span>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm dashboard-text-secondary">{post.confidence}%</span>
                    <div className={`w-2 h-2 rounded-full ${
                      post.confidence >= 80 ? 'bg-emerald-500' : 
                      post.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                </TableCell>
                
                <TableCell className="text-sm dashboard-text-muted">
                  {formatDistanceToNow(post.timestamp, { addSuffix: true })}
                </TableCell>
                
                <TableCell className="text-sm dashboard-text-secondary">
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
