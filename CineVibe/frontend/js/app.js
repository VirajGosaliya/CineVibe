/**
 * ═══════════════════════════════════════════════════════════════
 * CineVibe — Main Application Controller (app.js)
 * Orchestrates initialization of all modules, loads initial data,
 * and handles cross-module communication via custom events.
 * ═══════════════════════════════════════════════════════════════
 */

const App = (() => {
    /**
     * Bootstraps the entire application.
     * Initializes all modules and loads the initial trending movies.
     */
    async function init() {
        console.log('%c🎬 CineVibe', 'font-size:24px;font-weight:bold;color:#9b59f0;');
        console.log('%cInitializing...', 'color:#888;');

        // Initialize modules
        Cards.init();
        Favorites.init();
        Search.init();

        // Check if backend can relay TMDb data; fall back to direct mode if not
        await API.checkBackend();

        await Recommendations.init();

        // Register cross-module event listeners
        registerEvents();

        // Load initial content (trending movies)
        await loadTrending();

        console.log('%c✓ CineVibe ready', 'color:#2ecc71;font-weight:bold;');
    }

    /**
     * Loads and displays the weekly trending movies.
     */
    async function loadTrending() {
        try {
            Cards.showSkeletons(12);
            const movies = await API.getTrending();
            Cards.renderMovies(movies);
        } catch (err) {
            console.error('[App] Failed to load trending movies:', err);
            Cards.renderMovies([]);
            showFallbackMessage();
        }
    }

    /**
     * Registers custom event listeners for cross-module communication.
     */
    function registerEvents() {
        // When a search result is selected, display those results
        document.addEventListener('cinevibe:search-select', (e) => {
            const { results } = e.detail;
            Recommendations.updateSectionTitle('🔍 Search Results');
            Recommendations.reset();
            Cards.renderMovies(results);
        });

        // When a text search query is submitted
        document.addEventListener('cinevibe:search-query', async (e) => {
            const { query } = e.detail;
            Recommendations.updateSectionTitle(`🔍 Results for "${query}"`);
            Recommendations.reset();

            try {
                Cards.showSkeletons(8);
                const data = await API.searchMovies(query);
                Cards.renderMovies(data.results || []);
            } catch (err) {
                console.error('[App] Search query failed:', err);
                Cards.renderMovies([]);
            }
        });

        // When search is cleared, revert to trending
        document.addEventListener('cinevibe:search-cleared', () => {
            Recommendations.reset();
            loadTrending();
        });

        // When filters are cleared and we should show trending
        document.addEventListener('cinevibe:show-trending', () => {
            loadTrending();
        });
    }

    /**
     * Shows a user-friendly error message when the backend is unavailable.
     */
    function showFallbackMessage() {
        const emptyEl = document.getElementById('emptyState');
        if (emptyEl) {
            emptyEl.style.display = 'block';
            emptyEl.querySelector('.empty-state-icon').textContent = '🔌';
            emptyEl.querySelector('.empty-state-text').textContent = 'Unable to connect to backend';
            emptyEl.querySelector('.empty-state-sub').textContent =
                'Please ensure the Spring Boot server is running on localhost:8081.';
        }
    }

    // ─── Bootstrap ───────────────────────────────────────────────

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return { init, loadTrending };
})();
