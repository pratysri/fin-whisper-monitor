
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OverallSentimentChart } from '@/components/OverallSentimentChart';
import { IndustryData, CompanyData } from './Index';
import { INDUSTRY_ICONS } from '@/constants/dashboard';

const Industry = () => {
  const { industryName } = useParams<{ industryName: string }>();
  const navigate = useNavigate();
  const [industryData, setIndustryData] = useState<IndustryData | null>(null);
  const [allCompanies, setAllCompanies] = useState<CompanyData[]>([]);

  useEffect(() => {
    // Generate expanded mock data for the specific industry
    const generateIndustryData = () => {
      const industryConfigs = {
        technology: {
          name: 'technology',
          label: 'Technology',
          icon: '💻',
          sentiment: { positive: 65, neutral: 25, negative: 10 }
        },
        finance: {
          name: 'finance',
          label: 'Finance',
          icon: '🏦',
          sentiment: { positive: 45, neutral: 35, negative: 20 }
        },
        healthcare: {
          name: 'healthcare',
          label: 'Healthcare',
          icon: '🏥',
          sentiment: { positive: 55, neutral: 30, negative: 15 }
        },
        energy: {
          name: 'energy',
          label: 'Energy',
          icon: '⚡',
          sentiment: { positive: 40, neutral: 25, negative: 35 }
        },
        retail: {
          name: 'retail',
          label: 'Retail',
          icon: '🛍️',
          sentiment: { positive: 50, neutral: 30, negative: 20 }
        },
        aerospace: {
          name: 'aerospace',
          label: 'Aerospace',
          icon: '✈️',
          sentiment: { positive: 35, neutral: 40, negative: 25 }
        }
      };

      const config = industryConfigs[industryName as keyof typeof industryConfigs];
      if (!config) return;

      // Define realistic companies for each industry
      const industryCompanies = {
        technology: [
          { ticker: 'AAPL', company: 'Apple Inc.' },
          { ticker: 'GOOGL', company: 'Alphabet Inc.' },
          { ticker: 'MSFT', company: 'Microsoft Corp.' },
          { ticker: 'NVDA', company: 'NVIDIA Corp.' },
          { ticker: 'TSLA', company: 'Tesla Inc.' },
          { ticker: 'META', company: 'Meta Platforms Inc.' },
          { ticker: 'AMZN', company: 'Amazon.com Inc.' },
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
          { ticker: 'JPM', company: 'JPMorgan Chase & Co.' },
          { ticker: 'BAC', company: 'Bank of America Corp.' },
          { ticker: 'WFC', company: 'Wells Fargo & Co.' },
          { ticker: 'GS', company: 'Goldman Sachs Group Inc.' },
          { ticker: 'MS', company: 'Morgan Stanley' },
          { ticker: 'C', company: 'Citigroup Inc.' },
          { ticker: 'AXP', company: 'American Express Co.' },
          { ticker: 'BLK', company: 'BlackRock Inc.' },
          { ticker: 'SCHW', company: 'Charles Schwab Corp.' },
          { ticker: 'USB', company: 'U.S. Bancorp' },
          { ticker: 'PNC', company: 'PNC Financial Services' },
          { ticker: 'TFC', company: 'Truist Financial Corp.' },
          { ticker: 'COF', company: 'Capital One Financial' },
          { ticker: 'BK', company: 'Bank of New York Mellon' },
          { ticker: 'STT', company: 'State Street Corp.' },
        ],
        healthcare: [
          { ticker: 'JNJ', company: 'Johnson & Johnson' },
          { ticker: 'UNH', company: 'UnitedHealth Group Inc.' },
          { ticker: 'PFE', company: 'Pfizer Inc.' },
          { ticker: 'ABT', company: 'Abbott Laboratories' },
          { ticker: 'MRK', company: 'Merck & Co. Inc.' },
          { ticker: 'LLY', company: 'Eli Lilly and Co.' },
          { ticker: 'TMO', company: 'Thermo Fisher Scientific' },
          { ticker: 'DHR', company: 'Danaher Corp.' },
          { ticker: 'BMY', company: 'Bristol Myers Squibb' },
          { ticker: 'MDT', company: 'Medtronic PLC' },
          { ticker: 'GILD', company: 'Gilead Sciences Inc.' },
          { ticker: 'AMGN', company: 'Amgen Inc.' },
          { ticker: 'CVS', company: 'CVS Health Corp.' },
          { ticker: 'CI', company: 'Cigna Group' },
          { ticker: 'HUM', company: 'Humana Inc.' },
        ],
        energy: [
          { ticker: 'XOM', company: 'Exxon Mobil Corp.' },
          { ticker: 'CVX', company: 'Chevron Corp.' },
          { ticker: 'COP', company: 'ConocoPhillips' },
          { ticker: 'EOG', company: 'EOG Resources Inc.' },
          { ticker: 'SLB', company: 'Schlumberger NV' },
          { ticker: 'PXD', company: 'Pioneer Natural Resources' },
          { ticker: 'MPC', company: 'Marathon Petroleum Corp.' },
          { ticker: 'VLO', company: 'Valero Energy Corp.' },
          { ticker: 'PSX', company: 'Phillips 66' },
          { ticker: 'OXY', company: 'Occidental Petroleum' },
          { ticker: 'HAL', company: 'Halliburton Co.' },
          { ticker: 'BKR', company: 'Baker Hughes Co.' },
          { ticker: 'HES', company: 'Hess Corp.' },
          { ticker: 'MRO', company: 'Marathon Oil Corp.' },
          { ticker: 'DVN', company: 'Devon Energy Corp.' },
        ],
        retail: [
          { ticker: 'AMZN', company: 'Amazon.com Inc.' },
          { ticker: 'WMT', company: 'Walmart Inc.' },
          { ticker: 'HD', company: 'Home Depot Inc.' },
          { ticker: 'COST', company: 'Costco Wholesale Corp.' },
          { ticker: 'TGT', company: 'Target Corp.' },
          { ticker: 'LOW', company: 'Lowe\'s Companies Inc.' },
          { ticker: 'TJX', company: 'TJX Companies Inc.' },
          { ticker: 'SBUX', company: 'Starbucks Corp.' },
          { ticker: 'NKE', company: 'Nike Inc.' },
          { ticker: 'MCD', company: 'McDonald\'s Corp.' },
          { ticker: 'EBAY', company: 'eBay Inc.' },
          { ticker: 'ETSY', company: 'Etsy Inc.' },
          { ticker: 'BBY', company: 'Best Buy Co. Inc.' },
          { ticker: 'GPS', company: 'Gap Inc.' },
          { ticker: 'M', company: 'Macy\'s Inc.' },
        ],
        aerospace: [
          { ticker: 'BA', company: 'Boeing Co.' },
          { ticker: 'LMT', company: 'Lockheed Martin Corp.' },
          { ticker: 'RTX', company: 'Raytheon Technologies' },
          { ticker: 'NOC', company: 'Northrop Grumman Corp.' },
          { ticker: 'GD', company: 'General Dynamics Corp.' },
          { ticker: 'LHX', company: 'L3Harris Technologies' },
          { ticker: 'TXT', company: 'Textron Inc.' },
          { ticker: 'HWM', company: 'Howmet Aerospace Inc.' },
          { ticker: 'CW', company: 'Curtiss-Wright Corp.' },
          { ticker: 'AIR', company: 'AAR Corp.' },
          { ticker: 'SPR', company: 'Spirit AeroSystems' },
          { ticker: 'HEI', company: 'HEICO Corp.' },
          { ticker: 'TDG', company: 'TransDigm Group Inc.' },
          { ticker: 'WWD', company: 'Woodward Inc.' },
          { ticker: 'AVAV', company: 'AeroVironment Inc.' },
        ]
      };

      const industryCompanyList = industryCompanies[config.name as keyof typeof industryCompanies] || [];
      const companies: CompanyData[] = [];
      const sentiments: ('positive' | 'neutral' | 'negative')[] = ['positive', 'neutral', 'negative'];
      
      industryCompanyList.forEach((companyInfo) => {
        const randomSentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
        companies.push({
          ticker: companyInfo.ticker,
          company: companyInfo.company,
          sentiment: randomSentiment,
          confidence: Math.floor(Math.random() * 30) + 70,
          price: Math.random() * 500 + 50,
          change: (Math.random() - 0.5) * 10
        });
      });

      setIndustryData({
        ...config,
        companies: companies.slice(0, 5) // Keep first 5 for the main data structure
      });
      
      setAllCompanies(companies);
    };

    if (industryName) {
      generateIndustryData();
    }
  }, [industryName]);

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
            
            <div className="flex items-center space-x-2 text-sm dashboard-text-secondary">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live Updates</span>
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
              <Card key={company.ticker} className="p-4 dashboard-card-hover">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-lg font-bold text-blue-400">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold dashboard-text-primary">${company.ticker}</span>
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
