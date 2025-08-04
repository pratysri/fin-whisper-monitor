import { useState, useEffect, useCallback } from 'react';
import { stockService, StockPrice } from '@/services/stockService';
import { sentimentService, SentimentUpdate } from '@/services/sentimentService';
import { CompanyData, IndustryData, SentimentPost, Industry } from '@/pages/Index';

export interface LiveDataConfig {
  updateInterval?: number; // in milliseconds
  enableStockPrices?: boolean;
  enableSentiment?: boolean;
}

export interface LiveDataState {
  companies: CompanyData[];
  industries: IndustryData[];
  posts: SentimentPost[];
  lastUpdate: Date | null;
  isLoading: boolean;
  error: string | null;
}

const DEFAULT_COMPANIES = [
  // Technology
  { ticker: 'AAPL', company: 'Apple Inc.', industry: 'technology' as Industry },
  { ticker: 'GOOGL', company: 'Alphabet Inc.', industry: 'technology' as Industry },
  { ticker: 'MSFT', company: 'Microsoft Corp.', industry: 'technology' as Industry },
  { ticker: 'NVDA', company: 'NVIDIA Corp.', industry: 'technology' as Industry },
  { ticker: 'TSLA', company: 'Tesla Inc.', industry: 'technology' as Industry },
  
  // Finance
  { ticker: 'JPM', company: 'JPMorgan Chase & Co.', industry: 'finance' as Industry },
  { ticker: 'BAC', company: 'Bank of America Corp.', industry: 'finance' as Industry },
  { ticker: 'GS', company: 'Goldman Sachs Group Inc.', industry: 'finance' as Industry },
  { ticker: 'WFC', company: 'Wells Fargo & Co.', industry: 'finance' as Industry },
  { ticker: 'MS', company: 'Morgan Stanley', industry: 'finance' as Industry },

  // Healthcare
  { ticker: 'JNJ', company: 'Johnson & Johnson', industry: 'healthcare' as Industry },
  { ticker: 'PFE', company: 'Pfizer Inc.', industry: 'healthcare' as Industry },
  { ticker: 'UNH', company: 'UnitedHealth Group Inc.', industry: 'healthcare' as Industry },
  { ticker: 'ABT', company: 'Abbott Laboratories', industry: 'healthcare' as Industry },
  { ticker: 'MRK', company: 'Merck & Co. Inc.', industry: 'healthcare' as Industry },

  // Energy
  { ticker: 'XOM', company: 'Exxon Mobil Corp.', industry: 'energy' as Industry },
  { ticker: 'CVX', company: 'Chevron Corp.', industry: 'energy' as Industry },
  { ticker: 'COP', company: 'ConocoPhillips', industry: 'energy' as Industry },
  { ticker: 'SLB', company: 'Schlumberger NV', industry: 'energy' as Industry },
  { ticker: 'EOG', company: 'EOG Resources Inc.', industry: 'energy' as Industry },

  // Retail
  { ticker: 'AMZN', company: 'Amazon.com Inc.', industry: 'retail' as Industry },
  { ticker: 'WMT', company: 'Walmart Inc.', industry: 'retail' as Industry },
  { ticker: 'HD', company: 'Home Depot Inc.', industry: 'retail' as Industry },
  { ticker: 'COST', company: 'Costco Wholesale Corp.', industry: 'retail' as Industry },
  { ticker: 'TGT', company: 'Target Corp.', industry: 'retail' as Industry },

  // Aerospace
  { ticker: 'BA', company: 'Boeing Co.', industry: 'aerospace' as Industry },
  { ticker: 'LMT', company: 'Lockheed Martin Corp.', industry: 'aerospace' as Industry },
  { ticker: 'RTX', company: 'Raytheon Technologies', industry: 'aerospace' as Industry },
  { ticker: 'NOC', company: 'Northrop Grumman Corp.', industry: 'aerospace' as Industry },
  { ticker: 'GD', company: 'General Dynamics Corp.', industry: 'aerospace' as Industry },
];

