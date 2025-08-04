# Real-Time Market Sentiment Analyzer - Backend

A production-ready backend for analyzing public sentiment about companies and financial assets across multiple sources including Twitter, Reddit, StockTwits, and financial news.

## Features

- **Multi-Source Data Collection**: Collects sentiment data from Twitter, Reddit, StockTwits, and financial news sources
- **Advanced Sentiment Analysis**: Uses VADER sentiment analysis enhanced with financial context
- **Real-time Processing**: Background scheduling for continuous data collection
- **Supabase Storage**: Efficient PostgreSQL database with real-time capabilities
- **RESTful API**: Clean API endpoints with filtering and pagination
- **Rate Limiting**: Respects API rate limits to avoid hitting usage quotas
- **Production Ready**: Structured for clean deployment with proper error handling

## Tech Stack

- **Backend**: Flask (Python)
- **Database**: Supabase (PostgreSQL)
- **Sentiment Analysis**: VADER + Financial Context Enhancement
- **APIs**: Twitter API v2, Reddit API, StockTwits API, NewsAPI
- **Scheduling**: APScheduler for background tasks
- **Deployment**: Docker-ready with Gunicorn

## Quick Start

### 1. Prerequisites

- Python 3.8+
- Supabase account and project
- API Keys (see configuration section)

### 2. Installation

```bash
# Clone the repository (if part of a larger project)
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configuration

Copy the example environment file and configure your API keys:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Supabase Configuration
DATABASE_URL=your_supabase_connection_string
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key

# Twitter API v2 Bearer Token
TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here

# Reddit API Credentials
REDDIT_CLIENT_ID=your_reddit_client_id_here
REDDIT_CLIENT_SECRET=your_reddit_client_secret_here
REDDIT_USER_AGENT=SentimentAnalyzer/1.0

# News API Key (optional)
NEWS_API_KEY=your_news_api_key_here

# Configuration
REQUESTS_PER_MINUTE=30
DATA_RETENTION_DAYS=7
FLASK_ENV=development
PORT=5001
```

### 4. API Key Setup

