import { useState, useEffect } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { FilterPanel } from '@/components/FilterPanel';
import { OverallSentimentChart } from '@/components/OverallSentimentChart';
import { IndustryGrid } from '@/components/IndustryGrid';
import { SentimentFeed } from '@/components/SentimentFeed';
import { SourcePanel } from '@/components/SourcePanel';
import { StatsPanel } from '@/components/StatsPanel';
import { ViewToggle } from '@/components/ViewToggle';
import { Activity } from 'lucide-react';

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
  const [posts, setPosts] = useState<SentimentPost[]>([]);
  const [industries, setIndustries] = useState<IndustryData[]>([]);

  // Mock data generator
  useEffect(() => {
    const generateMockData = () => {
      const industriesData: IndustryData[] = [
        {
          name: 'technology',
          label: 'Technology',
          icon: '💻',
          sentiment: { positive: 65, neutral: 25, negative: 10 },
          companies: [
            { ticker: 'AAPL', company: 'Apple Inc.', sentiment: 'positive', confidence: 85, price: 185.20, change: 2.5 },
            { ticker: 'GOOGL', company: 'Alphabet Inc.', sentiment: 'positive', confidence: 78, price: 142.30, change: 1.8 },
            { ticker: 'MSFT', company: 'Microsoft Corp.', sentiment: 'positive', confidence: 82, price: 415.50, change: 3.2 },
            { ticker: 'NVDA', company: 'NVIDIA Corp.', sentiment: 'positive', confidence: 90, price: 875.40, change: 8.7 },
            { ticker: 'TSLA', company: 'Tesla Inc.', sentiment: 'neutral', confidence: 70, price: 248.20, change: -1.2 },
          ]
        },
        {
          name: 'finance',
          label: 'Finance',
          icon: '🏦',
          sentiment: { positive: 45, neutral: 35, negative: 20 },
          companies: [
            { ticker: 'JPM', company: 'JPMorgan Chase & Co.', sentiment: 'positive', confidence: 75, price: 165.80, change: 1.5 },
            { ticker: 'BAC', company: 'Bank of America Corp.', sentiment: 'neutral', confidence: 68, price: 35.20, change: 0.8 },
            { ticker: 'GS', company: 'Goldman Sachs Group Inc.', sentiment: 'positive', confidence: 72, price: 385.60, change: 2.1 },
            { ticker: 'WFC', company: 'Wells Fargo & Co.', sentiment: 'negative', confidence: 65, price: 45.30, change: -0.9 },
            { ticker: 'MS', company: 'Morgan Stanley', sentiment: 'neutral', confidence: 70, price: 95.40, change: 0.3 },
          ]
        },
        {
          name: 'healthcare',
          label: 'Healthcare',
          icon: '🏥',
          sentiment: { positive: 55, neutral: 30, negative: 15 },
          companies: [
            { ticker: 'JNJ', company: 'Johnson & Johnson', sentiment: 'positive', confidence: 80, price: 158.70, change: 1.2 },
            { ticker: 'PFE', company: 'Pfizer Inc.', sentiment: 'neutral', confidence: 72, price: 28.50, change: -0.5 },
            { ticker: 'UNH', company: 'UnitedHealth Group Inc.', sentiment: 'positive', confidence: 85, price: 520.30, change: 4.1 },
            { ticker: 'ABT', company: 'Abbott Laboratories', sentiment: 'positive', confidence: 78, price: 105.60, change: 2.8 },
            { ticker: 'MRK', company: 'Merck & Co. Inc.', sentiment: 'neutral', confidence: 74, price: 112.40, change: 0.7 },
          ]
        },
        {
          name: 'energy',
          label: 'Energy',
          icon: '⚡',
          sentiment: { positive: 40, neutral: 25, negative: 35 },
          companies: [
            { ticker: 'XOM', company: 'Exxon Mobil Corp.', sentiment: 'negative', confidence: 70, price: 108.50, change: -2.1 },
            { ticker: 'CVX', company: 'Chevron Corp.', sentiment: 'neutral', confidence: 68, price: 155.20, change: 0.5 },
            { ticker: 'COP', company: 'ConocoPhillips', sentiment: 'positive', confidence: 72, price: 112.80, change: 1.8 },
            { ticker: 'SLB', company: 'Schlumberger NV', sentiment: 'negative', confidence: 65, price: 48.30, change: -1.5 },
            { ticker: 'EOG', company: 'EOG Resources Inc.', sentiment: 'neutral', confidence: 70, price: 125.40, change: 0.8 },
          ]
        },
        {
          name: 'retail',
          label: 'Retail',
          icon: '🛍️',
          sentiment: { positive: 50, neutral: 30, negative: 20 },
          companies: [
            { ticker: 'AMZN', company: 'Amazon.com Inc.', sentiment: 'positive', confidence: 82, price: 145.30, change: 3.5 },
            { ticker: 'WMT', company: 'Walmart Inc.', sentiment: 'positive', confidence: 75, price: 68.20, change: 1.2 },
            { ticker: 'HD', company: 'Home Depot Inc.', sentiment: 'neutral', confidence: 70, price: 385.60, change: 0.9 },
            { ticker: 'COST', company: 'Costco Wholesale Corp.', sentiment: 'positive', confidence: 78, price: 725.40, change: 2.8 },
            { ticker: 'TGT', company: 'Target Corp.', sentiment: 'negative', confidence: 68, price: 142.50, change: -1.8 },
          ]
        },
        {
          name: 'aerospace',
          label: 'Aerospace',
          icon: '✈️',
          sentiment: { positive: 35, neutral: 40, negative: 25 },
          companies: [
            { ticker: 'BA', company: 'Boeing Co.', sentiment: 'negative', confidence: 75, price: 185.20, change: -2.5 },
            { ticker: 'LMT', company: 'Lockheed Martin Corp.', sentiment: 'neutral', confidence: 72, price: 465.80, change: 0.5 },
            { ticker: 'RTX', company: 'Raytheon Technologies', sentiment: 'positive', confidence: 70, price: 95.30, change: 1.8 },
            { ticker: 'NOC', company: 'Northrop Grumman Corp.', sentiment: 'neutral', confidence: 68, price: 485.60, change: 1.1 },
            { ticker: 'GD', company: 'General Dynamics Corp.', sentiment: 'positive', confidence: 74, price: 285.40, change: 2.2 },
          ]
        }
      ];

      setIndustries(industriesData);

      // Generate posts from industry data
      const allPosts: SentimentPost[] = [];
      industriesData.forEach(industry => {
        industry.companies.forEach((company, index) => {
          const post: SentimentPost = {
            id: `${industry.name}-${index}`,
            ticker: company.ticker,
            company: company.company,
            content: `Recent analysis shows ${company.sentiment} sentiment with ${company.confidence}% confidence`,
            sentiment: company.sentiment,
            confidence: company.confidence,
            source: ['twitter', 'reddit', 'stocktwits', 'news'][Math.floor(Math.random() * 4)] as Source,
            timestamp: new Date(Date.now() - Math.random() * 3600000),
            author: `analyst_${Math.floor(Math.random() * 100)}`,
            engagement: Math.floor(Math.random() * 500) + 50,
            industry: industry.name as Industry
          };
          allPosts.push(post);
        });
      });

      setPosts(allPosts);
    };

    generateMockData();
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
            
            <div className="flex items-center space-x-2 text-sm dashboard-text-secondary">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live Updates</span>
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
