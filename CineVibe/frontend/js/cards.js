/**
 * ═══════════════════════════════════════════════════════════════
 * CineVibe — Movie Cards Module (cards.js)
 * Renders movie cards into the grid, handles hover interactions,
 * drag-start for favorites, and skeleton loading states.
 * ═══════════════════════════════════════════════════════════════
 */

const Cards = (() => {
    let gridEl;

    /**
     * Initializes the cards module.
     * Caches the grid element reference.
     */
    function init() {
        gridEl = document.getElementById('moviesGrid');
    }

    /**
     * Renders an array of movies into the grid as interactive cards.
     * Clears previous content and applies staggered entrance animation.
     *
     * @param {Array} movies - Array of MovieDto objects
     */
    function renderMovies(movies) {
        if (!gridEl) return;

        if (!movies || movies.length === 0) {
            gridEl.innerHTML = '';
            showEmptyState(true);
            return;
        }

        showEmptyState(false);
        showLoading(false);

        gridEl.innerHTML = movies.map((movie) => createCardHTML(movie)).join('');

        // Re-apply stagger animation class
        gridEl.classList.remove('stagger-children');
        void gridEl.offsetWidth; // Force reflow for animation restart
        gridEl.classList.add('stagger-children');

        // Bind event listeners to the newly created cards
        bindCardEvents();
    }

    /**
     * Creates the HTML string for a single movie card.
     * @param {object} movie - MovieDto object
     * @returns {string} - HTML string
     */
    function createCardHTML(movie) {
        // Normalize field names (handle both snake_case from TMDb and camelCase from backend)
        const posterPath = movie.posterPath || movie.poster_path;
        const releaseDate = movie.releaseDate || movie.release_date;
        const voteAverage = movie.voteAverage ?? movie.vote_average;
        const genreNames = movie.genreNames || [];
        const genreIds = movie.genreIds || movie.genre_ids || [];

        const poster = API.posterUrl(posterPath);
        const year = releaseDate ? releaseDate.substring(0, 4) : '—';
        const rating = voteAverage ? Number(voteAverage).toFixed(1) : '—';
        const title = Search.escapeHtml(movie.title);
        const overview = Search.escapeHtml(movie.overview);
        const isFav = Favorites.isFavorite(movie.id);

        // Normalized movie object for data attribute (always camelCase)
        const normalizedMovie = {
            id: movie.id, title: movie.title, overview: movie.overview,
            posterPath: posterPath, releaseDate: releaseDate,
            voteAverage: voteAverage, genreIds: genreIds, genreNames: genreNames
        };

        // Genre tags
        const genreTags = genreNames.slice(0, 3).map(name =>
            `<span class="movie-card-genre-tag">${Search.escapeHtml(name)}</span>`
        ).join('');

        return `
            <article class="movie-card"
                     data-movie-id="${movie.id}"
                     draggable="true"
                     data-movie='${JSON.stringify(normalizedMovie).replace(/'/g, "&#39;")}'>

                <!-- Favorite Button -->
                <button class="movie-card-fav-btn ${isFav ? 'is-favorite' : ''}"
                        data-fav-id="${movie.id}"
                        aria-label="${isFav ? 'Remove from' : 'Add to'} watchlist"
                        title="${isFav ? 'Remove from' : 'Add to'} watchlist">
                    <svg width="16" height="16" viewBox="0 0 24 24"
                         fill="${isFav ? 'currentColor' : 'none'}"
                         stroke="currentColor" stroke-width="2"
                         stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                </button>

                <!-- Poster -->
                <img class="movie-card-poster"
                     src="${poster}"
                     alt="${title} poster"
                     loading="lazy">

                <!-- Hover Overlay -->
                <div class="movie-card-overlay">
                    <div class="movie-card-genres">${genreTags}</div>
                    <h3 class="movie-card-title">${title}</h3>
                    <p class="movie-card-overview">${overview || 'No description available.'}</p>
                    <div class="movie-card-meta">
                        <div class="movie-card-rating">
                            <svg viewBox="0 0 24 24" fill="var(--gold)" stroke="none">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                            ${rating}
                        </div>
                        <span class="movie-card-year">${year}</span>
                    </div>
                </div>
            </article>`;
    }

    /**
     * Binds click and drag events to all movie cards in the grid.
     */
    function bindCardEvents() {
        // Favorite button clicks
        gridEl.querySelectorAll('.movie-card-fav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.movie-card');
                const movie = JSON.parse(card.dataset.movie);

                if (Favorites.isFavorite(movie.id)) {
                    Favorites.remove(movie.id);
                    btn.classList.remove('is-favorite');
                    btn.querySelector('svg').setAttribute('fill', 'none');
                    btn.setAttribute('aria-label', 'Add to watchlist');
                    btn.setAttribute('title', 'Add to watchlist');
                } else {
                    Favorites.add(movie);
                    btn.classList.add('is-favorite');
                    btn.querySelector('svg').setAttribute('fill', 'currentColor');
                    btn.setAttribute('aria-label', 'Remove from watchlist');
                    btn.setAttribute('title', 'Remove from watchlist');
                }
            });
        });

        // Drag start for each card (to drag into favorites sidebar)
        gridEl.querySelectorAll('.movie-card').forEach(card => {
            card.addEventListener('dragstart', (e) => {
                const movie = card.dataset.movie;
                e.dataTransfer.setData('application/json', movie);
                e.dataTransfer.effectAllowed = 'copy';
                card.classList.add('drag-active');

                // Show sidebar drop zone
                document.dispatchEvent(new CustomEvent('cinevibe:drag-start'));
            });

            card.addEventListener('dragend', () => {
                card.classList.remove('drag-active');
                document.dispatchEvent(new CustomEvent('cinevibe:drag-end'));
            });
        });
    }

    /**
     * Shows skeleton loading cards in the grid.
     * @param {number} count - Number of skeleton cards to show
     */
    function showSkeletons(count = 12) {
        if (!gridEl) return;

        gridEl.innerHTML = Array.from({ length: count }, () => `
            <div class="movie-card-skeleton">
                <div class="skeleton skeleton-poster"></div>
                <div class="skeleton skeleton-text" style="margin:12px;height:14px;"></div>
                <div class="skeleton skeleton-text short" style="margin:0 12px 12px;height:12px;"></div>
            </div>
        `).join('');
    }

    /**
     * Updates favorite button state for a specific movie across all visible cards.
     * @param {number} movieId
     * @param {boolean} isFav
     */
    function updateFavoriteState(movieId, isFav) {
        const btn = gridEl.querySelector(`.movie-card-fav-btn[data-fav-id="${movieId}"]`);
        if (btn) {
            btn.classList.toggle('is-favorite', isFav);
            btn.querySelector('svg').setAttribute('fill', isFav ? 'currentColor' : 'none');
        }
    }

    function showLoading(visible) {
        const el = document.getElementById('loadingState');
        if (el) el.style.display = visible ? 'flex' : 'none';
    }

    function showEmptyState(visible) {
        const el = document.getElementById('emptyState');
        if (el) el.style.display = visible ? 'block' : 'none';
    }

    return { init, renderMovies, showSkeletons, updateFavoriteState, showLoading, showEmptyState };
})();
