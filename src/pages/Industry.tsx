
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

      // Generate 50 mock companies for the industry
      const companies: CompanyData[] = [];
      const sentiments: ('positive' | 'neutral' | 'negative')[] = ['positive', 'neutral', 'negative'];
      
      for (let i = 0; i < 50; i++) {
        const randomSentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
        companies.push({
          ticker: `${config.name.toUpperCase().slice(0, 3)}${i + 1}`,
          company: `${config.label} Company ${i + 1}`,
          sentiment: randomSentiment,
          confidence: Math.floor(Math.random() * 30) + 70,
          price: Math.random() * 500 + 50,
          change: (Math.random() - 0.5) * 10
        });
      }

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
