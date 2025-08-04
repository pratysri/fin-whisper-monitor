#!/usr/bin/env python3
"""
Development runner for the Real-Time Market Sentiment Analyzer Backend

This script provides a convenient way to run the backend in development mode
with helpful debugging features and automatic reloading.
"""

import os
import sys
import logging
from datetime import datetime

# Set development environment
os.environ['FLASK_ENV'] = 'development'

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from tasks.data_collector import DataCollector

# Configure logging for development
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('development.log')
    ]
)

logger = logging.getLogger(__name__)

def show_startup_info():
    """Display helpful startup information"""
    print("\n" + "="*60)
    print("🚀 REAL-TIME MARKET SENTIMENT ANALYZER - BACKEND")
    print("="*60)
    print("Development Mode")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("\n📍 Available Endpoints:")
    print("   • Health Check: http://localhost:5001/health")
    print("   • Get Posts: http://localhost:5001/api/posts")
    print("   • Get Stats: http://localhost:5001/api/stats")
    print("\n🔧 Development Features:")
    print("   • Auto-reload on file changes")
    print("   • Detailed error messages")
    print("   • Debug logging to development.log")
    print("   • No background scheduler (manual testing only)")
    print("\n📝 Quick Test Commands:")
    print("   python test_backend.py  # Run all tests")
    print("   python -c \"from tasks.data_collector import DataCollector; collector = DataCollector(); print(collector.test_services())\"")
    print("\n⚠️  Make sure you have:")
    print("   • API keys configured in .env file")
    print("   • Dependencies installed (pip install -r requirements.txt)")
    print("="*60)

def test_initial_setup():
    """Test basic setup before starting server"""
    logger.info("Testing initial setup...")
    
    # Test API keys
    from config import Config
    api_status = {
        'Twitter': bool(Config.TWITTER_BEARER_TOKEN),
        'Reddit': bool(Config.REDDIT_CLIENT_ID and Config.REDDIT_CLIENT_SECRET),
        'NewsAPI': bool(Config.NEWS_API_KEY)
    }
    
    logger.info("API Keys Status:")
    for service, configured in api_status.items():
        status = "✅ Configured" if configured else "⚠️  Not configured"
        logger.info(f"   {service}: {status}")
    
    if not any(api_status.values()):
        logger.warning("No API keys configured - only news RSS feeds will work")
        logger.warning("Configure API keys in .env file for full functionality")

def manual_data_collection():
    """Provide manual data collection function for development"""
    try:
        collector = DataCollector()
        
        print("\n🔄 Manual Data Collection Available:")
        print("   collector.collect_all_data()           # Collect from all sources")
        print("   collector.collect_specific_source('twitter', 50)  # Specific source")
        print("   collector.test_services()              # Test all services")
        
        # Make collector globally available for development
        globals()['collector'] = collector
        logger.info("DataCollector instance available as 'collector' variable")
        
    except Exception as e:
        logger.error(f"Failed to initialize DataCollector: {e}")

if __name__ == "__main__":
    show_startup_info()
    test_initial_setup()
    manual_data_collection()
    
    try:
        app = create_app()
        
        logger.info("\n🌐 Starting Flask development server...")
        logger.info("   Server will auto-reload on file changes")
        logger.info("   Press Ctrl+C to stop\n")
        
        # Run in development mode with debug features
        app.run(
            host='0.0.0.0',
            port=int(os.environ.get('PORT', 5001)),
            debug=True,
            use_reloader=True,
            use_debugger=True
        )
        
    except KeyboardInterrupt:
        logger.info("\n👋 Development server stopped")
    except Exception as e:
        logger.error(f"❌ Failed to start server: {e}")
        sys.exit(1) 