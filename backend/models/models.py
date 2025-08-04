from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
import uuid
from sqlalchemy import Column, String, DateTime, Float, Integer, Text, ForeignKey, Index, create_engine
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker

Base = declarative_base()

class IndustryModel(Base):
    """SQLAlchemy model for industries"""
    __tablename__ = 'industries'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(50), nullable=False, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": str(self.id),
            "name": self.name,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'IndustryModel':
        return cls(
            id=uuid.UUID(data['id']) if 'id' in data else None,
            name=data['name'],
            created_at=datetime.fromisoformat(data['created_at']) if isinstance(data.get('created_at'), str) else data.get('created_at')
        )

class CompanyModel(Base):
    """SQLAlchemy model for companies"""
    __tablename__ = 'companies'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticker = Column(String(10), nullable=False, unique=True)
    name = Column(String(200), nullable=False)
    industry_id = Column(UUID(as_uuid=True), ForeignKey('industries.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    industry = relationship("IndustryModel", backref="companies")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": str(self.id),
            "ticker": self.ticker,
            "name": self.name,
            "industry_id": str(self.industry_id),
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'CompanyModel':
        return cls(
            id=uuid.UUID(data['id']) if 'id' in data else None,
            ticker=data['ticker'],
            name=data['name'],
            industry_id=uuid.UUID(data['industry_id']),
            created_at=datetime.fromisoformat(data['created_at']) if isinstance(data.get('created_at'), str) else data.get('created_at')
        )

class SentimentPostModel(Base):
    """SQLAlchemy model for sentiment posts"""
    __tablename__ = 'sentiment_posts'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey('companies.id'), nullable=False)
    content = Column(Text, nullable=False)
    sentiment = Column(String(20), nullable=False, index=True)
    confidence = Column(Float, nullable=False)
    source = Column(String(50), nullable=False, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    author = Column(String(200), nullable=False)
    engagement = Column(Integer, default=0)
    original_url = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    company = relationship("CompanyModel", backref="sentiment_posts")
    
    __table_args__ = (
        Index('idx_timestamp_desc', timestamp.desc()),
        Index('idx_company_timestamp', company_id, timestamp.desc()),
        Index('idx_source_timestamp', source, timestamp.desc()),
    )

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": str(self.id),
            "company_id": str(self.company_id),
            "content": self.content,
            "sentiment": self.sentiment,
            "confidence": self.confidence,
            "source": self.source,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "author": self.author,
            "engagement": self.engagement,
            "original_url": self.original_url,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "company": self.company.to_dict() if self.company else None
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'SentimentPostModel':
        return cls(
            id=uuid.UUID(data['id']) if 'id' in data else None,
            company_id=uuid.UUID(data['company_id']),
            content=data['content'],
            sentiment=data['sentiment'],
            confidence=data['confidence'],
            source=data['source'],
            author=data['author'],
            engagement=data['engagement'],
            timestamp=datetime.fromisoformat(data['timestamp']) if isinstance(data.get('timestamp'), str) else data.get('timestamp'),
            original_url=data.get('original_url'),
            created_at=datetime.fromisoformat(data['created_at']) if isinstance(data.get('created_at'), str) else data.get('created_at')
        )

class SentimentPost:
    """Data access layer for sentiment posts"""
    
    def __init__(self, db_uri: str):
        self.engine = create_engine(db_uri)
        Base.metadata.create_all(self.engine)
        Session = sessionmaker(bind=self.engine)
        self.session = Session()
    
    def create_post(self, 
                   company_id: str,
                   content: str,
                   sentiment: str,
                   confidence: float,
                   source: str,
                   author: str,
                   engagement: int,
                   timestamp: Optional[datetime] = None,
                   original_url: Optional[str] = None) -> str:
        post = SentimentPostModel(
            company_id=uuid.UUID(company_id),
            content=content,
            sentiment=sentiment,
            confidence=confidence,
            source=source,
            timestamp=timestamp or datetime.utcnow(),
            author=author,
            engagement=engagement,
            original_url=original_url
        )
        self.session.add(post)
        self.session.commit()
        return str(post.id)
    
    def get_posts(self, 
                  limit: int = 100,
                  offset: int = 0,
                  sources: Optional[List[str]] = None,
                  sentiments: Optional[List[str]] = None,
                  company_ids: Optional[List[str]] = None,
                  search_query: Optional[str] = None,
                  hours_back: int = 24) -> List[Dict]:
        query = self.session.query(SentimentPostModel).join(SentimentPostModel.company)
        if hours_back:
            time_cutoff = datetime.utcnow() - timedelta(hours=hours_back)
            query = query.filter(SentimentPostModel.timestamp >= time_cutoff)
        if sources:
            query = query.filter(SentimentPostModel.source.in_(sources))
        if sentiments:
            query = query.filter(SentimentPostModel.sentiment.in_(sentiments))
        if company_ids:
            query = query.filter(SentimentPostModel.company_id.in_([uuid.UUID(id) for id in company_ids]))
        if search_query:
            search_term = f"%{search_query}%"
            query = query.filter(SentimentPostModel.content.ilike(search_term))
        posts = query.order_by(SentimentPostModel.timestamp.desc())\
                    .offset(offset)\
                    .limit(limit)\
                    .all()
        return [post.to_dict() for post in posts]
    
    def get_post_by_id(self, post_id: str) -> Optional[Dict[str, Any]]:
        try:
            post = self.session.query(SentimentPostModel)\
                              .filter(SentimentPostModel.id == uuid.UUID(post_id))\
                              .first()
            if not post:
                return None
            return post.to_dict()
        except (ValueError, AttributeError):
            return None
    
    def delete_old_posts(self, days_old: int = 7) -> int:
        cutoff_date = datetime.utcnow() - timedelta(days=days_old)
        deleted_count = self.session.query(SentimentPostModel)\
                                   .filter(SentimentPostModel.timestamp < cutoff_date)\
                                   .count()
        self.session.query(SentimentPostModel)\
                   .filter(SentimentPostModel.timestamp < cutoff_date)\
                   .delete()
        self.session.commit()
        return deleted_count
    
    def get_posts_count(self, 
                       sources: Optional[List[str]] = None,
                       sentiments: Optional[List[str]] = None,
                       company_ids: Optional[List[str]] = None,
                       search_query: Optional[str] = None,
                       hours_back: int = 24) -> int:
        query = self.session.query(SentimentPostModel)
        if hours_back:
            time_cutoff = datetime.utcnow() - timedelta(hours=hours_back)
            query = query.filter(SentimentPostModel.timestamp >= time_cutoff)
        if sources:
            query = query.filter(SentimentPostModel.source.in_(sources))
        if sentiments:
            query = query.filter(SentimentPostModel.sentiment.in_(sentiments))
        if company_ids:
            query = query.filter(SentimentPostModel.company_id.in_([uuid.UUID(id) for id in company_ids]))
        if search_query:
            search_term = f"%{search_query}%"
            query = query.filter(SentimentPostModel.content.ilike(search_term))
        return query.count()
    
    def check_duplicate(self, content: str, source: str, author: str, timestamp_window_minutes: int = 60) -> bool:
        time_window = datetime.utcnow() - timedelta(minutes=timestamp_window_minutes)
        existing_post = self.session.query(SentimentPostModel)\
                                   .filter(
                                       SentimentPostModel.content == content,
                                       SentimentPostModel.source == source,
                                       SentimentPostModel.author == author,
                                       SentimentPostModel.timestamp >= time_window
                                   ).first()
        return existing_post is not None
    
    def close(self):
        self.session.close() 