/**
 * ═══════════════════════════════════════════════════════════════
 * CineVibe — Recommendations Module (recommendations.js)
 * Handles genre pill rendering, rating slider, and fetching
 * filtered recommendations from the backend.
 * ═══════════════════════════════════════════════════════════════
 */

const Recommendations = (() => {
    // DOM elements
    let pillsContainer, ratingSlider, ratingValueEl, sectionTitleEl;

    // State
    let genres = [];
    let activeGenreIds = [];
    let currentMinRating = 0;
    let isFiltering = false;

    /**
     * Initializes the recommendations module.
     * Fetches genre list and binds filter events.
     */
    async function init() {
        pillsContainer = document.getElementById('genrePills');
        ratingSlider = document.getElementById('ratingSlider');
        ratingValueEl = document.getElementById('ratingValue');
        sectionTitleEl = document.getElementById('sectionTitle');

        // Rating slider handler
        ratingSlider.addEventListener('input', onRatingChange);

        // Fetch genres from backend
        await loadGenres();
    }

    /**
     * Loads the genre list from the backend and renders pills.
     */
    async function loadGenres() {
        try {
            genres = await API.getGenres();
            renderGenrePills();
        } catch (err) {
            console.error('[Recommendations] Failed to load genres:', err);
            // Show some default genres
            renderGenrePills();
        }
    }

    /**
     * Renders genre filter pills into the container.
     */
    function renderGenrePills() {
        if (!pillsContainer) return;

        if (!genres || genres.length === 0) {
            pillsContainer.innerHTML = '<span style="color:var(--text-muted);font-size:var(--fs-sm);">Genres unavailable</span>';
            return;
        }

        pillsContainer.innerHTML = genres.map(genre => `
            <button class="genre-pill" data-genre-id="${genre.id}">
                ${Search.escapeHtml(genre.name)}
            </button>
        `).join('');

        // Click handlers
        pillsContainer.querySelectorAll('.genre-pill').forEach(pill => {
            pill.addEventListener('click', () => toggleGenre(pill));
        });
    }

    /**
     * Toggles a genre pill's active state and triggers filtering.
     * @param {HTMLElement} pillEl - The clicked pill element
     */
    function toggleGenre(pillEl) {
        const genreId = parseInt(pillEl.dataset.genreId);

        if (activeGenreIds.includes(genreId)) {
            // Remove from active
            activeGenreIds = activeGenreIds.filter(id => id !== genreId);
            pillEl.classList.remove('active');
        } else {
            // Add to active
            activeGenreIds.push(genreId);
            pillEl.classList.add('active');
        }

        applyFilters();
    }

    /**
     * Handles rating slider changes.
     */
    function onRatingChange() {
        currentMinRating = parseFloat(ratingSlider.value);
        ratingValueEl.textContent = currentMinRating.toFixed(1);

        // Apply filters (debounced would be ideal, but slider events are already smooth)
        applyFilters();
    }

    /**
     * Applies the current genre + rating filters.
     * If no genres are selected and rating is 0, reverts to trending.
     */
    async function applyFilters() {
        const hasFilters = activeGenreIds.length > 0 || currentMinRating > 0;

        if (!hasFilters) {
            // Revert to trending
            updateSectionTitle('🔥 Trending This Week');
            document.dispatchEvent(new CustomEvent('cinevibe:show-trending'));
            return;
        }

        // Update title
        const genreNames = activeGenreIds
            .map(id => genres.find(g => g.id === id)?.name)
            .filter(Boolean);

        const titleParts = [];
        if (genreNames.length > 0) titleParts.push(genreNames.join(' + '));
        if (currentMinRating > 0) titleParts.push(`★ ${currentMinRating}+`);

        updateSectionTitle(`🎯 ${titleParts.join(' • ')}`);

        // Fetch filtered recommendations
        try {
            Cards.showSkeletons(12);

            // If no genres selected but has rating filter, use all trending with client-side filter
            if (activeGenreIds.length === 0) {
                const trending = await API.getTrending();
                const filtered = trending.filter(m => (m.voteAverage ?? m.vote_average ?? 0) >= currentMinRating);
                Cards.renderMovies(filtered);
            } else {
                const movies = await API.getRecommendations(activeGenreIds, currentMinRating);
                Cards.renderMovies(movies);
            }
        } catch (err) {
            console.error('[Recommendations] Filter failed:', err);
            Cards.renderMovies([]);
        }
    }

    /**
     * Updates the section title above the movie grid.
     * @param {string} text
     */
    function updateSectionTitle(text) {
        if (sectionTitleEl) {
            sectionTitleEl.textContent = text;
        }
    }

    /**
     * Resets all filters to default state.
     */
    function reset() {
        activeGenreIds = [];
        currentMinRating = 0;
        ratingSlider.value = 0;
        ratingValueEl.textContent = '0';

        pillsContainer.querySelectorAll('.genre-pill').forEach(pill => {
            pill.classList.remove('active');
        });

        updateSectionTitle('🔥 Trending This Week');
    }

    return { init, reset, applyFilters, updateSectionTitle };
})();
