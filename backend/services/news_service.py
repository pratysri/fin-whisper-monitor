import requests
import feedparser
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import time
from ratelimit import limits, sleep_and_retry
from urllib.parse import urljoin
import re

logger = logging.getLogger(__name__)

class NewsService:
    """Service for collecting financial news articles"""
    
    def __init__(self, news_api_key: str = None):
        self.news_api_key = news_api_key
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'SentimentAnalyzer/1.0'
        })
        
        # Financial news RSS feeds (free sources)
        self.rss_feeds = [
            {
                'name': 'Yahoo Finance',
                'url': 'https://feeds.finance.yahoo.com/rss/2.0/headline',
                'category': 'general'
            },
            {
                'name': 'MarketWatch',
                'url': 'https://feeds.marketwatch.com/marketwatch/realtimeheadlines/',
                'category': 'general'
            },
            {
                'name': 'Reuters Business',
                'url': 'https://feeds.reuters.com/reuters/businessNews',
                'category': 'business'
            },
            {
                'name': 'Financial Times',
                'url': 'https://www.ft.com/rss/home/us',
                'category': 'financial'
            }
        ]
    
    def is_available(self) -> bool:
        """Check if news service is available"""
        # Always return True since we use RSS feeds and NewsAPI is optional
        return True
    
    @sleep_and_retry
    @limits(calls=100, period=3600)  # Conservative rate limiting
    def fetch_rss_feed(self, feed_url: str, max_articles: int = 20) -> List[Dict]:
        """
        Fetch articles from RSS feed
        
        Args:
            feed_url: RSS feed URL
            max_articles: Maximum number of articles to fetch
            
        Returns:
            List of article dictionaries
        """
        try:
            feed = feedparser.parse(feed_url)
            
            if feed.bozo:
                logger.warning(f"RSS feed may have issues: {feed_url}")
            
            articles = []
            
            for entry in feed.entries[:max_articles]:
                try:
                    # Parse publication date
                    pub_date = datetime.utcnow()
                    if hasattr(entry, 'published_parsed') and entry.published_parsed:
                        pub_date = datetime(*entry.published_parsed[:6])
                    elif hasattr(entry, 'updated_parsed') and entry.updated_parsed:
                        pub_date = datetime(*entry.updated_parsed[:6])
                    
                    # Get article content
                    content = entry.get('title', '')
                    if hasattr(entry, 'summary'):
                        content += " " + entry.summary
                    
                    # Clean content
                    content = re.sub(r'<[^>]+>', '', content)  # Remove HTML tags
                    content = re.sub(r'\s+', ' ', content).strip()  # Normalize whitespace
                    
                    article = {
                        'id': entry.get('id', entry.get('link', '')),
                        'content': content,
                        'author': entry.get('author', 'news'),
                        'timestamp': pub_date,
                        'engagement': 0,  # RSS feeds don't have engagement metrics
                        'source': 'news',
                        'original_url': entry.get('link', ''),
                        'feed_name': feed.feed.get('title', 'Unknown Feed')
                    }
                    
                    # Only include articles with sufficient content
                    if len(content.strip()) > 50:
                        articles.append(article)
                        
                except Exception as e:
                    logger.error(f"Error processing RSS entry: {e}")
                    continue
            
            logger.info(f"Collected {len(articles)} articles from RSS feed: {feed_url}")
            return articles
            
        except Exception as e:
            logger.error(f"Error fetching RSS feed {feed_url}: {e}")
            return []
    
    @sleep_and_retry
    @limits(calls=100, period=86400)  # NewsAPI has daily limits
    def search_news_api(self, query: str, max_articles: int = 20) -> List[Dict]:
        """
        Search for news articles using NewsAPI
        
        Args:
            query: Search query
            max_articles: Maximum number of articles
            
        Returns:
            List of article dictionaries
        """
        if not self.news_api_key:
            logger.warning("NewsAPI key not provided, skipping NewsAPI search")
            return []
        
        try:
            url = "https://newsapi.org/v2/everything"
            params = {
                'q': query,
                'sortBy': 'publishedAt',
                'language': 'en',
                'pageSize': min(max_articles, 100),
                'apiKey': self.news_api_key,
                'domains': 'reuters.com,bloomberg.com,marketwatch.com,cnbc.com,wsj.com,ft.com'
            }
            
            response = self.session.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                articles_data = data.get('articles', [])
                
                articles = []
                
                for article_data in articles_data:
                    try:
                        # Parse publication date
                        pub_date_str = article_data.get('publishedAt', '')
                        pub_date = datetime.utcnow()
                        if pub_date_str:
                            pub_date = datetime.fromisoformat(pub_date_str.replace('Z', '+00:00')).replace(tzinfo=None)
                        
                        # Get content
                        content = article_data.get('title', '')
                        if article_data.get('description'):
                            content += " " + article_data['description']
                        
                        article = {
                            'id': article_data.get('url', ''),
                            'content': content,
                            'author': article_data.get('author', article_data.get('source', {}).get('name', 'news')),
                            'timestamp': pub_date,
                            'engagement': 0,
                            'source': 'news',
                            'original_url': article_data.get('url', ''),
                            'feed_name': article_data.get('source', {}).get('name', 'NewsAPI')
                        }
                        
                        articles.append(article)
                        
                    except Exception as e:
                        logger.error(f"Error processing NewsAPI article: {e}")
                        continue
                
                logger.info(f"Collected {len(articles)} articles from NewsAPI for query: {query}")
                return articles
                
            elif response.status_code == 429:
                logger.warning("NewsAPI rate limit exceeded")
                return []
            else:
                logger.error(f"NewsAPI error {response.status_code}: {response.text}")
                return []
                
        except Exception as e:
            logger.error(f"Error searching NewsAPI for {query}: {e}")
            return []
    
    def get_company_news(self, company_data: Dict, max_results: int = 20) -> List[Dict]:
        """
        Get news articles for a specific company
        
        Args:
            company_data: Dictionary with ticker, company name, and keywords
            max_results: Maximum articles to collect
            
        Returns:
            List of processed articles with company context
        """
        try:
            all_articles = []
            
            # Build search queries
            queries = []
            
            # Add company name
            company_name = company_data.get('name', '')
            if company_name:
                queries.append(company_name)
            
            # Add ticker
            ticker = company_data.get('ticker', '')
            if ticker:
                queries.append(ticker)
            
            # Use NewsAPI if available
            if self.news_api_key and queries:
                for query in queries[:2]:  # Limit to avoid excessive API calls
                    articles = self.search_news_api(query, max_results // 2)
                    all_articles.extend(articles)
                    time.sleep(1)
            
            # Also collect from RSS feeds for broader coverage
            rss_articles = []
            for feed in self.rss_feeds[:2]:  # Limit feeds to avoid too many requests
                try:
                    feed_articles = self.fetch_rss_feed(feed['url'], 10)
                    
                    # Filter articles that mention the company
                    relevant_articles = []
                    for article in feed_articles:
                        content_lower = article['content'].lower()
                        
                        # Check if article mentions company name or ticker
                        if any(keyword.lower() in content_lower 
                              for keyword in [company_name, ticker] + company_data.get('keywords', [])
                              if keyword):
                            relevant_articles.append(article)
                    
                    rss_articles.extend(relevant_articles)
                    time.sleep(1)
                    
                except Exception as e:
                    logger.error(f"Error fetching from feed {feed['name']}: {e}")
                    continue
            
            all_articles.extend(rss_articles)
            
            # Remove duplicates and add company context
            unique_articles = self.remove_duplicate_articles(all_articles)
            
            for article in unique_articles:
                article['ticker'] = company_data['ticker']
                article['company'] = company_data['name']
                article['industry'] = company_data.get('industry', 'unknown')
            
            return unique_articles[:max_results]
            
        except Exception as e:
            logger.error(f"Error getting news for {company_data.get('name', 'unknown')}: {e}")
            return []
    
    def remove_duplicate_articles(self, articles: List[Dict]) -> List[Dict]:
        """Remove duplicate articles based on content similarity"""
        unique_articles = []
        seen_titles = set()
        
        for article in articles:
            # Use first 100 characters of content as key
            title_key = re.sub(r'\W+', '', article['content'][:100].lower())
            
            if title_key not in seen_titles:
                seen_titles.add(title_key)
                unique_articles.append(article)
        
        return unique_articles
    
    def collect_all_companies(self, companies_config: Dict, max_per_company: int = 15) -> List[Dict]:
        """
        Collect news articles for all companies across industries
        
        Args:
            companies_config: Configuration dict with industries and companies
            max_per_company: Maximum articles per company
            
        Returns:
            List of all collected articles
        """
        all_articles = []
        
        for industry, companies in companies_config.items():
            logger.info(f"Collecting news data for {industry} industry")
            
            for company in companies:
                try:
                    # Add industry to company data
                    company_with_industry = {**company, 'industry': industry}
                    
                    # Get articles for this company
                    articles = self.get_company_news(company_with_industry, max_per_company)
                    all_articles.extend(articles)
                    
                    # Delay to respect rate limits
                    time.sleep(2)
                    
                except Exception as e:
                    logger.error(f"Error collecting news for {company.get('name', 'unknown')}: {e}")
                    continue
        
        logger.info(f"Collected {len(all_articles)} total articles from news sources")
        return all_articles
    
    def get_general_market_news(self, max_articles: int = 50) -> List[Dict]:
        """
        Get general market news from RSS feeds
        
        Args:
            max_articles: Maximum articles to collect
            
        Returns:
            List of market news articles
        """
        try:
            all_articles = []
            articles_per_feed = max(5, max_articles // len(self.rss_feeds))
            
            for feed in self.rss_feeds:
                try:
                    articles = self.fetch_rss_feed(feed['url'], articles_per_feed)
                    
                    # Add feed context
                    for article in articles:
                        article['ticker'] = 'MARKET'
                        article['company'] = 'Market News'
                        article['industry'] = 'general'
                        article['feed_category'] = feed['category']
                    
                    all_articles.extend(articles)
                    time.sleep(1)
                    
                except Exception as e:
                    logger.error(f"Error collecting from {feed['name']}: {e}")
                    continue
            
            return all_articles[:max_articles]
            
        except Exception as e:
            logger.error(f"Error collecting general market news: {e}")
            return [] 