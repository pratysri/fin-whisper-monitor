from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from apscheduler.schedulers.background import BackgroundScheduler
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_app():
    app = Flask(__name__)
    
    # Initialize CORS
    CORS(app, origins=["http://localhost:8081", "http://localhost:5173"])
    
    # Health check endpoint
    @app.route('/health')
    def health_check():
        return jsonify({
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "message": "Ready for database integration"
        })
    
    # Get posts endpoint (placeholder until database is integrated)
    @app.route('/api/posts')
    def get_posts():
        return jsonify({
            "message": "Endpoint ready for database integration",
            "timestamp": datetime.utcnow().isoformat()
        })
    
    # Get stats endpoint (placeholder until database is integrated)
    @app.route('/api/stats')
    def get_stats():
        return jsonify({
            "message": "Endpoint ready for database integration",
            "timestamp": datetime.utcnow().isoformat()
        })
    
    # Register posts blueprint
    from routes.posts import posts_bp
    app.register_blueprint(posts_bp)
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(
        host='0.0.0.0',
        port=int(os.environ.get('PORT', 5001)),
        debug=os.environ.get('FLASK_ENV') == 'development'
    ) 