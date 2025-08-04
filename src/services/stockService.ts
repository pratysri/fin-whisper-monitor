// Stock price service using Finnhub API
// Get your free API key from: https://finnhub.io/register

const FINNHUB_API_KEY = 'd2811p1r01qr2iau4uc0d2811p1r01qr2iau4ucg'; // Replace with your actual API key
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

export interface StockPrice {
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  previousClose: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  timestamp: number;
}

export interface StockQuote {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
  t: number; // Timestamp
}

class StockService {
  private cache: Map<string, { data: StockPrice; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 60000; // 1 minute cache

  async getStockPrice(symbol: string): Promise<StockPrice | null> {
    // Check cache first
    const cached = this.cache.get(symbol);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      // For demo purposes, if no API key is set, return mock data
      if (!FINNHUB_API_KEY || FINNHUB_API_KEY === 'your_api_key_here') {
        return this.getMockStockPrice(symbol);
      }

      const response = await fetch(
        `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const quote: StockQuote = await response.json();
      
      // Handle API errors (when symbol not found, quote will have 0 values)
      if (quote.c === 0) {
        console.warn(`No data found for symbol: ${symbol}`);
        return this.getMockStockPrice(symbol);
      }

      const stockPrice: StockPrice = {
        symbol,
        currentPrice: quote.c,
        change: quote.d,
        changePercent: quote.dp,
        previousClose: quote.pc,
        open: quote.o,
        high: quote.h,
        low: quote.l,
        volume: 0, // Volume not provided in basic quote
        timestamp: quote.t * 1000 // Convert to milliseconds
      };

      // Cache the result
      this.cache.set(symbol, { data: stockPrice, timestamp: Date.now() });
      
      return stockPrice;
    } catch (error) {
      console.error(`Error fetching stock price for ${symbol}:`, error);
      return this.getMockStockPrice(symbol);
    }
  }

  async getMultipleStockPrices(symbols: string[]): Promise<Map<string, StockPrice>> {
    const promises = symbols.map(symbol => 
      this.getStockPrice(symbol).then(price => ({ symbol, price }))
    );
    
    const results = await Promise.all(promises);
    const priceMap = new Map<string, StockPrice>();
    
    results.forEach(({ symbol, price }) => {
      if (price) {
        priceMap.set(symbol, price);
      }
    });
    
    return priceMap;
  }

  // Mock data generator for when API is not available
  private getMockStockPrice(symbol: string): StockPrice {
    // Create deterministic but realistic mock data based on symbol
    const hash = this.hashCode(symbol);
    const basePrice = Math.abs(hash % 1000) + 50; // Price between 50-1050
    const volatility = (Math.abs(hash % 100) + 1) / 100; // 0.01 to 1.00
    
    // Add some time-based variation
    const timeVariation = Math.sin(Date.now() / 100000) * volatility;
    const randomVariation = (Math.random() - 0.5) * volatility * 2;
    
    const currentPrice = basePrice + timeVariation + randomVariation;
    const previousClose = basePrice;
    const change = currentPrice - previousClose;
    const changePercent = (change / previousClose) * 100;
    
    return {
      symbol,
      currentPrice: Number(currentPrice.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
      previousClose: Number(previousClose.toFixed(2)),
      open: Number((basePrice + (Math.random() - 0.5) * volatility).toFixed(2)),
      high: Number((currentPrice + Math.random() * volatility).toFixed(2)),
      low: Number((currentPrice - Math.random() * volatility).toFixed(2)),
      volume: Math.floor(Math.random() * 10000000),
      timestamp: Date.now()
    };
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }

  // Clear cache manually if needed
  clearCache(): void {
    this.cache.clear();
  }
}

export const stockService = new StockService();