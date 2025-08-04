
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { IndustryData } from '@/pages/Index';
import { SENTIMENT_CONFIG } from '@/constants/dashboard';
import { useNavigate } from 'react-router-dom';

interface IndustryGridProps {
  industries: IndustryData[];
}

export function IndustryGrid({ industries }: IndustryGridProps) {
  const navigate = useNavigate();

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="h-3 w-3 text-emerald-400" />;
      case 'negative':
        return <TrendingDown className="h-3 w-3 text-red-400" />;
      default:
        return <Minus className="h-3 w-3 text-gray-400" />;
    }
  };

  const getDominantSentiment = (sentiment: { positive: number; neutral: number; negative: number }) => {
    if (sentiment.positive >= sentiment.neutral && sentiment.positive >= sentiment.negative) {
      return 'positive';
    } else if (sentiment.negative >= sentiment.neutral) {
      return 'negative';
    }
    return 'neutral';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold dashboard-text-primary">Industry Sentiment</h2>
          <p className="dashboard-text-secondary">Sentiment analysis by sector</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {industries.map((industry) => {
          const dominantSentiment = getDominantSentiment(industry.sentiment);
          const sentimentConfig = SENTIMENT_CONFIG[dominantSentiment as keyof typeof SENTIMENT_CONFIG];
          
          return (
            <Card key={industry.name} className="p-6 dashboard-card-hover">
              {/* Industry Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{industry.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold dashboard-text-primary">{industry.label}</h3>
                    <div className="flex items-center space-x-1">
                      {getSentimentIcon(dominantSentiment)}
                      <span className={`text-sm font-medium ${sentimentConfig.textColor}`}>
                        {sentimentConfig.label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sentiment Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs dashboard-text-muted mb-1">
                  <span>Sentiment Distribution</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 flex overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full" 
                    style={{ width: `${industry.sentiment.positive}%` }}
                  ></div>
                  <div 
                    className="bg-gray-500 h-full" 
                    style={{ width: `${industry.sentiment.neutral}%` }}
                  ></div>
                  <div 
                    className="bg-red-500 h-full" 
                    style={{ width: `${industry.sentiment.negative}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs dashboard-text-muted mt-1">
                  <span className="text-emerald-400">{industry.sentiment.positive}%</span>
                  <span className="text-gray-400">{industry.sentiment.neutral}%</span>
                  <span className="text-red-400">{industry.sentiment.negative}%</span>
                </div>
              </div>

              {/* Top Companies */}
              <div className="space-y-2 mb-4">
                <h4 className="text-sm font-medium dashboard-text-secondary">Top Companies</h4>
                <div className="space-y-2">
                  {industry.companies.slice(0, 5).map((company) => (
                    <div 
                      key={company.ticker} 
                      className="flex items-center justify-between py-1 cursor-pointer hover:bg-gray-800/50 px-2 -mx-2 rounded transition-colors"
                      onClick={() => navigate(`/company/${company.ticker}`)}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-blue-400 hover:text-blue-300">${company.ticker}</span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs px-2 py-0 border-gray-700 ${
                            company.sentiment === 'positive' ? 'text-emerald-400' :
                            company.sentiment === 'negative' ? 'text-red-400' : 'text-gray-400'
                          }`}
                        >
                          {getSentimentIcon(company.sentiment)}
                        </Badge>
                      </div>
                      <div className="text-xs dashboard-text-muted">
                        ${company.price.toFixed(2)}
                        <span className={company.change >= 0 ? 'text-emerald-400 ml-1' : 'text-red-400 ml-1'}>
                          {company.change >= 0 ? '+' : ''}{company.change.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* View More Button */}
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-blue-400 border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-400 hover:text-blue-300 transition-all"
                onClick={() => navigate(`/industry/${industry.name}`)}
              >
                View All Companies
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
