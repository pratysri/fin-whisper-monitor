import { useState, useEffect } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { FilterPanel } from '@/components/FilterPanel';
import { OverallSentimentChart } from '@/components/OverallSentimentChart';
import { IndustryGrid } from '@/components/IndustryGrid';
import { SentimentFeed } from '@/components/SentimentFeed';
import { SourcePanel } from '@/components/SourcePanel';
import { StatsPanel } from '@/components/StatsPanel';
import { ViewToggle } from '@/components/ViewToggle';
import { Activity, RefreshCw } from 'lucide-react';
import { useLiveData } from '@/hooks/useLiveData';

export type ViewMode = 'cards' | 'table';
export type Source = 'twitter' | 'reddit' | 'stocktwits' | 'news';
export type Sentiment = 'positive' | 'neutral' | 'negative';
export type Industry = 'technology' | 'finance' | 'healthcare' | 'energy' | 'retail' | 'aerospace';

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
  industry: Industry;
}

export interface CompanyData {
  ticker: string;
  company: string;
  sentiment: Sentiment;
  confidence: number;
  price: number;
  change: number;
}

export interface IndustryData {
  name: string;
  label: string;
  icon: string;
  sentiment: { positive: number; neutral: number; negative: number };
  companies: CompanyData[];
}

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSources, setSelectedSources] = useState<Source[]>(['twitter', 'reddit', 'stocktwits', 'news']);
  const [selectedSentiments, setSelectedSentiments] = useState<Sentiment[]>(['positive', 'neutral', 'negative']);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  
  // Use the live data hook
  const { 
    posts, 
    industries, 
    lastUpdate, 
    isLoading, 
    error, 
    refresh 
  } = useLiveData({
    updateInterval: 30000, // 30 seconds
    enableStockPrices: true,
    enableSentiment: true,
  });

  // Error handling for live data
  useEffect(() => {
    if (error) {
      console.error('Live data error:', error);
    }
  }, [error]);

  // Filter posts based on search and filters
  const filteredPosts = posts.filter(post => {
    const matchesSearch = searchQuery === '' || 
      post.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.company.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSource = selectedSources.includes(post.source);
    const matchesSentiment = selectedSentiments.includes(post.sentiment);
    
    return matchesSearch && matchesSource && matchesSentiment;
  });

  // Calculate overall sentiment
  const overallSentiment = {
    positive: Math.round((filteredPosts.filter(p => p.sentiment === 'positive').length / filteredPosts.length) * 100) || 0,
    neutral: Math.round((filteredPosts.filter(p => p.sentiment === 'neutral').length / filteredPosts.length) * 100) || 0,
    negative: Math.round((filteredPosts.filter(p => p.sentiment === 'negative').length / filteredPosts.length) * 100) || 0,
  };

  return (
    <div className="min-h-screen dashboard-gradient-bg">
      {/* Header */}
      <header className="bg-gray-900/90 backdrop-blur-md border-b border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold dashboard-text-primary">Market Sentiment</h1>
                <p className="text-sm dashboard-text-secondary">Real-time social & news analysis</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm dashboard-text-secondary">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Live Updates</span>
              </div>
              {lastUpdate && (
                <div className="flex items-center space-x-1">
                  <span>Last update: {lastUpdate.toLocaleTimeString()}</span>
                  <button 
                    onClick={refresh}
                    className="p-1 hover:bg-gray-700/50 rounded transition-colors"
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Search and Filters */}
        <div className="space-y-4">
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

        {/* Statistics Panel */}
        <StatsPanel posts={filteredPosts} />

        {/* Overall Sentiment Chart */}
        <OverallSentimentChart sentiment={overallSentiment} />

        {/* Source Panel */}
        <SourcePanel selectedSources={selectedSources} />

        {/* Industry Grid */}
        <IndustryGrid industries={industries} />

        {/* Posts Feed */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold dashboard-text-primary">Recent Posts</h2>
              <p className="dashboard-text-secondary">
                {filteredPosts.length} posts from selected sources and sentiments
              </p>
            </div>
            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>
          
          <SentimentFeed posts={filteredPosts} viewMode={viewMode} />
        </div>
      </div>
    </div>
  );
};

export default Index;
