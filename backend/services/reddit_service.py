import praw
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import time
from ratelimit import limits, sleep_and_retry
import re

logger = logging.getLogger(__name__)

class RedditService:
    """Service for collecting Reddit posts about companies"""
    
    def __init__(self, client_id: str, client_secret: str, user_agent: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self.user_agent = user_agent
        self.reddit = None
        
        if client_id and client_secret:
            try:
                self.reddit = praw.Reddit(
                    client_id=client_id,
                    client_secret=client_secret,
                    user_agent=user_agent
                )
                # Test the connection
                self.reddit.user.me()
                logger.info("Reddit client initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Reddit client: {e}")
                self.reddit = None
    
    def is_available(self) -> bool:
        """Check if Reddit service is available"""
        return self.reddit is not None
    
    def get_financial_subreddits(self) -> List[str]:
        """Get list of financial subreddits to monitor"""
        return [
            'stocks', 'investing', 'SecurityAnalysis', 'ValueInvesting',
            'StockMarket', 'finance', 'financialindependence',
            'SecurityAnalysis', 'SecurityAnalysis', 'ValueInvesting',
            'options', 'pennystocks', 'robinhoodpennystocks'
        ]
    
    @sleep_and_retry
    @limits(calls=60, period=60)  # Reddit rate limit: 60 requests per minute
    def search_subreddit_posts(self, subreddit_name: str, query: str, 
                              limit: int = 25, time_filter: str = 'day') -> List[Dict]:
        """
        Search for posts in a specific subreddit
        
        Args:
            subreddit_name: Name of the subreddit
            query: Search query
            limit: Maximum number of posts
            time_filter: Time filter ('hour', 'day', 'week', 'month', 'year', 'all')
        
        Returns:
            List of post dictionaries
        """
        if not self.is_available():
            return []
        
        try:
            subreddit = self.reddit.subreddit(subreddit_name)
            
            # Search posts
            posts = subreddit.search(
                query, 
                sort='new', 
                time_filter=time_filter, 
                limit=limit
            )
            
            processed_posts = []
            
            for post in posts:
                try:
                    # Skip removed or deleted posts
                    if post.selftext == '[removed]' or post.selftext == '[deleted]':
                        continue
                    
                    # Get post content
                    content = post.title
                    if post.selftext and len(post.selftext.strip()) > 0:
                        content += " " + post.selftext[:500]  # Limit content length
                    
                    # Calculate engagement score
                    engagement = post.score + post.num_comments
                    
                    processed_post = {
                        'id': post.id,
                        'content': content,
                        'author': str(post.author) if post.author else 'unknown',
                        'timestamp': datetime.fromtimestamp(post.created_utc),
                        'engagement': max(0, engagement),  # Ensure non-negative
                        'source': 'reddit',
                        'subreddit': subreddit_name,
                        'original_url': f"https://reddit.com{post.permalink}"
                    }
                    
                    processed_posts.append(processed_post)
                    
                except Exception as e:
                    logger.error(f"Error processing Reddit post {post.id}: {e}")
                    continue
            
            logger.info(f"Collected {len(processed_posts)} posts from r/{subreddit_name} for query: {query}")
            return processed_posts
            
        except Exception as e:
            logger.error(f"Error searching r/{subreddit_name} for {query}: {e}")
            return []
    
    def get_company_posts(self, company_data: Dict, max_results: int = 50) -> List[Dict]:
        """
        Get Reddit posts for a specific company across financial subreddits
        
        Args:
            company_data: Dictionary with ticker, company name, and keywords
            max_results: Maximum posts to collect
            
        Returns:
            List of processed posts with company context
        """
        if not self.is_available():
            return []
        
        try:
            all_posts = []
            subreddits = self.get_financial_subreddits()
            
            # Build search queries
            queries = []
            
            # Add ticker as primary query
            ticker = company_data.get('ticker', '')
            if ticker:
                queries.append(f"${ticker}")  # Stock symbol format
                queries.append(ticker)  # Plain ticker
            
            # Add company name if it's not too generic
            company_name = company_data.get('name', '')
            if company_name and len(company_name.split()) <= 3:  # Avoid very long names
                queries.append(f'"{company_name}"')
            
            # Add specific keywords (limit to avoid too many API calls)
            keywords = company_data.get('keywords', [])[:2]  # Limit to first 2 keywords
            for keyword in keywords:
                if len(keyword) > 3 and keyword.lower() not in company_name.lower():
                    queries.append(f'"{keyword}"')
            
            # Limit queries to avoid excessive API calls
            queries = queries[:3]
            
            posts_per_query = max(5, max_results // (len(queries) * len(subreddits)))
            
            for query in queries:
                for subreddit in subreddits[:5]:  # Limit to top 5 subreddits
                    try:
                        posts = self.search_subreddit_posts(
                            subreddit, 
                            query, 
                            limit=posts_per_query
                        )
                        
                        # Add company context
                        for post in posts:
                            post['ticker'] = company_data['ticker']
                            post['company'] = company_data['name']
                            post['industry'] = company_data.get('industry', 'unknown')
                        
                        all_posts.extend(posts)
                        
                        # Small delay between requests
                        time.sleep(0.5)
                        
                        if len(all_posts) >= max_results:
                            break
                            
                    except Exception as e:
                        logger.error(f"Error searching r/{subreddit} for {query}: {e}")
                        continue
                
                if len(all_posts) >= max_results:
                    break
            
            # Remove duplicates based on content similarity
            unique_posts = self.remove_duplicate_posts(all_posts)
            
            return unique_posts[:max_results]
            
        except Exception as e:
            logger.error(f"Error getting Reddit posts for {company_data.get('name', 'unknown')}: {e}")
            return []
    
    def remove_duplicate_posts(self, posts: List[Dict]) -> List[Dict]:
        """Remove duplicate posts based on content similarity"""
        unique_posts = []
        seen_content = set()
        
        for post in posts:
            # Create a simplified version of content for comparison
            content_key = re.sub(r'\W+', '', post['content'][:100].lower())
            
            if content_key not in seen_content:
                seen_content.add(content_key)
                unique_posts.append(post)
        
        return unique_posts
    
    def collect_all_companies(self, companies_config: Dict, max_per_company: int = 25) -> List[Dict]:
        """
        Collect Reddit posts for all companies across industries
        
        Args:
            companies_config: Configuration dict with industries and companies
            max_per_company: Maximum posts per company
            
        Returns:
            List of all collected posts
        """
        if not self.is_available():
            logger.warning("Reddit service not available for collection")
            return []
        
        all_posts = []
        
        for industry, companies in companies_config.items():
            logger.info(f"Collecting Reddit data for {industry} industry")
            
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
                    logger.error(f"Error collecting Reddit posts for {company.get('name', 'unknown')}: {e}")
                    continue
        
        logger.info(f"Collected {len(all_posts)} total posts from Reddit")
        return all_posts 