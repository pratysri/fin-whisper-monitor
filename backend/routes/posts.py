from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.models import SentimentPostModel, CompanyModel
from config import Config

logger = logging.getLogger(__name__)

posts_bp = Blueprint('posts', __name__)

# Initialize database connection
engine = create_engine(Config.SQLALCHEMY_DATABASE_URI)
Session = sessionmaker(bind=engine)

@posts_bp.route('/posts', methods=['GET'])
def get_posts():
    """Get posts with optional filtering"""
    try:
        # Get and validate query parameters
        limit = min(int(request.args.get('limit', 100)), 500)
        offset = int(request.args.get('offset', 0))
        sources = request.args.getlist('sources') or request.args.get('sources', '').split(',')
        sources = [s.strip() for s in sources if s.strip()]
        sentiments = request.args.getlist('sentiments') or request.args.get('sentiments', '').split(',')
        sentiments = [s.strip() for s in sentiments if s.strip()]
        company_ids = request.args.getlist('company_ids') or request.args.get('company_ids', '').split(',')
        company_ids = [s.strip() for s in company_ids if s.strip()]
        search_query = request.args.get('search', '').strip()
        hours_back = int(request.args.get('hours_back', 24))
        
        # Create database session
        session = Session()
        
        try:
            # Build query
            query = session.query(SentimentPostModel).join(SentimentPostModel.company)
            
            # Apply filters
            if hours_back:
                time_cutoff = datetime.utcnow() - timedelta(hours=hours_back)
                query = query.filter(SentimentPostModel.timestamp >= time_cutoff)
            
            if sources:
                query = query.filter(SentimentPostModel.source.in_(sources))
            
            if sentiments:
                query = query.filter(SentimentPostModel.sentiment.in_(sentiments))
            
            if company_ids:
                query = query.filter(SentimentPostModel.company_id.in_(company_ids))
            
            if search_query:
                search_term = f"%{search_query}%"
                query = query.filter(SentimentPostModel.content.ilike(search_term))
            
            # Execute query with pagination
            total_count = query.count()
            posts = query.order_by(SentimentPostModel.timestamp.desc())\
                        .offset(offset)\
                        .limit(limit)\
                        .all()
            
            # Format response
            return jsonify({
                "posts": [post.to_dict() for post in posts],
                "total": total_count,
                "limit": limit,
                "offset": offset
            })
            
        finally:
            session.close()
        
    except ValueError as e:
        logger.error(f"Invalid parameter in posts request: {e}")
        return jsonify({"error": "Invalid parameter provided"}), 400
    except Exception as e:
        logger.error(f"Error in posts endpoint: {e}")
        return jsonify({"error": "Internal server error"}), 500

@posts_bp.route('/posts/<post_id>', methods=['GET'])
def get_post(post_id):
    """Get a single post by ID"""
    try:
        session = Session()
        try:
            post = session.query(SentimentPostModel)\
                         .filter(SentimentPostModel.id == post_id)\
                         .first()
            
            if not post:
                return jsonify({"error": "Post not found"}), 404
            
            return jsonify(post.to_dict())
        finally:
            session.close()
    except Exception as e:
        logger.error(f"Error getting post {post_id}: {e}")
        return jsonify({"error": "Internal server error"}), 500

@posts_bp.route('/companies', methods=['GET'])
def get_companies():
    """Get all companies"""
    try:
        session = Session()
        try:
            companies = session.query(CompanyModel).all()
            return jsonify([company.to_dict() for company in companies])
        finally:
            session.close()
    except Exception as e:
        logger.error(f"Error getting companies: {e}")
        return jsonify({"error": "Internal server error"}), 500

