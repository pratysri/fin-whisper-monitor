import requests
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import time
from ratelimit import limits, sleep_and_retry

logger = logging.getLogger(__name__)

class StockTwitsService:
    """Service for collecting posts from StockTwits"""
    
    def __init__(self):
        self.base_url = "https://api.stocktwits.com/api/2"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'SentimentAnalyzer/1.0'
        })
    
    def is_available(self) -> bool:
        """Check if StockTwits service is available"""
        try:
            response = self.session.get(f"{self.base_url}/streams/trending.json", timeout=10)
            return response.status_code == 200
        except:
            return False
    
    @sleep_and_retry
    @limits(calls=200, period=3600)  # StockTwits rate limit: 200 requests per hour
    def get_symbol_stream(self, symbol: str, max_results: int = 30) -> List[Dict]:
        """
        Get messages for a specific stock symbol
        
        Args:
            symbol: Stock ticker symbol (e.g., 'AAPL')
            max_results: Maximum number of messages to return
        
        Returns:
            List of message dictionaries
        """
        try:
            url = f"{self.base_url}/streams/symbol/{symbol}.json"
            params = {
                'limit': min(max_results, 30)  # API limit per request
            }
            
            response = self.session.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                messages = data.get('messages', [])
                
                processed_messages = []
                
                for message in messages:
                    try:
                        # Parse message data
                        processed_message = {
                            'id': message.get('id'),
                            'content': message.get('body', ''),
                            'author': message.get('user', {}).get('username', 'unknown'),
                            'timestamp': self.parse_stocktwits_date(message.get('created_at')),
                            'engagement': message.get('likes', {}).get('total', 0),
                            'source': 'stocktwits',
                            'original_url': f"https://stocktwits.com/symbol/{symbol}"
                        }
                        
                        # Filter out empty messages
                        if processed_message['content'].strip():
                            processed_messages.append(processed_message)
                            
                    except Exception as e:
                        logger.error(f"Error processing StockTwits message: {e}")
                        continue
                
                logger.info(f"Collected {len(processed_messages)} messages for ${symbol}")
                return processed_messages
                
            elif response.status_code == 429:
                logger.warning("StockTwits rate limit exceeded")
                time.sleep(3600)  # Wait 1 hour
                return []
            else:
                logger.error(f"StockTwits API error {response.status_code}: {response.text}")
                return []
                
        except Exception as e:
            logger.error(f"Error fetching StockTwits data for {symbol}: {e}")
            return []
    
    def parse_stocktwits_date(self, date_string: str) -> datetime:
        """Parse StockTwits date format"""
        try:
            # StockTwits uses format like "2023-12-01T15:30:00Z"
            return datetime.fromisoformat(date_string.replace('Z', '+00:00')).replace(tzinfo=None)
        except:
            return datetime.utcnow()
    
    @sleep_and_retry
    @limits(calls=200, period=3600)
    def get_trending_symbols(self, limit: int = 30) -> List[str]:
        """
        Get trending stock symbols from StockTwits
        
        Args:
            limit: Maximum number of symbols to return
            
        Returns:
            List of trending ticker symbols
        """
        try:
            url = f"{self.base_url}/trending/symbols.json"
            params = {'limit': min(limit, 30)}
            
            response = self.session.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                symbols_data = data.get('symbols', [])
                
                symbols = []
                for symbol_data in symbols_data:
                    symbol = symbol_data.get('symbol', '').upper()
                    if symbol and len(symbol) <= 5:  # Filter reasonable ticker symbols
                        symbols.append(symbol)
                
                logger.info(f"Found {len(symbols)} trending symbols")
                return symbols
                
            else:
                logger.error(f"Error fetching trending symbols: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Error fetching trending symbols: {e}")
            return []
    
    def get_company_posts(self, company_data: Dict, max_results: int = 30) -> List[Dict]:
        """
        Get StockTwits posts for a specific company
        
        Args:
            company_data: Dictionary with ticker, company name, and keywords
            max_results: Maximum posts to collect
            
        Returns:
            List of processed posts with company context
        """
        ticker = company_data.get('ticker', '').upper()
        if not ticker:
            return []
        
        try:
            # Get messages for this ticker
            messages = self.get_symbol_stream(ticker, max_results)
            
            # Add company context to messages
            for message in messages:
                message['ticker'] = company_data['ticker']
                message['company'] = company_data['name']
                message['industry'] = company_data.get('industry', 'unknown')
            
            return messages
            
        except Exception as e:
            logger.error(f"Error getting StockTwits posts for {company_data.get('name', 'unknown')}: {e}")
            return []
    
    def collect_all_companies(self, companies_config: Dict, max_per_company: int = 20) -> List[Dict]:
        """
        Collect StockTwits posts for all companies across industries
        
        Args:
            companies_config: Configuration dict with industries and companies
            max_per_company: Maximum posts per company
            
        Returns:
            List of all collected posts
        """
        if not self.is_available():
            logger.warning("StockTwits service not available for collection")
            return []
        
        all_posts = []
        
        for industry, companies in companies_config.items():
            logger.info(f"Collecting StockTwits data for {industry} industry")
            
            for company in companies:
                try:
                    # Add industry to company data
                    company_with_industry = {**company, 'industry': industry}
                    
                    # Get posts for this company
                    posts = self.get_company_posts(company_with_industry, max_per_company)
                    all_posts.extend(posts)
                    
                    # Delay to respect rate limits
                    time.sleep(2)
                    
                except Exception as e:
                    logger.error(f"Error collecting StockTwits posts for {company.get('name', 'unknown')}: {e}")
                    continue
        
        logger.info(f"Collected {len(all_posts)} total posts from StockTwits")
        return all_posts
    
    def get_trending_posts(self, max_results: int = 50) -> List[Dict]:
        """
        Get trending posts from StockTwits
        
        Args:
            max_results: Maximum posts to collect
            
        Returns:
            List of trending posts
        """
        try:
            # First get trending symbols
            trending_symbols = self.get_trending_symbols(10)
            
            if not trending_symbols:
                return []
            
            all_posts = []
            posts_per_symbol = max(3, max_results // len(trending_symbols))
            
            for symbol in trending_symbols:
                try:
                    posts = self.get_symbol_stream(symbol, posts_per_symbol)
                    
                    # Add basic context for trending posts
                    for post in posts:
                        post['ticker'] = symbol
                        post['company'] = f"Trending: {symbol}"
                        post['industry'] = 'trending'
                    
                    all_posts.extend(posts)
                    
                    if len(all_posts) >= max_results:
                        break
                        
                    time.sleep(1)  # Small delay between requests
                    
                except Exception as e:
                    logger.error(f"Error collecting trending posts for {symbol}: {e}")
                    continue
            
            return all_posts[:max_results]
            
        except Exception as e:
            logger.error(f"Error collecting trending posts: {e}")
            return [] 