#### Twitter API v2
1. Apply for Twitter Developer access at [developer.twitter.com](https://developer.twitter.com)
2. Create a new project/app
3. Generate a Bearer Token
4. Add the Bearer Token to your `.env` file

#### Reddit API
1. Create a Reddit account and go to [reddit.com/prefs/apps](https://reddit.com/prefs/apps)
2. Click "Create App" or "Create Another App"
3. Choose "script" type
4. Note the client ID (under the app name) and client secret
5. Add both to your `.env` file

#### NewsAPI (Optional)
1. Sign up at [newsapi.org](https://newsapi.org)
2. Get your free API key
3. Add to your `.env` file

#### Supabase Setup
1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Get your project URL and anon key from the project settings
4. Add them to your `.env` file

### 5. Run the Application

```bash
# Development mode
python run_development.py

# Production mode with Gunicorn
gunicorn --bind 0.0.0.0:5001 --workers 4 app:create_app()
```

The API will be available at `http://localhost:5001`

## API Endpoints

### Get Posts
```http
GET /api/posts
```

Query parameters:
- `limit`: Maximum number of posts (default: 100, max: 500)
- `offset`: Pagination offset (default: 0)
- `sources`: Filter by sources (twitter,reddit,stocktwits,news)
- `sentiments`: Filter by sentiment (positive,neutral,negative)
- `industries`: Filter by industry (technology,finance,healthcare,energy,retail,aerospace)
- `search`: Search in ticker, company, or content
- `hours_back`: How many hours back to search (default: 24)

Example:
```http
GET /api/posts?sources=twitter,reddit&sentiments=positive&search=AAPL&limit=50
```

### Get Single Post
```http
GET /api/posts/{post_id}
```

### Get Statistics
```http
GET /api/stats
```

Returns overall sentiment breakdown, source distribution, and industry analysis.

### Health Check
```http
GET /health
```

## Data Collection

The system automatically collects data from all sources every 15 minutes. You can also trigger manual collection:

### Background Scheduler

The system uses APScheduler to:
- Collect data every 15 minutes
- Clean up old data daily at 2 AM
- Maintain data retention policy (7 days default)

### Manual Collection

You can test and trigger collection manually through the DataCollector class:

```python
from tasks.data_collector import DataCollector

# Initialize
collector = DataCollector()

# Test services
test_results = collector.test_services()

# Collect from all sources
collector.collect_all_data()

# Collect from specific source
collector.collect_specific_source('twitter', max_items=100)
```

## Companies Monitored

The system monitors major companies across 6 industries:

- **Technology**: Apple, Google, Microsoft, NVIDIA, Tesla
- **Finance**: JPMorgan, Bank of America, Goldman Sachs, Wells Fargo, Morgan Stanley
- **Healthcare**: Johnson & Johnson, Pfizer, UnitedHealth, Abbott, Merck
- **Energy**: Exxon Mobil, Chevron, ConocoPhillips, Schlumberger, EOG Resources
- **Retail**: Amazon, Walmart, Home Depot, Costco, Target
- **Aerospace**: Boeing, Lockheed Martin, Raytheon, Northrop Grumman, General Dynamics

You can modify the companies list in `config.py`.

## Sentiment Analysis

The system uses an enhanced VADER sentiment analyzer with financial context:

### Financial Keywords
- **Positive**: bullish, moon, rocket, gains, profit, rally, surge, boom, breakout, uptrend
- **Negative**: bearish, crash, dump, loss, decline, fall, drop, plunge, recession, bankruptcy

### Market Expressions
- Recognizes financial slang like "to the moon", "diamond hands", "HODL"
- Adjusts sentiment based on financial context
- Provides confidence scores (50-95%)

## Production Deployment

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "app:create_app()"]
```

### Environment Variables for Production

```env
FLASK_ENV=production
DATABASE_URL=your_supabase_connection_string
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
# Add your production API keys
```

### Scaling Considerations

1. **Database**: Use Supabase Atlas or a properly configured Supabase cluster
2. **Rate Limiting**: Monitor API usage and adjust rate limits accordingly
3. **Caching**: Consider Redis for caching frequent queries
4. **Load Balancing**: Use multiple worker processes with Gunicorn
5. **Monitoring**: Implement logging and monitoring (ELK stack, Datadog, etc.)

## Rate Limiting

The system implements intelligent rate limiting:

- **Twitter**: 300 requests per 15 minutes
- **Reddit**: 60 requests per minute
- **StockTwits**: 200 requests per hour
- **NewsAPI**: 100 requests per day (free tier)

## Error Handling

- Graceful degradation when APIs are unavailable
- Automatic retry with exponential backoff
- Comprehensive logging for debugging
- Fallback to alternative sources when possible

## Monitoring

Monitor the system through:

1. **Logs**: Structured logging with different levels
2. **Health Endpoint**: `/health` for uptime monitoring
3. **Database Metrics**: Post counts and collection statistics
4. **API Status**: Service availability checking

## Troubleshooting

### Common Issues

1. **Supabase Connection**: Ensure Supabase is running and connection string is correct
2. **API Keys**: Verify all API keys are valid and have proper permissions
3. **Rate Limits**: Check if you're hitting API rate limits
4. **Network Issues**: Ensure the server can access external APIs

### Debug Mode

Run in debug mode for detailed logging:

```bash
FLASK_ENV=development python app.py
```

### Testing Services

Test individual services:

```python
from tasks.data_collector import DataCollector
collector = DataCollector()
status = collector.test_services()
print(status)
```

## Contributing

1. Follow the existing code structure
2. Add comprehensive error handling
3. Include logging for debugging
4. Test with multiple data sources
5. Maintain rate limiting compliance

## License

This project is part of the Real-Time Market Sentiment Analyzer system. 