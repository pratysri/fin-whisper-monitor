
export const SENTIMENT_COLORS = {
  positive: '#10b981', // emerald-500
  neutral: '#6b7280',  // gray-500
  negative: '#ef4444'  // red-500
} as const;

export const SENTIMENT_CONFIG = {
  positive: { 
    label: 'Positive', 
    color: 'dashboard-sentiment-positive',
    emoji: '📈',
    bgColor: 'bg-emerald-500/20',
    textColor: 'text-emerald-400'
  },
  neutral: { 
    label: 'Neutral', 
    color: 'dashboard-sentiment-neutral',
    emoji: '➡️',
    bgColor: 'bg-gray-500/20',
    textColor: 'text-gray-400'
  },
  negative: { 
    label: 'Negative', 
    color: 'dashboard-sentiment-negative',
    emoji: '📉',
    bgColor: 'bg-red-500/20',
    textColor: 'text-red-400'
  }
} as const;

export const SOURCE_CONFIG = {
  twitter: { 
    label: 'Twitter',
    color: 'text-blue-400', 
    bgColor: 'bg-blue-500/20' 
  },
  reddit: { 
    label: 'Reddit',
    color: 'text-orange-400', 
    bgColor: 'bg-orange-500/20' 
  },
  stocktwits: { 
    label: 'StockTwits',
    color: 'text-green-400', 
    bgColor: 'bg-green-500/20' 
  },
  news: { 
    label: 'News',
    color: 'text-purple-400', 
    bgColor: 'bg-purple-500/20' 
  }
} as const;

export const INDUSTRY_ICONS = {
  technology: '💻',
  finance: '🏦',
  healthcare: '🏥',
  energy: '⚡',
  retail: '🛍️',
  aerospace: '✈️'
} as const;
