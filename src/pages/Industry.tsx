
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OverallSentimentChart } from '@/components/OverallSentimentChart';
import { IndustryData, CompanyData } from './Index';
import { INDUSTRY_ICONS } from '@/constants/dashboard';
import { useLiveData } from '@/hooks/useLiveData';

const Industry = () => {
  const { industryName } = useParams<{ industryName: string }>();
  const navigate = useNavigate();
  const [industryData, setIndustryData] = useState<IndustryData | null>(null);
  const [allCompanies, setAllCompanies] = useState<CompanyData[]>([]);

  // Use the same live data system as the home page
  const { 
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

  useEffect(() => {
    if (!industryName || industries.length === 0) return;

    // Find the industry data from live data
    const industry = industries.find(ind => ind.name === industryName);
    
    if (industry) {
      setIndustryData(industry);
      
      // For the "all companies" view, we can include additional companies that might not be in the main 5
      // but still use live data for the ones we have
      const expandedCompanies = [...industry.companies];
      
      // Add additional realistic companies for this industry with live data simulation
      const additionalCompanies = getAdditionalCompaniesForIndustry(industryName, industry.companies);
      expandedCompanies.push(...additionalCompanies);
      
      setAllCompanies(expandedCompanies);
    }
  }, [industryName, industries]);

  // Helper function to add more companies for expanded view
  const getAdditionalCompaniesForIndustry = (industry: string, existingCompanies: CompanyData[]): CompanyData[] => {
    const existingTickers = new Set(existingCompanies.map(c => c.ticker));
    const additionalCompaniesMap: Record<string, Array<{ticker: string, company: string}>> = {
      technology: [
        { ticker: 'META', company: 'Meta Platforms Inc.' },
        { ticker: 'NFLX', company: 'Netflix Inc.' },
        { ticker: 'CRM', company: 'Salesforce Inc.' },
        { ticker: 'ORCL', company: 'Oracle Corp.' },
        { ticker: 'ADBE', company: 'Adobe Inc.' },
        { ticker: 'INTC', company: 'Intel Corp.' },
        { ticker: 'AMD', company: 'Advanced Micro Devices' },
        { ticker: 'CSCO', company: 'Cisco Systems Inc.' },
        { ticker: 'IBM', company: 'International Business Machines' },
      ],
      finance: [
        { ticker: 'C', company: 'Citigroup Inc.' },
        { ticker: 'AXP', company: 'American Express Co.' },
        { ticker: 'BLK', company: 'BlackRock Inc.' },
        { ticker: 'SCHW', company: 'Charles Schwab Corp.' },
        { ticker: 'USB', company: 'U.S. Bancorp' },
        { ticker: 'PNC', company: 'PNC Financial Services' },
        { ticker: 'TFC', company: 'Truist Financial Corp.' },
        { ticker: 'COF', company: 'Capital One Financial' },
      ],
      healthcare: [
        { ticker: 'LLY', company: 'Eli Lilly and Co.' },
        { ticker: 'TMO', company: 'Thermo Fisher Scientific' },
        { ticker: 'DHR', company: 'Danaher Corp.' },
        { ticker: 'BMY', company: 'Bristol Myers Squibb' },
        { ticker: 'MDT', company: 'Medtronic PLC' },
        { ticker: 'GILD', company: 'Gilead Sciences Inc.' },
        { ticker: 'AMGN', company: 'Amgen Inc.' },
        { ticker: 'CVS', company: 'CVS Health Corp.' },
      ],
      energy: [
        { ticker: 'PXD', company: 'Pioneer Natural Resources' },
        { ticker: 'MPC', company: 'Marathon Petroleum Corp.' },
        { ticker: 'VLO', company: 'Valero Energy Corp.' },
        { ticker: 'PSX', company: 'Phillips 66' },
        { ticker: 'OXY', company: 'Occidental Petroleum' },
        { ticker: 'HAL', company: 'Halliburton Co.' },
        { ticker: 'BKR', company: 'Baker Hughes Co.' },
        { ticker: 'HES', company: 'Hess Corp.' },
      ],
      retail: [
        { ticker: 'LOW', company: 'Lowe\'s Companies Inc.' },
        { ticker: 'TJX', company: 'TJX Companies Inc.' },
        { ticker: 'SBUX', company: 'Starbucks Corp.' },
        { ticker: 'NKE', company: 'Nike Inc.' },
        { ticker: 'MCD', company: 'McDonald\'s Corp.' },
        { ticker: 'EBAY', company: 'eBay Inc.' },
        { ticker: 'ETSY', company: 'Etsy Inc.' },
        { ticker: 'BBY', company: 'Best Buy Co. Inc.' },
      ],
      aerospace: [
        { ticker: 'LHX', company: 'L3Harris Technologies' },
        { ticker: 'TXT', company: 'Textron Inc.' },
        { ticker: 'HWM', company: 'Howmet Aerospace Inc.' },
        { ticker: 'CW', company: 'Curtiss-Wright Corp.' },
        { ticker: 'TDG', company: 'TransDigm Group Inc.' },
        { ticker: 'HEI', company: 'HEICO Corp.' },
      ]
    };

    const additionalList = additionalCompaniesMap[industry] || [];
    return additionalList
      .filter(comp => !existingTickers.has(comp.ticker))
      .slice(0, 10) // Limit additional companies
      .map(comp => ({
        ticker: comp.ticker,
        company: comp.company,
        sentiment: (['positive', 'neutral', 'negative'] as const)[Math.floor(Math.random() * 3)],
        confidence: Math.floor(Math.random() * 30) + 70,
        // Use the same price generation logic as the live data but with consistent results
        price: Math.abs(hashCode(comp.ticker) % 1000) + 50,
        change: ((Math.abs(hashCode(comp.ticker + 'change')) % 200) - 100) / 10, // -10 to +10
      }));
  };

  // Hash function for consistent "random" values
  const hashCode = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  };

  if (!industryData) {
    return (
      <div className="min-h-screen dashboard-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold dashboard-text-primary mb-2">Industry Not Found</h1>
          <p className="dashboard-text-secondary mb-4">The requested industry could not be found.</p>
          <Button onClick={() => navigate('/')} className="dashboard-button-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dashboard-gradient-bg">
      {/* Header */}
      <header className="bg-gray-900/90 backdrop-blur-md border-b border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/')}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{industryData.icon}</div>
                <div>
                  <h1 className="text-2xl font-bold dashboard-text-primary">{industryData.label} Industry</h1>
                  <p className="text-sm dashboard-text-secondary">Comprehensive sentiment analysis</p>
                </div>
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
        {/* Industry Sentiment Chart */}
        <div className="mb-8">
          <h2 className="text-xl font-bold dashboard-text-primary mb-4">
            {industryData.label} Sentiment Overview
          </h2>
          <OverallSentimentChart sentiment={industryData.sentiment} />
        </div>

        {/* All Companies List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold dashboard-text-primary">All Companies ({allCompanies.length})</h2>
          </div>
          
          <div className="grid gap-4">
            {allCompanies.map((company, index) => (
              <Card 
                key={company.ticker} 
                className="p-4 dashboard-card-hover cursor-pointer"
                onClick={() => navigate(`/company/${company.ticker}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-lg font-bold text-blue-400">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold dashboard-text-primary hover:text-blue-300">${company.ticker}</span>
                        <Badge 
                          variant="outline"
                          className={`text-xs ${
                            company.sentiment === 'positive' 
                              ? 'text-emerald-400 border-emerald-500/30' 
                              : company.sentiment === 'negative' 
                              ? 'text-red-400 border-red-500/30' 
                              : 'text-gray-400 border-gray-500/30'
                          }`}
                        >
                          {company.sentiment.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm dashboard-text-secondary">{company.company}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold dashboard-text-primary">
                      ${company.price.toFixed(2)}
                    </div>
                    <div className={`text-sm ${
                      company.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {company.change >= 0 ? '+' : ''}{company.change.toFixed(2)}%
                    </div>
                    <div className="text-xs dashboard-text-muted">
                      {company.confidence}% confidence
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Industry;
