
import { useState, useEffect } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { FilterPanel } from '@/components/FilterPanel';
import { SentimentFeed } from '@/components/SentimentFeed';
import { ViewToggle } from '@/components/ViewToggle';
import { StatsPanel } from '@/components/StatsPanel';
import { TrendingUp, Activity, Globe } from 'lucide-react';

export type ViewMode = 'cards' | 'table';
export type Source = 'twitter' | 'reddit' | 'stocktwits' | 'news';
export type Sentiment = 'positive' | 'neutral' | 'negative';

export interface SentimentPost {
  id: string;
  ticker: string;
  company: string;
  content: string;
  sentiment: Sentiment;
  confidence: number;
  source: Source;
  timestamp: Date;
  author: string;
  engagement: number;
}

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSources, setSelectedSources] = useState<Source[]>(['twitter', 'reddit', 'stocktwits', 'news']);
  const [selectedSentiments, setSelectedSentiments] = useState<Sentiment[]>(['positive', 'neutral', 'negative']);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [posts, setPosts] = useState<SentimentPost[]>([]);

  // Mock data generator
  useEffect(() => {
    const generateMockData = (): SentimentPost[] => {
      const tickers = ['AAPL', 'TSLA', 'NVDA', 'AMZN', 'GOOGL', 'MSFT', 'BTC', 'ETH', 'SPY', 'QQQ'];
      const companies = ['Apple Inc.', 'Tesla Inc.', 'NVIDIA Corp.', 'Amazon.com', 'Alphabet Inc.', 'Microsoft Corp.', 'Bitcoin', 'Ethereum', 'SPDR S&P 500', 'Invesco QQQ'];
      const sources: Source[] = ['twitter', 'reddit', 'stocktwits', 'news'];
      const sentiments: Sentiment[] = ['positive', 'neutral', 'negative'];
      const sampleContent = {
        positive: [
          "Great earnings report! Strong fundamentals",
          "Bullish trend continuing, expecting breakout",
          "Amazing product launch, market loves it",
          "Strong institutional buying pressure",
          "Technical analysis shows bullish pattern"
        ],
        neutral: [
          "Waiting for earnings announcement",
          "Market consolidating around key levels",
          "Mixed signals from recent data",
          "Sideways movement expected short term",
          "Neutral outlook until next catalyst"
        ],
        negative: [
          "Concerns about upcoming regulation",
          "Bearish technical indicators emerging",
          "Disappointing guidance from management",
          "Market sentiment turning negative",
          "Risk-off sentiment affecting sector"
        ]
      };

      return Array.from({ length: 50 }, (_, i) => {
        const tickerIndex = Math.floor(Math.random() * tickers.length);
        const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
        const source = sources[Math.floor(Math.random() * sources.length)];
        
        return {
          id: (i + 1).toString(),
          ticker: tickers[tickerIndex],
          company: companies[tickerIndex],
          content: sampleContent[sentiment][Math.floor(Math.random() * sampleContent[sentiment].length)],
          sentiment,
          confidence: Math.floor(Math.random() * 40) + 60,
          source,
          timestamp: new Date(Date.now() - Math.random() * 3600000 * 24),
          author: `user_${Math.floor(Math.random() * 1000)}`,
          engagement: Math.floor(Math.random() * 500) + 10
        };
      });
    };

    setPosts(generateMockData());
  }, []);

  // Filter posts based on search and filters
  const filteredPosts = posts.filter(post => {
    const matchesSearch = searchQuery === '' || 
      post.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.company.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSource = selectedSources.includes(post.source);
    const matchesSentiment = selectedSentiments.includes(post.sentiment);
    
    return matchesSearch && matchesSource && matchesSentiment;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Market Sentiment</h1>
                <p className="text-sm text-gray-600">Real-time social & news analysis</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live Updates</span>
              </div>
              <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Panel */}
        <StatsPanel posts={filteredPosts} />

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <SearchBar 
            searchQuery={searchQuery} 
            onSearchChange={setSearchQuery} 
          />
          
          <FilterPanel
            selectedSources={selectedSources}
            selectedSentiments={selectedSentiments}
            onSourcesChange={setSelectedSources}
            onSentimentsChange={setSelectedSentiments}
          />
        </div>

        {/* Results Summary */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredPosts.length} posts
            {searchQuery && (
              <span className="ml-1">
                for "<span className="font-medium">{searchQuery}</span>"
              </span>
            )}
          </p>
        </div>

        {/* Sentiment Feed */}
        <SentimentFeed 
          posts={filteredPosts} 
          viewMode={viewMode}
        />
      </div>
    </div>
  );
};

export default Index;
