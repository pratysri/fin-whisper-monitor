import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Activity, BarChart3, MessageSquare, Globe, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { stockService, StockPrice } from '@/services/stockService';
import { sentimentService, SentimentUpdate } from '@/services/sentimentService';
import { SentimentPost, Industry } from './Index';
import { SENTIMENT_CONFIG, SOURCE_CONFIG } from '@/constants/dashboard';

// Comprehensive company data for all supported companies
const COMPANY_DATA: Record<string, { name: string; industry: Industry; description: string; sector: string; marketCap: string; employees: string; founded: string; headquarters: string }> = {
  // Technology
  'AAPL': {
    name: 'Apple Inc.',
    industry: 'technology',
    description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
    sector: 'Consumer Electronics',
    marketCap: '$3.0T',
    employees: '164,000',
    founded: '1976',
    headquarters: 'Cupertino, CA'
  },
  'GOOGL': {
    name: 'Alphabet Inc.',
    industry: 'technology', 
    description: 'Alphabet Inc. provides online advertising services in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America.',
    sector: 'Internet & Software',
    marketCap: '$1.8T',
    employees: '190,000',
    founded: '1998',
    headquarters: 'Mountain View, CA'
  },
  'MSFT': {
    name: 'Microsoft Corporation',
    industry: 'technology',
    description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.',
    sector: 'Software & Services',
    marketCap: '$2.8T',
    employees: '221,000',
    founded: '1975',
    headquarters: 'Redmond, WA'
  },
  'NVDA': {
    name: 'NVIDIA Corporation',
    industry: 'technology',
    description: 'NVIDIA Corporation provides graphics processing units and related technologies for gaming, professional visualization, datacenter, and automotive markets.',
    sector: 'Semiconductors',
    marketCap: '$1.7T',
    employees: '29,600',
    founded: '1993',
    headquarters: 'Santa Clara, CA'
  },
  'TSLA': {
    name: 'Tesla, Inc.',
    industry: 'technology',
    description: 'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems.',
    sector: 'Electric Vehicles',
    marketCap: '$800B',
    employees: '140,000',
    founded: '2003',
    headquarters: 'Austin, TX'
  },
  'META': {
    name: 'Meta Platforms Inc.',
    industry: 'technology',
    description: 'Meta Platforms develops products that help people connect, find communities, and grow businesses through mobile devices and personal computers.',
    sector: 'Social Media',
    marketCap: '$850B',
    employees: '86,000',
    founded: '2004',
    headquarters: 'Menlo Park, CA'
  },
  'AMZN': {
    name: 'Amazon.com Inc.',
    industry: 'retail',
    description: 'Amazon.com Inc. offers retail sales of consumer products and subscriptions through online and physical stores.',
    sector: 'E-commerce',
    marketCap: '$1.5T',
    employees: '1,541,000',
    founded: '1994',
    headquarters: 'Seattle, WA'
  },
  'NFLX': {
    name: 'Netflix Inc.',
    industry: 'technology',
    description: 'Netflix Inc. provides entertainment services. It offers TV series, documentaries, feature films, and mobile games.',
    sector: 'Streaming Media',
    marketCap: '$200B',
    employees: '12,800',
    founded: '1997',
    headquarters: 'Los Gatos, CA'
  },

  // Finance
  'JPM': {
    name: 'JPMorgan Chase & Co.',
    industry: 'finance',
    description: 'JPMorgan Chase & Co. operates as a financial services company worldwide.',
    sector: 'Banking',
    marketCap: '$650B',
    employees: '297,000',
    founded: '2000',
    headquarters: 'New York, NY'
  },
  'BAC': {
    name: 'Bank of America Corporation',
    industry: 'finance',
    description: 'Bank of America Corporation provides banking and financial products and services for individual consumers, small and middle-market businesses, institutional investors, and corporations.',
    sector: 'Banking',
    marketCap: '$320B',
    employees: '217,000',
    founded: '1998',
    headquarters: 'Charlotte, NC'
  },
  'GS': {
    name: 'Goldman Sachs Group Inc.',
    industry: 'finance',
    description: 'Goldman Sachs Group Inc. is a leading global investment banking, securities and investment management firm.',
    sector: 'Investment Banking',
    marketCap: '$140B',
    employees: '49,100',
    founded: '1869',
    headquarters: 'New York, NY'
  },
  'WFC': {
    name: 'Wells Fargo & Company',
    industry: 'finance',
    description: 'Wells Fargo & Company provides banking, investment and mortgage products and services, as well as consumer and commercial finance.',
    sector: 'Banking',
    marketCap: '$180B',
    employees: '230,000',
    founded: '1852',
    headquarters: 'San Francisco, CA'
  },
  'MS': {
    name: 'Morgan Stanley',
    industry: 'finance',
    description: 'Morgan Stanley provides diversified financial services including securities trading, investment banking, wealth management, and investment management.',
    sector: 'Investment Banking',
    marketCap: '$150B',
    employees: '82,000',
    founded: '1935',
    headquarters: 'New York, NY'
  },

  // Healthcare
  'JNJ': {
    name: 'Johnson & Johnson',
    industry: 'healthcare',
    description: 'Johnson & Johnson researches, develops, manufactures, and sells a range of products in the healthcare field worldwide.',
    sector: 'Pharmaceuticals',
    marketCap: '$450B',
    employees: '152,700',
    founded: '1886',
    headquarters: 'New Brunswick, NJ'
  },
  'PFE': {
    name: 'Pfizer Inc.',
    industry: 'healthcare',
    description: 'Pfizer Inc. discovers, develops, manufactures, markets, distributes, and sells biopharmaceutical products worldwide.',
    sector: 'Pharmaceuticals',
    marketCap: '$160B',
    employees: '83,000',
    founded: '1849',
    headquarters: 'New York, NY'
  },
  'UNH': {
    name: 'UnitedHealth Group Incorporated',
    industry: 'healthcare',
    description: 'UnitedHealth Group provides healthcare coverage and benefits services in the United States and internationally.',
    sector: 'Health Insurance',
    marketCap: '$520B',
    employees: '440,000',
    founded: '1977',
    headquarters: 'Minnetonka, MN'
  },
  'ABT': {
    name: 'Abbott Laboratories',
    industry: 'healthcare',
    description: 'Abbott Laboratories discovers, develops, manufactures, and sells health care products worldwide.',
    sector: 'Medical Devices',
    marketCap: '$190B',
    employees: '114,000',
    founded: '1888',
    headquarters: 'Abbott Park, IL'
  },
  'MRK': {
    name: 'Merck & Co., Inc.',
    industry: 'healthcare',
    description: 'Merck & Co., Inc. operates as a healthcare company worldwide, providing prescription medicines, vaccines, biologic therapies and animal health products.',
    sector: 'Pharmaceuticals',
    marketCap: '$280B',
    employees: '71,000',
    founded: '1891',
    headquarters: 'Rahway, NJ'
  },

  // Energy
  'XOM': {
    name: 'Exxon Mobil Corporation',
    industry: 'energy',
    description: 'Exxon Mobil Corporation explores for and produces crude oil and natural gas in the United States and internationally.',
    sector: 'Oil & Gas',
    marketCap: '$450B',
    employees: '62,000',
    founded: '1999',
    headquarters: 'Irving, TX'
  },
  'CVX': {
    name: 'Chevron Corporation',
    industry: 'energy',
    description: 'Chevron Corporation engages in integrated energy and chemicals operations worldwide.',
    sector: 'Oil & Gas',
    marketCap: '$320B',
    employees: '47,600',
    founded: '1879',
    headquarters: 'San Ramon, CA'
  },
  'COP': {
    name: 'ConocoPhillips',
    industry: 'energy',
    description: 'ConocoPhillips explores for, produces, transports and markets crude oil, bitumen, natural gas, and refined products.',
    sector: 'Oil & Gas',
    marketCap: '$140B',
    employees: '9,300',
    founded: '2002',
    headquarters: 'Houston, TX'
  },
  'SLB': {
    name: 'Schlumberger Limited',
    industry: 'energy',
    description: 'Schlumberger Limited provides technology for the energy industry worldwide.',
    sector: 'Oil Services',
    marketCap: '$65B',
    employees: '95,000',
    founded: '1926',
    headquarters: 'Houston, TX'
  },
  'EOG': {
    name: 'EOG Resources, Inc.',
    industry: 'energy',
    description: 'EOG Resources, Inc. explores for, develops, produces and markets crude oil, and natural gas and natural gas liquids.',
    sector: 'Oil & Gas',
    marketCap: '$75B',
    employees: '2,900',
    founded: '1985',
    headquarters: 'Houston, TX'
  },

  // Retail
  'WMT': {
    name: 'Walmart Inc.',
    industry: 'retail',
    description: 'Walmart Inc. operates retail stores in various formats worldwide, offering merchandise and services at everyday low prices.',
    sector: 'Discount Retail',
    marketCap: '$650B',
    employees: '2,100,000',
    founded: '1962',
    headquarters: 'Bentonville, AR'
  },
  'HD': {
    name: 'The Home Depot, Inc.',
    industry: 'retail',
    description: 'The Home Depot, Inc. operates as a home improvement retailer.',
    sector: 'Home Improvement',
    marketCap: '$400B',
    employees: '475,000',
    founded: '1978',
    headquarters: 'Atlanta, GA'
  },
  'COST': {
    name: 'Costco Wholesale Corporation',
    industry: 'retail',
    description: 'Costco Wholesale Corporation operates membership warehouses in the United States, Puerto Rico, Canada, Mexico, Japan, Korea, Taiwan, Australia, Spain, France, Iceland, and China.',
    sector: 'Warehouse Clubs',
    marketCap: '$350B',
    employees: '304,000',
    founded: '1983',
    headquarters: 'Issaquah, WA'
  },
  'TGT': {
    name: 'Target Corporation',
    industry: 'retail',
    description: 'Target Corporation operates as a general merchandise retailer in the United States.',
    sector: 'Discount Retail',
    marketCap: '$65B',
    employees: '440,000',
    founded: '1902',
    headquarters: 'Minneapolis, MN'
  },

  // Aerospace
  'BA': {
    name: 'The Boeing Company',
    industry: 'aerospace',
    description: 'The Boeing Company designs, develops, manufactures, sales, services, and supports commercial jetliners, military aircraft, satellites, missile defense, human space flight and launch systems.',
    sector: 'Aerospace & Defense',
    marketCap: '$120B',
    employees: '171,000',
    founded: '1916',
    headquarters: 'Chicago, IL'
  },
  'LMT': {
    name: 'Lockheed Martin Corporation',
    industry: 'aerospace',
    description: 'Lockheed Martin Corporation engages in the research, design, development, manufacture, integration and sustainment of technology systems, products and services worldwide.',
    sector: 'Aerospace & Defense',
    marketCap: '$120B',
    employees: '116,000',
    founded: '1995',
    headquarters: 'Bethesda, MD'
  },
  'RTX': {
    name: 'RTX Corporation',
    industry: 'aerospace',
    description: 'RTX Corporation provides aerospace and defense products and services for commercial, military and government customers worldwide.',
    sector: 'Aerospace & Defense',
    marketCap: '$150B',
    employees: '185,000',
    founded: '2020',
    headquarters: 'Arlington, VA'
  },
  'NOC': {
    name: 'Northrop Grumman Corporation',
    industry: 'aerospace',
    description: 'Northrop Grumman Corporation operates as an aerospace and defense company worldwide.',
    sector: 'Aerospace & Defense',
    marketCap: '$75B',
    employees: '95,000',
    founded: '1994',
    headquarters: 'Falls Church, VA'
  },
  'GD': {
    name: 'General Dynamics Corporation',
    industry: 'aerospace',
    description: 'General Dynamics Corporation operates as an aerospace and defense company worldwide.',
    sector: 'Aerospace & Defense',
    marketCap: '$75B',
    employees: '106,500',
    founded: '1952',
    headquarters: 'Reston, VA'
  }
};

