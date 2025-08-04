import tweepy
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import time
from ratelimit import limits, sleep_and_retry
import requests

logger = logging.getLogger(__name__)

class TwitterService:
    """Service for collecting tweets about companies"""
    
    def __init__(self, bearer_token: str):
        self.bearer_token = bearer_token
        self.client = None
        
        if bearer_token:
            try:
                self.client = tweepy.Client(bearer_token=bearer_token, wait_on_rate_limit=True)
                logger.info("Twitter client initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Twitter client: {e}")
    
    def is_available(self) -> bool:
        """Check if Twitter service is available"""
        return self.client is not None and self.bearer_token is not None
    
    @sleep_and_retry
    @limits(calls=300, period=900)  # 300 requests per 15 minutes (Twitter rate limit)
    def search_tweets(self, query: str, max_results: int = 100, hours_back: int = 24) -> List[Dict]:
        """
        Search for tweets about a company
        
        Args:
            query: Search query (company keywords)
            max_results: Maximum number of tweets to return
            hours_back: How many hours back to search
        
        Returns:
            List of tweet dictionaries
        """
        if not self.is_available():
            logger.warning("Twitter service not available")
            return []
        
        try:
            # Calculate start time
            start_time = datetime.utcnow() - timedelta(hours=hours_back)
            
            # Build query with filters
            search_query = f"{query} -is:retweet lang:en"
            
            # Search tweets
            tweets = tweepy.Paginator(
                self.client.search_recent_tweets,
                query=search_query,
                tweet_fields=['created_at', 'author_id', 'public_metrics', 'context_annotations'],
                user_fields=['username', 'name', 'verified'],
                expansions=['author_id'],
                start_time=start_time,
                max_results=min(max_results, 100)  # API limit per request
            ).flatten(limit=max_results)
            
            # Process tweets
            processed_tweets = []
            users_dict = {}
            
            # Get response with includes
            response = self.client.search_recent_tweets(
                query=search_query,
                tweet_fields=['created_at', 'author_id', 'public_metrics', 'context_annotations'],
                user_fields=['username', 'name', 'verified'],
                expansions=['author_id'],
                start_time=start_time,
                max_results=min(max_results, 100)
            )
            
            if response.includes and 'users' in response.includes:
                users_dict = {user.id: user for user in response.includes['users']}
            
            if response.data:
                for tweet in response.data:
                    try:
                        # Get user info
                        user = users_dict.get(tweet.author_id)
                        username = user.username if user else f"user_{tweet.author_id}"
                        
                        # Calculate engagement score
                        metrics = tweet.public_metrics or {}
                        engagement = (
                            metrics.get('like_count', 0) + 
                            metrics.get('retweet_count', 0) * 2 + 
                            metrics.get('reply_count', 0) + 
                            metrics.get('quote_count', 0)
                        )
                        
                        processed_tweet = {
                            'id': tweet.id,
                            'content': tweet.text,
                            'author': username,
                            'timestamp': tweet.created_at,
                            'engagement': engagement,
                            'source': 'twitter',
                            'original_url': f"https://twitter.com/{username}/status/{tweet.id}"
                        }
                        
                        processed_tweets.append(processed_tweet)
                        
                    except Exception as e:
                        logger.error(f"Error processing tweet {tweet.id}: {e}")
                        continue
            
            logger.info(f"Collected {len(processed_tweets)} tweets for query: {query}")
            return processed_tweets
            
        except tweepy.TooManyRequests:
            logger.warning("Twitter rate limit exceeded, waiting...")
            time.sleep(900)  # Wait 15 minutes
            return []
        except Exception as e:
            logger.error(f"Error searching tweets for {query}: {e}")
            return []
    
    def get_company_tweets(self, company_data: Dict, max_results: int = 50) -> List[Dict]:
        """
        Get tweets for a specific company
        
        Args:
            company_data: Dictionary with ticker, company name, and keywords
            max_results: Maximum tweets to collect
            
        Returns:
            List of processed tweets with company context
        """
        if not self.is_available():
            return []
        
        try:
            # Build search query from keywords
            keywords = company_data.get('keywords', [])
            if not keywords:
                return []
            
            # Create query string (use OR operator for keywords)
            query_terms = []
            for keyword in keywords[:3]:  # Limit to first 3 keywords to avoid long queries
                if len(keyword) > 2:  # Skip very short keywords
                    query_terms.append(f'"{keyword}"')
            
            if not query_terms:
                return []
            
            query = " OR ".join(query_terms)
            
            # Search tweets
            tweets = self.search_tweets(query, max_results=max_results)
            
            # Add company context to tweets
            for tweet in tweets:
                tweet['ticker'] = company_data['ticker']
                tweet['company'] = company_data['name']
                tweet['industry'] = company_data.get('industry', 'unknown')
            
            return tweets
            
        except Exception as e:
            logger.error(f"Error getting tweets for {company_data.get('name', 'unknown')}: {e}")
            return []
    
    def collect_all_companies(self, companies_config: Dict, max_per_company: int = 25) -> List[Dict]:
        """
        Collect tweets for all companies across industries
        
        Args:
            companies_config: Configuration dict with industries and companies
            max_per_company: Maximum tweets per company
            
        Returns:
            List of all collected tweets
        """
        if not self.is_available():
            logger.warning("Twitter service not available for collection")
            return []
        
        all_tweets = []
        
        for industry, companies in companies_config.items():
            logger.info(f"Collecting Twitter data for {industry} industry")
            
            for company in companies:
                try:
                    # Add industry to company data
                    company_with_industry = {**company, 'industry': industry}
                    
                    # Get tweets for this company
                    tweets = self.get_company_tweets(company_with_industry, max_per_company)
                    all_tweets.extend(tweets)
                    
                    # Small delay to be respectful to API
                    time.sleep(1)
                    
                except Exception as e:
                    logger.error(f"Error collecting tweets for {company.get('name', 'unknown')}: {e}")
                    continue
        
        logger.info(f"Collected {len(all_tweets)} total tweets from Twitter")
        return all_tweets 