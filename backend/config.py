import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Supabase/PostgreSQL Configuration
    SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://kdcgormmstrevstfhihr.supabase.co')
    SUPABASE_ANON_KEY = os.environ.get('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkY2dvcm1tc3RyZXZzdGZoaWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNDA1NDIsImV4cCI6MjA2NjcxNjU0Mn0.ha6ZFSshvbet9YuOSDtmedpgrmnx-huj9mNAKZi_XA4')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or f"{SUPABASE_URL}/postgres"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # API Keys
    TWITTER_BEARER_TOKEN = os.environ.get('TWITTER_BEARER_TOKEN')
    REDDIT_CLIENT_ID = os.environ.get('REDDIT_CLIENT_ID')
    REDDIT_CLIENT_SECRET = os.environ.get('REDDIT_CLIENT_SECRET')
    REDDIT_USER_AGENT = os.environ.get('REDDIT_USER_AGENT', 'SentimentAnalyzer/1.0')
    NEWS_API_KEY = os.environ.get('NEWS_API_KEY')
    
    # Rate Limiting
    REQUESTS_PER_MINUTE = int(os.environ.get('REQUESTS_PER_MINUTE', 30))
    
    # Data Retention (days)
    DATA_RETENTION_DAYS = int(os.environ.get('DATA_RETENTION_DAYS', 7))
    
    # Companies to monitor
    COMPANIES = {
        "technology": [
            {"ticker": "AAPL", "name": "Apple"},
            {"ticker": "MSFT", "name": "Microsoft"},
            {"ticker": "GOOGL", "name": "Alphabet"},
            {"ticker": "NVDA", "name": "NVIDIA"},
            {"ticker": "META", "name": "Meta Platforms"},
            {"ticker": "AVGO", "name": "Broadcom"},
            {"ticker": "ORCL", "name": "Oracle"},
            {"ticker": "CSCO", "name": "Cisco"},
            {"ticker": "CRM", "name": "Salesforce"},
            {"ticker": "ADBE", "name": "Adobe"},
        ],
        "finance": [
            {"ticker": "JPM", "name": "JPMorgan Chase"},
            {"ticker": "BAC", "name": "Bank of America"},
            {"ticker": "WFC", "name": "Wells Fargo"},
            {"ticker": "MS", "name": "Morgan Stanley"},
            {"ticker": "GS", "name": "Goldman Sachs"},
            {"ticker": "SCHW", "name": "Charles Schwab"},
            {"ticker": "BLK", "name": "BlackRock"},
            {"ticker": "C", "name": "Citigroup"},
            {"ticker": "AXP", "name": "American Express"},
            {"ticker": "SPGI", "name": "S&P Global"},
        ],
        "healthcare": [
            {"ticker": "UNH", "name": "UnitedHealth Group"},
            {"ticker": "JNJ", "name": "Johnson & Johnson"},
            {"ticker": "LLY", "name": "Eli Lilly"},
            {"ticker": "MRK", "name": "Merck & Co."},
            {"ticker": "ABBV", "name": "AbbVie"},
            {"ticker": "PFE", "name": "Pfizer"},
            {"ticker": "TMO", "name": "Thermo Fisher Scientific"},
            {"ticker": "ABT", "name": "Abbott Laboratories"},
            {"ticker": "BMY", "name": "Bristol-Myers Squibb"},
            {"ticker": "AMGN", "name": "Amgen"},
        ],
        "energy": [
            {"ticker": "XOM", "name": "Exxon Mobil"},
            {"ticker": "CVX", "name": "Chevron"},
            {"ticker": "COP", "name": "ConocoPhillips"},
            {"ticker": "SLB", "name": "Schlumberger"},
            {"ticker": "EOG", "name": "EOG Resources"},
            {"ticker": "MPC", "name": "Marathon Petroleum"},
            {"ticker": "PXD", "name": "Pioneer Natural Resources"},
            {"ticker": "VLO", "name": "Valero Energy"},
            {"ticker": "PSX", "name": "Phillips 66"},
            {"ticker": "OXY", "name": "Occidental Petroleum"},
        ],
        "retail": [
            {"ticker": "WMT", "name": "Walmart"},
            {"ticker": "AMZN", "name": "Amazon"},
            {"ticker": "COST", "name": "Costco"},
            {"ticker": "HD", "name": "Home Depot"},
            {"ticker": "LOW", "name": "Lowe's"},
            {"ticker": "TGT", "name": "Target"},
            {"ticker": "CVS", "name": "CVS Health"},
            {"ticker": "WBA", "name": "Walgreens Boots Alliance"},
            {"ticker": "KR", "name": "Kroger"},
            {"ticker": "DG", "name": "Dollar General"},
        ],
        "aerospace": [
            {"ticker": "BA", "name": "Boeing"},
            {"ticker": "RTX", "name": "Raytheon Technologies"},
            {"ticker": "LMT", "name": "Lockheed Martin"},
            {"ticker": "NOC", "name": "Northrop Grumman"},
            {"ticker": "GD", "name": "General Dynamics"},
            {"ticker": "LHX", "name": "L3Harris Technologies"},
            {"ticker": "TDG", "name": "TransDigm Group"},
            {"ticker": "LDOS", "name": "Leidos Holdings"},
            {"ticker": "HII", "name": "Huntington Ingalls Industries"},
            {"ticker": "SPR", "name": "Spirit AeroSystems"},
        ],
    } 