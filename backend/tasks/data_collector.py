import logging
from typing import List, Dict
from datetime import datetime, timedelta
import time
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from services.twitter_service import TwitterService
from services.reddit_service import RedditService
from services.stocktwits_service import StockTwitsService
from services.news_service import NewsService
from services.sentiment_analyzer import FinancialSentimentAnalyzer
from models.models import SentimentPostModel, CompanyModel
from config import Config

logger = logging.getLogger(__name__)

class DataCollector:
    """Main data collection orchestrator"""
    
    def __init__(self):
        self.sentiment_analyzer = FinancialSentimentAnalyzer()
        
        # Initialize services
        self.twitter_service = TwitterService(Config.TWITTER_BEARER_TOKEN)
        self.reddit_service = RedditService(
            Config.REDDIT_CLIENT_ID,
            Config.REDDIT_CLIENT_SECRET,
            Config.REDDIT_USER_AGENT
        )
        self.stocktwits_service = StockTwitsService()
        self.news_service = NewsService(Config.NEWS_API_KEY)
        
        # Initialize database connection
        self.engine = create_engine(Config.SQLALCHEMY_DATABASE_URI)
        Session = sessionmaker(bind=self.engine)
        self.session = Session()
        
        logger.info("DataCollector initialized")
    
    def collect_all_data(self):
        """Collect data from all sources"""
        try:
            # Get list of companies to monitor
            companies = self.session.query(CompanyModel).all()
            company_map = {company.ticker: company for company in companies}
            
            # Use the config for company structure
            companies_config = Config.COMPANIES
            
            # Collect from each source using the correct method (skip Twitter for now)
            for source, service, collect_method in [
                #('twitter', self.twitter_service, 'collect_all_companies'),
                ('reddit', self.reddit_service, 'collect_all_companies'),
                ('stocktwits', self.stocktwits_service, 'collect_all_companies'),
                ('news', self.news_service, 'collect_all_companies')
            ]:
                try:
                    # Get raw data
                    collect_func = getattr(service, collect_method)
                    raw_data = collect_func(companies_config, max_per_company=10)
                    
                    # Process and store data
                    processed_items = self.process_data(raw_data, source, company_map)
                    self.store_data(processed_items)
                    
                    logger.info(f"Collected {len(processed_items)} items from {source}")
                    
                except Exception as e:
                    logger.error(f"Error collecting from {source}: {e}")
                    continue
                
                # Rate limiting pause
                time.sleep(1)
            
            logger.info("Data collection completed")
            
        except Exception as e:
            logger.error(f"Error in data collection: {e}")
        finally:
            self.session.close()
    
    def process_data(self, data: List[Dict], source: str, company_map: Dict[str, CompanyModel]) -> List[Dict]:
        """
        Process raw data with sentiment analysis
        
        Args:
            data: List of raw data items
            source: Source name (twitter, reddit, stocktwits, news)
            company_map: Mapping of tickers to Company models
            
        Returns:
            List of processed items ready for storage
        """
        processed_items = []
        
        for item in data:
            try:
                ticker = item.get('ticker', 'UNKNOWN')
                company = company_map.get(ticker)
                
                if not company:
                    logger.warning(f"Unknown company ticker: {ticker}")
                    continue
                
                # Analyze sentiment
                sentiment, confidence = self.sentiment_analyzer.analyze_sentiment(
                    item['content'], 
                    ticker
                )
                
                # Create processed item
                processed_item = {
                    'company_id': str(company.id),
                    'content': item['content'],
                    'sentiment': sentiment,
                    'confidence': confidence,
                    'source': source,
                    'author': item['author'],
                    'engagement': item.get('engagement', 0),
                    'timestamp': item.get('timestamp', datetime.utcnow()),
                    'original_url': item.get('original_url')
                }
                
                processed_items.append(processed_item)
                logger.debug(f"Processed item from {source}: {sentiment} ({confidence}%)")
                
            except Exception as e:
                logger.error(f"Error processing item from {source}: {e}")
                continue
        
        return processed_items
    
    def store_data(self, items: List[Dict]):
        """Store processed items in the database"""
        try:
            for item in items:
                # Check for duplicates
                if self.check_duplicate(item['content'], item['source'], item['author']):
                    continue
                
                # Create new post
                post = SentimentPostModel(
                    company_id=item['company_id'],
                    content=item['content'],
                    sentiment=item['sentiment'],
                    confidence=item['confidence'],
                    source=item['source'],
                    author=item['author'],
                    engagement=item['engagement'],
                    timestamp=item['timestamp'],
                    original_url=item.get('original_url')
                )
                
                self.session.add(post)
            
            self.session.commit()
            
        except Exception as e:
            logger.error(f"Error storing data: {e}")
            self.session.rollback()
    
    def check_duplicate(self, content: str, source: str, author: str, timestamp_window_minutes: int = 60) -> bool:
        """Check if a similar post already exists within a time window"""
        time_window = datetime.utcnow() - timedelta(minutes=timestamp_window_minutes)
        
        existing_post = self.session.query(SentimentPostModel)\
                                   .filter(
                                       SentimentPostModel.content == content,
                                       SentimentPostModel.source == source,
                                       SentimentPostModel.author == author,
                                       SentimentPostModel.timestamp >= time_window
                                   ).first()
        
        return existing_post is not None
    
    def cleanup_old_data(self, days_old: int = None):
        """Delete posts older than specified days"""
        if days_old is None:
            days_old = Config.DATA_RETENTION_DAYS
            
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days_old)
            
            deleted_count = self.session.query(SentimentPostModel)\
                                       .filter(SentimentPostModel.timestamp < cutoff_date)\
                                       .delete()
            
            self.session.commit()
            logger.info(f"Deleted {deleted_count} old posts")
            
        except Exception as e:
            logger.error(f"Error cleaning up old data: {e}")
            self.session.rollback()
    
    def __del__(self):
        """Cleanup on destruction"""
        try:
            self.session.close()
        except:
            pass 