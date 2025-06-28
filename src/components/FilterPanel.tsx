
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Source, Sentiment } from '@/pages/Index';
import { Twitter, MessageCircle, TrendingUp, Newspaper } from 'lucide-react';

const sourceConfig = {
  twitter: { label: 'Twitter', icon: Twitter, color: 'bg-blue-500', hoverColor: 'hover:bg-blue-600' },
  reddit: { label: 'Reddit', icon: MessageCircle, color: 'bg-orange-500', hoverColor: 'hover:bg-orange-600' },
  stocktwits: { label: 'StockTwits', icon: TrendingUp, color: 'bg-green-500', hoverColor: 'hover:bg-green-600' },
  news: { label: 'News', icon: Newspaper, color: 'bg-purple-500', hoverColor: 'hover:bg-purple-600' }
};

const sentimentConfig = {
  positive: { label: 'Positive', color: 'bg-green-500', hoverColor: 'hover:bg-green-600' },
  neutral: { label: 'Neutral', color: 'bg-gray-500', hoverColor: 'hover:bg-gray-600' },
  negative: { label: 'Negative', color: 'bg-red-500', hoverColor: 'hover:bg-red-600' }
};

interface FilterPanelProps {
  selectedSources: Source[];
  selectedSentiments: Sentiment[];
  onSourcesChange: (sources: Source[]) => void;
  onSentimentsChange: (sentiments: Sentiment[]) => void;
}

export function FilterPanel({ 
  selectedSources, 
  selectedSentiments, 
  onSourcesChange, 
  onSentimentsChange 
}: FilterPanelProps) {
  const toggleSource = (source: Source) => {
    if (selectedSources.includes(source)) {
      onSourcesChange(selectedSources.filter(s => s !== source));
    } else {
      onSourcesChange([...selectedSources, source]);
    }
  };

  const toggleSentiment = (sentiment: Sentiment) => {
    if (selectedSentiments.includes(sentiment)) {
      onSentimentsChange(selectedSentiments.filter(s => s !== sentiment));
    } else {
      onSentimentsChange([...selectedSentiments, sentiment]);
    }
  };

  return (
    <Card className="p-4 bg-gray-800/60 backdrop-blur-sm border-gray-600">
      <div className="space-y-4">
        {/* Sources Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-2">Sources</h3>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(sourceConfig) as Source[]).map((source) => {
              const config = sourceConfig[source];
              const Icon = config.icon;
              const isSelected = selectedSources.includes(source);
              
              return (
                <Button
                  key={source}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSource(source)}
                  className={`transition-all duration-200 ${
                    isSelected 
                      ? `${config.color} ${config.hoverColor} text-white` 
                      : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50 hover:text-white'
                  }`}
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {config.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Sentiment Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-2">Sentiment</h3>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(sentimentConfig) as Sentiment[]).map((sentiment) => {
              const config = sentimentConfig[sentiment];
              const isSelected = selectedSentiments.includes(sentiment);
              
              return (
                <Button
                  key={sentiment}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSentiment(sentiment)}
                  className={`transition-all duration-200 ${
                    isSelected 
                      ? `${config.color} ${config.hoverColor} text-white` 
                      : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50 hover:text-white'
                  }`}
                >
                  {config.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}
