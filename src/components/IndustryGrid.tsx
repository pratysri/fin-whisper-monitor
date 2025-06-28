
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { IndustryData } from '@/pages/Index';

interface IndustryGridProps {
  industries: IndustryData[];
}

export function IndustryGrid({ industries }: IndustryGridProps) {
  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="h-3 w-3 text-green-400" />;
      case 'negative':
        return <TrendingDown className="h-3 w-3 text-red-400" />;
      default:
        return <Minus className="h-3 w-3 text-gray-400" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-400';
      case 'negative':
        return 'text-red-400';
      default:
        return 'text-gray-400';
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
          <h2 className="text-2xl font-bold text-white">Industry Sentiment</h2>
          <p className="text-gray-300">Sentiment analysis by sector</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {industries.map((industry) => {
          const dominantSentiment = getDominantSentiment(industry.sentiment);
          
          return (
            <Card key={industry.name} className="p-6 bg-gradient-to-br from-gray-800/60 to-gray-700/60 border-gray-600 hover:border-gray-500 transition-all duration-300 hover:scale-[1.02]">
              {/* Industry Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{industry.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{industry.label}</h3>
                    <div className="flex items-center space-x-1">
                      {getSentimentIcon(dominantSentiment)}
                      <span className={`text-sm font-medium ${getSentimentColor(dominantSentiment)}`}>
                        {dominantSentiment.charAt(0).toUpperCase() + dominantSentiment.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sentiment Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Sentiment Distribution</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 flex overflow-hidden">
                  <div 
                    className="bg-green-500 h-full" 
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
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span className="text-green-400">{industry.sentiment.positive}%</span>
                  <span className="text-gray-400">{industry.sentiment.neutral}%</span>
                  <span className="text-red-400">{industry.sentiment.negative}%</span>
                </div>
              </div>

              {/* Top Companies */}
              <div className="space-y-2 mb-4">
                <h4 className="text-sm font-medium text-gray-300">Top Companies</h4>
                <div className="space-y-2">
                  {industry.companies.slice(0, 5).map((company) => (
                    <div key={company.ticker} className="flex items-center justify-between py-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-blue-400">${company.ticker}</span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs px-2 py-0 border-gray-600 ${
                            company.sentiment === 'positive' ? 'text-green-400' :
                            company.sentiment === 'negative' ? 'text-red-400' : 'text-gray-400'
                          }`}
                        >
                          {getSentimentIcon(company.sentiment)}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-400">
                        ${company.price.toFixed(2)}
                        <span className={company.change >= 0 ? 'text-green-400 ml-1' : 'text-red-400 ml-1'}>
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
                className="w-full text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white"
                onClick={() => {
                  // TODO: Navigate to industry detail page
                  console.log(`Navigate to ${industry.name} industry page`);
                }}
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