const Company = () => {
  const { ticker } = useParams<{ ticker: string }>();
  const [stockPrice, setStockPrice] = useState<StockPrice | null>(null);
  const [sentimentData, setSentimentData] = useState<SentimentUpdate | null>(null);
  const [recentPosts, setRecentPosts] = useState<SentimentPost[]>([]);
  const [loading, setLoading] = useState(true);

  const companyInfo = ticker ? COMPANY_DATA[ticker.toUpperCase()] : null;

  useEffect(() => {
    if (!ticker || !companyInfo) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch stock price
        const price = await stockService.getStockPrice(ticker.toUpperCase());
        setStockPrice(price);

        // Generate sentiment data
        const sentiment = sentimentService.generateSentimentUpdate(
          ticker.toUpperCase(),
          companyInfo.name,
          companyInfo.industry
        );
        setSentimentData(sentiment);
        setRecentPosts(sentiment.posts);

      } catch (error) {
        console.error('Error fetching company data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up live updates every 30 seconds
    const interval = setInterval(() => {
      fetchData();
    }, 30000);

    return () => clearInterval(interval);
  }, [ticker, companyInfo]);

  if (!ticker || !companyInfo) {
    return (
      <div className="min-h-screen dashboard-gradient-bg flex items-center justify-center">
        <Card className="dashboard-card p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold dashboard-text-primary mb-4">Company Not Found</h1>
            <p className="dashboard-text-secondary mb-6">The company ticker you're looking for doesn't exist in our database.</p>
            <Link to="/" className="inline-flex items-center text-blue-400 hover:text-blue-300">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const formatChange = (change: number, percent: number) => {
    const isPositive = change >= 0;
    const icon = isPositive ? TrendingUp : TrendingDown;
    const IconComponent = icon;
    
    return (
      <div className={`flex items-center ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
        <IconComponent className="h-4 w-4 mr-1" />
        <span>{isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{percent.toFixed(2)}%)</span>
      </div>
    );
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric'
    }).format(timestamp);
  };

  return (
    <div className="min-h-screen dashboard-gradient-bg">
      {/* Header */}
      <header className="bg-gray-900/90 backdrop-blur-md border-b border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-blue-400 hover:text-blue-300 transition-colors">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold dashboard-text-primary">{ticker.toUpperCase()}</h1>
                  <Badge variant="outline" className="dashboard-text-secondary">
                    {companyInfo.sector}
                  </Badge>
                </div>
                <p className="text-lg dashboard-text-secondary">{companyInfo.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm dashboard-text-secondary">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live Updates</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="dashboard-card animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-700 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Stock Price Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="dashboard-card md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center dashboard-text-primary">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Stock Price
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stockPrice ? (
                    <div className="space-y-4">
                      <div>
                        <div className="text-3xl font-bold dashboard-text-primary">
                          {formatPrice(stockPrice.currentPrice)}
                        </div>
                        <div className="mt-1">
                          {formatChange(stockPrice.change, stockPrice.changePercent)}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="dashboard-text-secondary">Open:</span>
                          <span className="dashboard-text-primary ml-2">{formatPrice(stockPrice.open)}</span>
                        </div>
                        <div>
                          <span className="dashboard-text-secondary">High:</span>
                          <span className="dashboard-text-primary ml-2">{formatPrice(stockPrice.high)}</span>
                        </div>
                        <div>
                          <span className="dashboard-text-secondary">Low:</span>
                          <span className="dashboard-text-primary ml-2">{formatPrice(stockPrice.low)}</span>
                        </div>
                        <div>
                          <span className="dashboard-text-secondary">Prev Close:</span>
                          <span className="dashboard-text-primary ml-2">{formatPrice(stockPrice.previousClose)}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-dashboard-text-secondary">Loading price data...</div>
                  )}
                </CardContent>
              </Card>

              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle className="flex items-center dashboard-text-primary">
                    <Activity className="h-5 w-5 mr-2" />
                    Sentiment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sentimentData ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Badge 
                          className={`${SENTIMENT_CONFIG[sentimentData.sentiment].bgColor} ${SENTIMENT_CONFIG[sentimentData.sentiment].textColor} border-none`}
                        >
                          {SENTIMENT_CONFIG[sentimentData.sentiment].emoji} {SENTIMENT_CONFIG[sentimentData.sentiment].label}
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold dashboard-text-primary">
                        {sentimentData.confidence}%
                      </div>
                      <div className="text-sm dashboard-text-secondary">
                        Confidence Level
                      </div>
                    </div>
                  ) : (
                    <div className="text-dashboard-text-secondary">Loading sentiment...</div>
                  )}
                </CardContent>
              </Card>

              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle className="flex items-center dashboard-text-primary">
                    <Globe className="h-5 w-5 mr-2" />
                    Company Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <span className="dashboard-text-secondary">Market Cap:</span>
                    <span className="dashboard-text-primary ml-2">{companyInfo.marketCap}</span>
                  </div>
                  <div>
                    <span className="dashboard-text-secondary">Employees:</span>
                    <span className="dashboard-text-primary ml-2">{companyInfo.employees}</span>
                  </div>
                  <div>
                    <span className="dashboard-text-secondary">Founded:</span>
                    <span className="dashboard-text-primary ml-2">{companyInfo.founded}</span>
                  </div>
                  <div>
                    <span className="dashboard-text-secondary">HQ:</span>
                    <span className="dashboard-text-primary ml-2">{companyInfo.headquarters}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Company Description */}
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle className="dashboard-text-primary">About {companyInfo.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="dashboard-text-secondary leading-relaxed">{companyInfo.description}</p>
              </CardContent>
            </Card>

            {/* Recent Sentiment Posts */}
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle className="flex items-center dashboard-text-primary">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Recent Sentiment Posts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentPosts.map((post, index) => (
                  <div key={post.id}>
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${SOURCE_CONFIG[post.source].bgColor} flex-shrink-0`}>
                        <MessageSquare className={`h-4 w-4 ${SOURCE_CONFIG[post.source].color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium dashboard-text-primary text-sm">{post.author}</span>
                          <Badge variant="outline" className={`${SOURCE_CONFIG[post.source].color} text-xs`}>
                            {SOURCE_CONFIG[post.source].label}
                          </Badge>
                          <div className="flex items-center text-xs dashboard-text-secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTimestamp(post.timestamp)}
                          </div>
                        </div>
                        <p className="dashboard-text-secondary text-sm mb-2">{post.content}</p>
                        <div className="flex items-center space-x-4 text-xs">
                          <Badge 
                            className={`${SENTIMENT_CONFIG[post.sentiment].bgColor} ${SENTIMENT_CONFIG[post.sentiment].textColor} border-none`}
                          >
                            {SENTIMENT_CONFIG[post.sentiment].emoji} {post.confidence}%
                          </Badge>
                          <span className="dashboard-text-secondary">{post.engagement} interactions</span>
                        </div>
                      </div>
                    </div>
                    {index < recentPosts.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Company;