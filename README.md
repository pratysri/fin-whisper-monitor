# Fin-Whisper-Monitor 📊

A real-time financial sentiment analysis dashboard that monitors social media and news sources to provide insights into market sentiment across different industries and companies.

![Dashboard Preview](https://img.shields.io/badge/Status-Live-brightgreen)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)
![Vite](https://img.shields.io/badge/Vite-5.4.1-purple)

## 🚀 Features

### 📈 **Real-time Sentiment Analysis**
- Monitor sentiment across multiple sources: Twitter, Reddit, StockTwits, and News
- Live sentiment scoring with confidence levels
- Industry-specific sentiment breakdowns

### 🏢 **Industry Coverage**
- **Technology**: Apple, Microsoft, NVIDIA, Tesla, Meta, and more
- **Finance**: JPMorgan Chase, Bank of America, Goldman Sachs, and more
- **Healthcare**: Johnson & Johnson, UnitedHealth, Pfizer, and more
- **Energy**: Exxon Mobil, Chevron, ConocoPhillips, and more
- **Retail**: Amazon, Walmart, Home Depot, Costco, and more
- **Aerospace**: Boeing, Lockheed Martin, Raytheon, and more

### 🎛️ **Interactive Dashboard**
- **View Toggle**: Switch between card and table views for posts
- **Advanced Filtering**: Filter by source, sentiment, and search terms
- **Statistics Panel**: Real-time sentiment statistics and metrics
- **Industry Grid**: Comprehensive industry sentiment overview
- **Detailed Views**: Click "View All Companies" for industry-specific analysis

### 🎨 **Modern UI/UX**
- Dark theme optimized for financial dashboards
- Responsive design for desktop and mobile
- Real-time updates with live indicators
- Professional financial data visualization

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite for fast development
- **Styling**: Tailwind CSS with shadcn/ui components
- **Charts**: Recharts for data visualization
- **Routing**: React Router for navigation
- **State Management**: React Query for data fetching

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/pratysri/fin-whisper-monitor.git
   cd fin-whisper-monitor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:8080` (or the port shown in terminal)

## 🎯 Usage

### Dashboard Overview
- **Main Dashboard**: View overall market sentiment and industry breakdowns
- **Search & Filter**: Use the search bar to find specific companies or filter by sentiment/source
- **Industry Analysis**: Click on any industry card to see detailed company analysis
- **View Modes**: Toggle between card and table views for different data presentations

### Key Components
- **StatsPanel**: Shows sentiment distribution across all posts
- **OverallSentimentChart**: Visual representation of market sentiment
- **IndustryGrid**: Industry-wise sentiment analysis with top companies
- **SentimentFeed**: Real-time posts with sentiment analysis
- **FilterPanel**: Advanced filtering options for sources and sentiments

## 📊 Data Sources

The dashboard currently uses mock data to demonstrate the interface and functionality. In a production environment, this would integrate with:

- **Social Media APIs**: Twitter, Reddit, StockTwits
- **News APIs**: Financial news sources
- **Real-time Data**: Live sentiment analysis services
- **Market Data**: Stock prices and market indicators

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Project Structure
```
src/
├── components/      # Reusable UI components
├── pages/          # Main application pages
├── constants/      # Configuration and constants
├── hooks/          # Custom React hooks
├── lib/            # Utility functions
└── ui/             # shadcn/ui components
```

## 🎨 Customization

### Adding New Industries
1. Update `INDUSTRY_ICONS` in `src/constants/dashboard.ts`
2. Add industry data in `src/pages/Index.tsx`
3. Add company list in `src/pages/Industry.tsx`

### Styling
- Modify `src/index.css` for global styles
- Use Tailwind CSS classes for component styling
- Update color schemes in `src/constants/dashboard.ts`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 🔗 Links

- **Live Demo**: [Coming Soon]
- **Issues**: [GitHub Issues](https://github.com/pratysri/fin-whisper-monitor/issues)
- **Discussions**: [GitHub Discussions](https://github.com/pratysri/fin-whisper-monitor/discussions)

---

**Built with ❤️ for financial sentiment analysis**
