
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Twitter, MessageCircle, TrendingUp, Newspaper } from 'lucide-react';
import { Source } from '@/pages/Index';
import { SOURCE_CONFIG } from '@/constants/dashboard';

const sourceIcons = {
  twitter: Twitter,
  reddit: MessageCircle,
  stocktwits: TrendingUp,
  news: Newspaper
};

interface SourcePanelProps {
  selectedSources: Source[];
}

export function SourcePanel({ selectedSources }: SourcePanelProps) {
  return (
    <Card className="p-6 dashboard-card">
      <div className="mb-4">
        <h3 className="text-lg font-semibold dashboard-text-primary mb-2">Active Sources</h3>
        <p className="dashboard-text-secondary text-sm">Currently monitoring these platforms</p>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {selectedSources.map((source) => {
          const sourceInfo = SOURCE_CONFIG[source];
          const IconComponent = sourceIcons[source];
          
          return (
            <Badge 
              key={source}
              variant="outline" 
              className={`flex items-center space-x-2 px-3 py-2 ${sourceInfo.bgColor} ${sourceInfo.color} border-gray-600`}
            >
              <IconComponent className="h-4 w-4" />
              <span className="font-medium">{sourceInfo.label}</span>
            </Badge>
          );
        })}
      </div>
    </Card>
  );
}
