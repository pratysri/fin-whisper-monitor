# API Setup Instructions

## Stock Price API Setup (Optional)

Your app is now working with **realistic mock data** that simulates live stock prices. If you want to use real stock prices, follow these steps:

### Option 1: Use Finnhub (Recommended - Free Tier Available)

1. Go to [Finnhub.io](https://finnhub.io/register)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Open `src/services/stockService.ts`
5. Replace `'your_api_key_here'` with your actual API key:

```typescript
const FINNHUB_API_KEY = 'your_actual_api_key_here';
```

### Option 2: Keep Using Mock Data (Default)

The app is already configured to use realistic mock data that:
- Updates every 30 seconds with slight price variations
- Generates sentiment posts in real-time
- Simulates live market conditions
- Works without any API setup

## Features Now Working:

✅ **Live Stock Prices** - Real or simulated prices updating every 30 seconds  
✅ **Dynamic Sentiment** - Realistic sentiment posts with trends and momentum  
✅ **Company Detail Pages** - Click any company ticker to see detailed view  
✅ **Live Updates** - Real-time refresh with update timestamps  
✅ **Clickable Navigation** - Industry grid companies link to detail pages  

## How to Test:

1. Start your development server: `npm run dev`
2. Click on any company ticker (e.g., AAPL, GOOGL) to see the detail page
3. Watch the prices and sentiment update every 30 seconds
4. Click the refresh button in the header for manual updates

## Data Sources:

- **Stock Prices**: Mock data that simulates real market movements
- **Sentiment**: Generated realistic social media posts with trending behavior
- **Company Info**: Static company data (expandable with real API)

The app looks and feels like it's using live data even with the mock implementation!