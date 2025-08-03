
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Source, Sentiment } from '@/pages/Index';
import { Twitter, MessageCircle, TrendingUp, Newspaper } from 'lucide-react';
import { SOURCE_CONFIG, SENTIMENT_CONFIG } from '@/constants/dashboard';

const sourceIcons = {
  twitter: Twitter,
  reddit: MessageCircle,
  stocktwits: TrendingUp,
  news: Newspaper
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
    <Card className="p-4 dashboard-card border-gray-700">
      <div className="space-y-4">
        {/* Sources Filter */}
        <div>
          <h3 className="text-sm font-medium dashboard-text-primary mb-2">Sources</h3>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(SOURCE_CONFIG) as Source[]).map((source) => {
              const config = SOURCE_CONFIG[source];
              const Icon = sourceIcons[source];
              const isSelected = selectedSources.includes(source);
              
              return (
                <Button
                  key={source}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSource(source)}
                  className={`transition-all duration-200 ${
                    isSelected 
                      ? `${config.bgColor} ${config.color} border-gray-600 hover:opacity-80` 
                      : 'bg-gray-700/50 border-gray-600 dashboard-text-secondary hover:bg-gray-600/50 hover:text-white'
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
          <h3 className="text-sm font-medium dashboard-text-primary mb-2">Sentiment</h3>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(SENTIMENT_CONFIG) as Sentiment[]).map((sentiment) => {
              const config = SENTIMENT_CONFIG[sentiment];
              const isSelected = selectedSentiments.includes(sentiment);
              
              return (
                <Button
                  key={sentiment}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSentiment(sentiment)}
                  className={`transition-all duration-200 ${
                    isSelected 
                      ? `${config.bgColor} ${config.textColor} border-gray-600 hover:opacity-80` 
                      : 'bg-gray-700/50 border-gray-600 dashboard-text-secondary hover:bg-gray-600/50 hover:text-white'
                  }`}
                >
                  <span className="mr-1">{config.emoji}</span>
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