const INDUSTRY_INFO = {
  technology: { name: 'technology', label: 'Technology', icon: '💻' },
  finance: { name: 'finance', label: 'Finance', icon: '🏦' },
  healthcare: { name: 'healthcare', label: 'Healthcare', icon: '🏥' },
  energy: { name: 'energy', label: 'Energy', icon: '⚡' },
  retail: { name: 'retail', label: 'Retail', icon: '🛍️' },
  aerospace: { name: 'aerospace', label: 'Aerospace', icon: '✈️' },
};

export const useLiveData = (config: LiveDataConfig = {}) => {
  const {
    updateInterval = 30000, // 30 seconds
    enableStockPrices = true,
    enableSentiment = true,
  } = config;

  const [state, setState] = useState<LiveDataState>({
    companies: [],
    industries: [],
    posts: [],
    lastUpdate: null,
    isLoading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const companies: CompanyData[] = [];
      const allPosts: SentimentPost[] = [];

      // Fetch stock prices and sentiment for all companies
      for (const companyInfo of DEFAULT_COMPANIES) {
        let stockPrice: StockPrice | null = null;
        let sentimentUpdate: SentimentUpdate | null = null;

        if (enableStockPrices) {
          stockPrice = await stockService.getStockPrice(companyInfo.ticker);
        }

        if (enableSentiment) {
          sentimentUpdate = sentimentService.generateSentimentUpdate(
            companyInfo.ticker,
            companyInfo.company,
            companyInfo.industry
          );
          allPosts.push(...sentimentUpdate.posts);
        }

        // Create company data
        const company: CompanyData = {
          ticker: companyInfo.ticker,
          company: companyInfo.company,
          sentiment: sentimentUpdate?.sentiment || 'neutral',
          confidence: sentimentUpdate?.confidence || 60,
          price: stockPrice?.currentPrice || 100,
          change: stockPrice?.changePercent || 0,
        };

        companies.push(company);
      }

      // Group companies by industry
      const industriesMap = new Map<string, CompanyData[]>();
      companies.forEach(company => {
        const industryCompanies = industriesMap.get(company.ticker) || [];
        const companyInfo = DEFAULT_COMPANIES.find(c => c.ticker === company.ticker);
        if (companyInfo) {
          const industry = companyInfo.industry;
          const existing = industriesMap.get(industry) || [];
          industriesMap.set(industry, [...existing, company]);
        }
      });

      // Create industry data
      const industries: IndustryData[] = [];
      Object.entries(INDUSTRY_INFO).forEach(([key, info]) => {
        const industryCompanies = industriesMap.get(key) || [];
        
        if (industryCompanies.length > 0) {
          // Calculate industry sentiment
          const positive = industryCompanies.filter(c => c.sentiment === 'positive').length;
          const negative = industryCompanies.filter(c => c.sentiment === 'negative').length;
          const neutral = industryCompanies.filter(c => c.sentiment === 'neutral').length;
          
          const total = industryCompanies.length;
          const sentiment = {
            positive: Math.round((positive / total) * 100),
            neutral: Math.round((neutral / total) * 100),
            negative: Math.round((negative / total) * 100),
          };

          industries.push({
            name: key,
            label: info.label,
            icon: info.icon,
            sentiment,
            companies: industryCompanies,
          });
        }
      });

      setState({
        companies,
        industries,
        posts: allPosts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
        lastUpdate: new Date(),
        isLoading: false,
        error: null,
      });

    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }));
    }
  }, [enableStockPrices, enableSentiment]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up interval for live updates
  useEffect(() => {
    const interval = setInterval(fetchData, updateInterval);
    return () => clearInterval(interval);
  }, [fetchData, updateInterval]);

  return {
    ...state,
    refresh: fetchData,
  };
};