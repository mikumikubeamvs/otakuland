// Check deployment mode
async function checkMode() {
    try {
        const response = await fetch('/api/status');
        const data = await response.json();
        
        const modeBadge = document.getElementById('mode-badge');
        const modeNotice = document.getElementById('mode-notice');
        
        if (data.mode === 'Vercel Serverless') {
            modeBadge.innerHTML = '🌐 Vercel Mode (Limited)';
            modeBadge.className = 'mode-badge mode-vercel';
            modeNotice.style.display = 'block';
            modeNotice.innerHTML = '⚠️ Running on Vercel - Search only. Use local mode for video playback.';
        } else {
            modeBadge.innerHTML = '💻 Local Mode (Full)';
            modeBadge.className = 'mode-badge mode-local';
            modeNotice.style.display = 'none';
        }
    } catch (error) {
        console.error('Failed to check mode:', error);
    }
}

// Search function
async function searchAnime() {
    const query = document.getElementById('search-input').value;
    if (!query) return;
    
    try {
        const response = await fetch('/api/search', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({query: query})
        });
        
        const data = await response.json();
        if (data.success) {
            displayResults(data.results);
        } else {
            alert('Search failed: ' + data.error);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Display results
function displayResults(results) {
    const container = document.getElementById('search-results');
    container.innerHTML = '';
    
    results.forEach(anime => {
        const card = document.createElement('div');
        card.className = 'result-card';
        card.innerHTML = `
            <img src="${anime.poster || 'https://via.placeholder.com/60x80'}" alt="${anime.title}">
            <div class="info">
                <h5>${anime.title}</h5>
            </div>
        `;
        card.onclick = () => showEpisodes(anime.url, anime.title);
        container.appendChild(card);
    });
}

// Show episodes (mock for Vercel)
function showEpisodes(animeUrl, title) {
    document.getElementById('selected-title').textContent = title;
    
    // Mock episodes for Vercel mode
    const mockEpisodes = Array.from({length: 12}, (_, i) => ({
        number: i + 1,
        url: `${animeUrl}/ep-${i+1}`
    }));
    
    displayEpisodes(mockEpisodes);
    document.getElementById('episodes-section').style.display = 'block';
}

// Display episodes
function displayEpisodes(episodes) {
    const grid = document.getElementById('episodes-grid');
    grid.innerHTML = '';
    
    episodes.forEach(ep => {
        const item = document.createElement('div');
        item.className = 'episode-item';
        item.textContent = `Ep ${ep.number}`;
        item.onclick = () => playEpisode(ep.url, ep.number);
        grid.appendChild(item);
    });
}

// Play episode (shows mode-specific message)
function playEpisode(episodeUrl, episodeNum) {
    const modeBadge = document.getElementById('mode-badge').textContent;
    
    if (modeBadge.includes('Vercel')) {
        alert('Video playback requires local mode. Please run locally following the instructions in Local Mode tab.');
        showTab('local');
    } else {
        // Local mode - actual playback
        alert('In local mode, this would play the video. Run locally for full functionality.');
    }
}

// Tab switching
function showTab(tab) {
    document.querySelectorAll('.nav-link').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
    
    if (tab === 'search') {
        document.querySelector('.nav-link:first-child').classList.add('active');
        document.getElementById('search-tab').style.display = 'block';
    } else {
        document.querySelector('.nav-link:last-child').classList.add('active');
        document.getElementById('local-tab').style.display = 'block';
    }
}

// Initialize
checkMode();
