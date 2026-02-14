from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import sys
import json
import requests
from bs4 import BeautifulSoup
import cloudscraper

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

app = Flask(__name__, static_folder='../frontend', static_url_path='')
CORS(app)

# Initialize cloudscraper for bypassing basic Cloudflare
scraper = cloudscraper.create_scraper()

# Simple in-memory cache
cache = {}

@app.route('/')
def index():
    return send_from_directory('../frontend', 'index.html')

@app.route('/api/search', methods=['POST'])
def search():
    """
    Search endpoint - uses cloudscraper for basic requests
    Note: For Vercel, we can't use Selenium, so we'll use a hybrid approach
    """
    try:
        data = request.json
        query = data.get('query', '')
        
        # Use cloudscraper to bypass basic Cloudflare
        search_url = f"https://aniwatchtv.to/search?q={query.replace(' ', '+')}"
        response = scraper.get(search_url)
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            results = []
            
            # Parse search results (adjust selectors based on actual site structure)
            items = soup.select('.film-list .item')[:10]
            
            for item in items:
                title_elem = item.select_one('.film-name')
                link_elem = item.select_one('a')
                img_elem = item.select_one('img')
                
                if title_elem and link_elem:
                    results.append({
                        'title': title_elem.text.strip(),
                        'url': link_elem.get('href'),
                        'poster': img_elem.get('src') if img_elem else None
                    })
            
            return jsonify({'success': True, 'results': results})
        else:
            return jsonify({'success': False, 'error': f'Failed with status {response.status_code}'})
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/resolve', methods=['POST'])
def resolve():
    """
    Resolve video URL - this is tricky on Vercel
    We'll use a hybrid approach with external service or queue
    """
    try:
        data = request.json
        episode_url = data.get('url')
        
        # For Vercel, we need to handle this differently
        # Option 1: Use a third-party service (like yt-dlp web service)
        # Option 2: Queue the job for local processing
        
        return jsonify({
            'success': False,
            'error': 'Video resolution requires local processing. Please run locally or set up a worker.',
            'note': 'Use the local version for full functionality'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/status', methods=['GET'])
def status():
    """Check if API is running"""
    return jsonify({
        'status': 'online',
        'mode': 'Vercel Serverless',
        'note': 'Full scraping requires local execution'
    })

# Vercel handler
def handler(request, context):
    return app(request.environ, lambda *args, **kwargs: None)

# For local development
if __name__ == '__main__':
    app.run(debug=True, port=5000)
