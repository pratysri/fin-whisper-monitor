from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import re
import logging
from typing import Tuple, Dict

logger = logging.getLogger(__name__)

class FinancialSentimentAnalyzer:
    """Enhanced sentiment analyzer with financial context"""
    
    def __init__(self):
        self.analyzer = SentimentIntensityAnalyzer()
        
        # Financial keywords for sentiment boosting
        self.positive_financial_words = {
            'bullish', 'moon', 'rocket', 'gains', 'profit', 'rally', 'surge', 'boom',
            'breakout', 'uptrend', 'call', 'long', 'diamond hands', 'hodl', 'to the moon',
            'beat expectations', 'strong earnings', 'revenue growth', 'expansion',
            'acquisition', 'merger', 'upgrade', 'outperform', 'buy rating'
        }
        
        self.negative_financial_words = {
            'bearish', 'crash', 'dump', 'loss', 'decline', 'fall', 'drop', 'plunge',
            'recession', 'bankruptcy', 'downgrade', 'sell', 'short', 'puts', 'panic',
            'missed expectations', 'weak earnings', 'revenue decline', 'layoffs',
            'debt', 'loss', 'underperform', 'sell rating', 'downtrend'
        }
        
        # Stock market specific expressions
        self.market_expressions = {
            r'\b(?:to the moon|moon)\b': 0.3,  # Very positive
            r'\b(?:diamond hands|hodl)\b': 0.2,  # Positive
            r'\b(?:paper hands|panic sell)\b': -0.3,  # Negative
            r'\b(?:stonks|stonk)\b': 0.1,  # Slightly positive (meme)
            r'\$[A-Z]{1,5}\b': 0.1,  # Ticker mention (slightly positive engagement)
            r'\b(?:rocket|🚀)\b': 0.2,  # Rocket emoji/word
            r'\b(?:bull market|bullish)\b': 0.3,
            r'\b(?:bear market|bearish)\b': -0.3,
            r'\b(?:buy the dip)\b': 0.2,
            r'\b(?:pump and dump)\b': -0.4
        }
    
    def preprocess_text(self, text: str) -> str:
        """Preprocess text for better sentiment analysis"""
        # Convert to lowercase for processing but preserve original case for display
        processed_text = text.lower()
        
        # Replace common financial slang with standard words
        replacements = {
            'stonks': 'stocks good',
            'hodl': 'hold strong',
            'btfd': 'buy the dip opportunity',
            'yolo': 'confident investment',
            'fomo': 'fear missing opportunity',
            'dd': 'due diligence research',
            'ta': 'technical analysis',
            'rsi': 'relative strength index',
            'macd': 'moving average convergence'
        }
        
        for slang, replacement in replacements.items():
            processed_text = re.sub(rf'\b{slang}\b', replacement, processed_text)
        
        return processed_text
    
    def calculate_financial_adjustment(self, text: str) -> float:
        """Calculate sentiment adjustment based on financial context"""
        text_lower = text.lower()
        adjustment = 0.0
        
        # Check for positive financial words
        for word in self.positive_financial_words:
            if word in text_lower:
                adjustment += 0.1
        
        # Check for negative financial words
        for word in self.negative_financial_words:
            if word in text_lower:
                adjustment -= 0.1
        
        # Check for market expressions using regex
        for pattern, weight in self.market_expressions.items():
            if re.search(pattern, text_lower):
                adjustment += weight
        
        # Cap the adjustment
        return max(-0.5, min(0.5, adjustment))
    
    def analyze_sentiment(self, text: str, ticker: str = None) -> Tuple[str, float]:
        """
        Analyze sentiment of financial text
        
        Returns:
            Tuple of (sentiment_label, confidence_score)
        """
        try:
            # Preprocess text
            processed_text = self.preprocess_text(text)
            
            # Get VADER scores
            scores = self.analyzer.polarity_scores(processed_text)
            compound_score = scores['compound']
            
            # Apply financial context adjustment
            financial_adjustment = self.calculate_financial_adjustment(text)
            adjusted_score = compound_score + financial_adjustment
            
            # Cap the adjusted score
            adjusted_score = max(-1.0, min(1.0, adjusted_score))
            
            # Determine sentiment label with adjusted thresholds for financial context
            if adjusted_score >= 0.1:
                sentiment = 'positive'
            elif adjusted_score <= -0.1:
                sentiment = 'negative'
            else:
                sentiment = 'neutral'
            
            # Calculate confidence score based on absolute value and other VADER metrics
            confidence = abs(adjusted_score)
            
            # Boost confidence if we have strong individual sentiment components
            max_individual = max(scores['pos'], scores['neu'], scores['neg'])
            if max_individual > 0.5:
                confidence = min(1.0, confidence + 0.1)
            
            # Convert to percentage and ensure minimum confidence
            confidence_percentage = max(50, min(95, int(confidence * 100)))
            
            logger.debug(f"Text: {text[:50]}... | Original: {compound_score:.3f} | "
                        f"Adjusted: {adjusted_score:.3f} | Sentiment: {sentiment} | "
                        f"Confidence: {confidence_percentage}%")
            
            return sentiment, confidence_percentage
            
        except Exception as e:
            logger.error(f"Error analyzing sentiment: {e}")
            # Return neutral with low confidence as fallback
            return 'neutral', 50
    
    def batch_analyze(self, texts: list) -> list:
        """Analyze sentiment for multiple texts"""
        results = []
        for text in texts:
            sentiment, confidence = self.analyze_sentiment(text)
            results.append((sentiment, confidence))
        return results
    
    def get_sentiment_summary(self, texts: list) -> Dict:
        """Get overall sentiment summary for a collection of texts"""
        if not texts:
            return {"positive": 0, "neutral": 0, "negative": 0, "total": 0}
        
        results = self.batch_analyze(texts)
        
        counts = {"positive": 0, "neutral": 0, "negative": 0}
        total_confidence = 0
        
        for sentiment, confidence in results:
            counts[sentiment] += 1
            total_confidence += confidence
        
        total = len(texts)
        avg_confidence = total_confidence / total if total > 0 else 0
        
        return {
            "positive": round((counts["positive"] / total) * 100, 1),
            "neutral": round((counts["neutral"] / total) * 100, 1),
            "negative": round((counts["negative"] / total) * 100, 1),
            "total": total,
            "average_confidence": round(avg_confidence, 1)
        } 