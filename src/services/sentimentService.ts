// Realistic sentiment data generator
import { SentimentPost, Sentiment, Source, Industry } from '@/pages/Index';

export interface SentimentUpdate {
  ticker: string;
  sentiment: Sentiment;
  confidence: number;
  posts: SentimentPost[];
}

class SentimentService {
  private sentimentHistory: Map<string, Sentiment[]> = new Map();
  private readonly MAX_HISTORY = 20;

  // Realistic sentiment content templates
  private sentimentTemplates = {
    positive: [
      "Strong earnings beat expectations! 🚀",
      "Bullish momentum building on recent news",
      "Great fundamentals, looking for a breakout",
      "Loving the direction this company is heading",
      "Solid Q4 results, expecting more upside",
      "Technical analysis shows strong support levels",
      "Market sentiment shifting positive on this one",
      "Institutional buying pressure increasing",
      "Revenue growth exceeding forecasts",
      "Innovation pipeline looking very promising"
    ],
    negative: [
      "Concerned about recent regulatory issues",
      "Earnings miss has me worried about Q1",
      "Technical indicators showing bearish divergence",
      "Competition heating up in this space",
      "Management guidance disappointing investors",
      "Market headwinds affecting sector outlook",
      "Valuation looking stretched at these levels",
      "Supply chain disruptions impacting margins",
      "Insider selling activity raising red flags",
      "Macro environment not favorable for growth"
    ],
    neutral: [
      "Waiting for more clarity on earnings guidance",
      "Mixed signals from recent market data",
      "Holding position, watching key support levels",
      "Neutral stance until next earnings call",
      "Sideways action expected in near term",
      "Monitoring industry trends before position",
      "Fair value around current price levels",
      "Waiting for technical confirmation",
      "Range-bound trading likely to continue",
      "Market consensus aligns with my view"
    ]
  };

  private sources: Source[] = ['twitter', 'reddit', 'stocktwits', 'news'];
  
  private authorTemplates = [
    'MarketMaven', 'TechAnalyst', 'ValueInvestor', 'QuantTrader', 'StockGuru',
    'FinanceExpert', 'MarketWatcher', 'TradingPro', 'InvestmentBear', 'BullRunner',
    'ChartMaster', 'FundamentalsFan', 'OptionsTrader', 'DividendHunter', 'GrowthSeeker'
  ];

  generateSentimentUpdate(ticker: string, company: string, industry: Industry): SentimentUpdate {
    // Get historical sentiment to create realistic trends
    const history = this.sentimentHistory.get(ticker) || [];
    
    // Generate new sentiment with some momentum bias
    const newSentiment = this.generateRealisticSentiment(history);
    
    // Update history
    history.push(newSentiment);
    if (history.length > this.MAX_HISTORY) {
      history.shift();
    }
    this.sentimentHistory.set(ticker, history);

    // Calculate confidence based on sentiment consistency
    const confidence = this.calculateConfidence(history, newSentiment);

    // Generate multiple posts for this update
    const posts = this.generatePosts(ticker, company, industry, newSentiment, confidence);

    return {
      ticker,
      sentiment: newSentiment,
      confidence,
      posts
    };
  }

  private generateRealisticSentiment(history: Sentiment[]): Sentiment {
    if (history.length === 0) {
      // First time, random weighted towards neutral
      const rand = Math.random();
      if (rand < 0.4) return 'neutral';
      if (rand < 0.7) return 'positive';
      return 'negative';
    }

    const lastSentiment = history[history.length - 1];
    const recentPositive = history.slice(-5).filter(s => s === 'positive').length;
    const recentNegative = history.slice(-5).filter(s => s === 'negative').length;

    // Create momentum - sentiment tends to persist
    const persistenceProbability = 0.6;
    
    if (Math.random() < persistenceProbability) {
      return lastSentiment;
    }

    // Otherwise, consider trend reversal
    if (recentPositive >= 3) {
      // Very positive trend, might reverse to neutral
      return Math.random() < 0.7 ? 'neutral' : 'negative';
    }
    
    if (recentNegative >= 3) {
      // Very negative trend, might reverse to neutral  
      return Math.random() < 0.7 ? 'neutral' : 'positive';
    }

    // Random walk
    const sentiments: Sentiment[] = ['positive', 'neutral', 'negative'];
    return sentiments[Math.floor(Math.random() * sentiments.length)];
  }

  private calculateConfidence(history: Sentiment[], currentSentiment: Sentiment): number {
    if (history.length < 3) {
      return Math.floor(Math.random() * 20) + 60; // 60-80% for new data
    }

    const recent = history.slice(-5);
    const consistency = recent.filter(s => s === currentSentiment).length / recent.length;
    
    // Higher consistency = higher confidence
    const baseConfidence = 50 + (consistency * 40); // 50-90%
    const randomness = (Math.random() - 0.5) * 10; // ±5%
    
    return Math.max(50, Math.min(95, Math.floor(baseConfidence + randomness)));
  }

  private generatePosts(
    ticker: string, 
    company: string, 
    industry: Industry, 
    sentiment: Sentiment, 
    confidence: number
  ): SentimentPost[] {
    const numPosts = Math.floor(Math.random() * 3) + 1; // 1-3 posts
    const posts: SentimentPost[] = [];

    for (let i = 0; i < numPosts; i++) {
      const template = this.sentimentTemplates[sentiment];
      const content = template[Math.floor(Math.random() * template.length)];
      const author = this.authorTemplates[Math.floor(Math.random() * this.authorTemplates.length)];
      const source = this.sources[Math.floor(Math.random() * this.sources.length)];
      
      // Add some variation to confidence for individual posts
      const postConfidence = Math.max(50, Math.min(95, 
        confidence + (Math.random() - 0.5) * 10
      ));

      posts.push({
        id: `${ticker}-${Date.now()}-${i}`,
        ticker,
        company,
        content: `$${ticker} ${content}`,
        sentiment,
        confidence: Math.floor(postConfidence),
        source,
        timestamp: new Date(Date.now() - Math.random() * 300000), // Within last 5 minutes
        author: `${author}${Math.floor(Math.random() * 999)}`,
        engagement: Math.floor(Math.random() * 500) + 10,
        industry
      });
    }

    return posts;
  }

  // Generate batch updates for multiple tickers
  generateBatchUpdates(companies: Array<{ ticker: string; company: string; industry: Industry }>): SentimentUpdate[] {
    return companies.map(({ ticker, company, industry }) => 
      this.generateSentimentUpdate(ticker, company, industry)
    );
  }

  // Get overall sentiment for a ticker based on recent history
  getOverallSentiment(ticker: string): { sentiment: Sentiment; confidence: number } {
    const history = this.sentimentHistory.get(ticker) || [];
    
    if (history.length === 0) {
      return { sentiment: 'neutral', confidence: 60 };
    }

    const recent = history.slice(-5);
    const positive = recent.filter(s => s === 'positive').length;
    const negative = recent.filter(s => s === 'negative').length;
    const neutral = recent.filter(s => s === 'neutral').length;

    let sentiment: Sentiment;
    if (positive > negative && positive > neutral) {
      sentiment = 'positive';
    } else if (negative > positive && negative > neutral) {
      sentiment = 'negative';
    } else {
      sentiment = 'neutral';
    }

    const dominance = Math.max(positive, negative, neutral) / recent.length;
    const confidence = Math.floor(50 + dominance * 40);

    return { sentiment, confidence };
  }
}

export const sentimentService = new SentimentService();