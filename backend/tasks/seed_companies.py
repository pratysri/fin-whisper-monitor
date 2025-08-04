import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.models import IndustryModel, CompanyModel, Base
from config import Config
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import uuid

def seed_industries_and_companies():
    engine = create_engine(Config.SQLALCHEMY_DATABASE_URI)
    Session = sessionmaker(bind=engine)
    session = Session()
    try:
        for industry_name, companies in Config.COMPANIES.items():
            # Ensure industry exists
            industry = session.query(IndustryModel).filter_by(name=industry_name.capitalize()).first()
            if not industry:
                industry = IndustryModel(name=industry_name.capitalize())
                session.add(industry)
                session.commit()
            # Ensure companies exist
            for company in companies[:10]:  # Top 10 per industry
                ticker = company["ticker"]
                name = company["name"]
                db_company = session.query(CompanyModel).filter_by(ticker=ticker).first()
                if not db_company:
                    db_company = CompanyModel(ticker=ticker, name=name, industry_id=industry.id)
                    session.add(db_company)
            session.commit()
        print('✅ All industries and companies seeded.')
    except Exception as e:
        print(f'❌ Error seeding companies/industries: {e}')
        session.rollback()
    finally:
        session.close()

if __name__ == '__main__':
    seed_industries_and_companies() 