import requests
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))
from config import Config

print('| Industry | Ticker | Name | Sentiment | Count |')
print('|---|---|---|---|---|')

for industry, companies in Config.COMPANIES.items():
    for company in companies:
        ticker = company['ticker']
        name = company['name']
        try:
            r = requests.get(f'http://localhost:5001/sentiment/company/{ticker}')
            data = r.json()
            sentiment = data.get('sentiment')
            count = data.get('count')
        except Exception as e:
            sentiment = 'ERR'
            count = 'ERR'
        print(f'| {industry} | {ticker} | {name} | {sentiment} | {count} |') 