@posts_bp.route('/stats', methods=['GET'])
def get_stats():
    """Get overall statistics (placeholder until database integration)"""
    try:
        return jsonify({
            "message": "Stats endpoint ready for database integration",
            "timestamp": datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in stats endpoint: {e}")
        return jsonify({"error": "Internal server error"}), 500

@posts_bp.route('/companies/<industry>', methods=['GET'])
def get_companies_by_industry(industry):
    """Get companies for a specific industry"""
    try:
        session = Session()
        try:
            companies = session.query(CompanyModel).filter(CompanyModel.industry.has(name=industry.capitalize())).all()
            return jsonify([company.to_dict() for company in companies])
        finally:
            session.close()
    except Exception as e:
        logger.error(f"Error getting companies for industry {industry}: {e}")
        return jsonify({"error": "Internal server error"}), 500

@posts_bp.route('/sentiment/company/<ticker>', methods=['GET'])
def get_company_sentiment(ticker):
    """Get average sentiment for a company by ticker"""
    try:
        session = Session()
        try:
            company = session.query(CompanyModel).filter_by(ticker=ticker.upper()).first()
            if not company:
                return jsonify({"error": "Company not found"}), 404
            posts = session.query(SentimentPostModel).filter_by(company_id=company.id).all()
            if not posts:
                return jsonify({"sentiment": None, "count": 0})
            sentiments = [post.sentiment for post in posts]
            # Map sentiment to score
            sentiment_map = {"positive": 1, "neutral": 0, "negative": -1}
            scores = [sentiment_map.get(s, 0) for s in sentiments]
            avg_score = sum(scores) / len(scores)
            return jsonify({"sentiment": avg_score, "count": len(scores)})
        finally:
            session.close()
    except Exception as e:
        logger.error(f"Error getting sentiment for company {ticker}: {e}")
        return jsonify({"error": "Internal server error"}), 500

@posts_bp.route('/sentiment/industry/<industry>', methods=['GET'])
def get_industry_sentiment(industry):
    """Get average sentiment for an industry"""
    try:
        session = Session()
        try:
            companies = session.query(CompanyModel).filter(CompanyModel.industry.has(name=industry.capitalize())).all()
            if not companies:
                return jsonify({"sentiment": None, "count": 0})
            company_ids = [c.id for c in companies]
            posts = session.query(SentimentPostModel).filter(SentimentPostModel.company_id.in_(company_ids)).all()
            if not posts:
                return jsonify({"sentiment": None, "count": 0})
            sentiments = [post.sentiment for post in posts]
            sentiment_map = {"positive": 1, "neutral": 0, "negative": -1}
            scores = [sentiment_map.get(s, 0) for s in sentiments]
            avg_score = sum(scores) / len(scores)
            return jsonify({"sentiment": avg_score, "count": len(scores)})
        finally:
            session.close()
    except Exception as e:
        logger.error(f"Error getting sentiment for industry {industry}: {e}")
        return jsonify({"error": "Internal server error"}), 500

@posts_bp.route('/sentiment/market', methods=['GET'])
def get_market_sentiment():
    """Get average sentiment for the entire market"""
    try:
        session = Session()
        try:
            posts = session.query(SentimentPostModel).all()
            if not posts:
                return jsonify({"sentiment": None, "count": 0})
            sentiments = [post.sentiment for post in posts]
            sentiment_map = {"positive": 1, "neutral": 0, "negative": -1}
            scores = [sentiment_map.get(s, 0) for s in sentiments]
            avg_score = sum(scores) / len(scores)
            return jsonify({"sentiment": avg_score, "count": len(scores)})
        finally:
            session.close()
    except Exception as e:
        logger.error(f"Error getting market sentiment: {e}")
        return jsonify({"error": "Internal server error"}), 500

@posts_bp.route('/posts/company/<ticker>', methods=['GET'])
def get_posts_by_company(ticker):
    """Get posts for a specific company by ticker"""
    try:
        session = Session()
        try:
            company = session.query(CompanyModel).filter_by(ticker=ticker.upper()).first()
            if not company:
                return jsonify({"error": "Company not found"}), 404
            posts = session.query(SentimentPostModel).filter_by(company_id=company.id).order_by(SentimentPostModel.timestamp.desc()).all()
            return jsonify([post.to_dict() for post in posts])
        finally:
            session.close()
    except Exception as e:
        logger.error(f"Error getting posts for company {ticker}: {e}")
        return jsonify({"error": "Internal server error"}), 500

@posts_bp.route('/posts/industry/<industry>', methods=['GET'])
def get_posts_by_industry(industry):
    """Get posts for a specific industry"""
    try:
        session = Session()
        try:
            companies = session.query(CompanyModel).filter(CompanyModel.industry.has(name=industry.capitalize())).all()
            if not companies:
                return jsonify([])
            company_ids = [c.id for c in companies]
            posts = session.query(SentimentPostModel).filter(SentimentPostModel.company_id.in_(company_ids)).order_by(SentimentPostModel.timestamp.desc()).all()
            return jsonify([post.to_dict() for post in posts])
        finally:
            session.close()
    except Exception as e:
        logger.error(f"Error getting posts for industry {industry}: {e}")
        return jsonify({"error": "Internal server error"}), 500 