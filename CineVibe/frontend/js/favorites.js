/**
 * ═══════════════════════════════════════════════════════════════
 * CineVibe — Favorites Module (favorites.js)
 * Manages the favorites sidebar: add/remove, drag-and-drop
 * reordering, localStorage persistence, and backend sync.
 * ═══════════════════════════════════════════════════════════════
 */

const Favorites = (() => {
    // DOM elements
    let sidebarEl, listEl, emptyEl, badgeEl, toggleBtn, closeBtn, dropzoneEl, mainContentEl;

    // State
    let favorites = []; // Array of movie objects in order
    let isOpen = false;
    let dragSrcIndex = null;

    const STORAGE_KEY = 'cinevibe_favorites';

    /**
     * Initializes the favorites module.
     * Loads from localStorage and sets up all event listeners.
     */
    function init() {
        sidebarEl = document.getElementById('favoritesSidebar');
        listEl = document.getElementById('favoritesList');
        emptyEl = document.getElementById('favoritesEmpty');
        badgeEl = document.getElementById('favoritesBadge');
        toggleBtn = document.getElementById('favoritesToggle');
        closeBtn = document.getElementById('sidebarClose');
        dropzoneEl = document.getElementById('sidebarDropzone');
        mainContentEl = document.getElementById('mainContent');

        // Load persisted favorites
        loadFromStorage();

        // Toggle sidebar
        toggleBtn.addEventListener('click', toggleSidebar);
        closeBtn.addEventListener('click', () => setSidebarOpen(false));

        // Listen for drag events from cards
        document.addEventListener('cinevibe:drag-start', onExternalDragStart);
        document.addEventListener('cinevibe:drag-end', onExternalDragEnd);

        // Dropzone events
        dropzoneEl.addEventListener('dragover', onDropzoneDragOver);
        dropzoneEl.addEventListener('dragleave', onDropzoneDragLeave);
        dropzoneEl.addEventListener('drop', onDropzoneDrop);

        // Also allow dropping on the sidebar list itself
        listEl.addEventListener('dragover', onDropzoneDragOver);
        listEl.addEventListener('drop', onDropzoneDrop);

        renderFavorites();
    }

    // ─── Core Operations ─────────────────────────────────────────

    /**
     * Adds a movie to favorites.
     * @param {object} movie - MovieDto with id, title, posterPath, voteAverage
     */
    function add(movie) {
        if (isFavorite(movie.id)) return;

        const fav = {
            id: movie.id,
            title: movie.title,
            posterPath: movie.posterPath || movie.poster_path,
            voteAverage: movie.voteAverage ?? movie.vote_average,
        };

        favorites.push(fav);
        saveToStorage();
        renderFavorites();
        updateBadge();
        syncAddToBackend(fav);

        // Pulse animation on badge
        badgeEl.style.animation = 'none';
        void badgeEl.offsetWidth;
        badgeEl.style.animation = 'pulseGlow 0.6s ease-out';
    }

    /**
     * Removes a movie from favorites by ID.
     * @param {number} movieId
     */
    function remove(movieId) {
        favorites = favorites.filter(m => m.id !== movieId);
        saveToStorage();
        renderFavorites();
        updateBadge();
        syncRemoveFromBackend(movieId);

        // Update card state
        Cards.updateFavoriteState(movieId, false);
    }

    /**
     * Checks if a movie is in the favorites list.
     * @param {number} movieId
     * @returns {boolean}
     */
    function isFavorite(movieId) {
        return favorites.some(m => m.id === movieId);
    }

    /**
     * Returns the current favorites list.
     * @returns {Array}
     */
    function getAll() {
        return [...favorites];
    }

    // ─── Rendering ───────────────────────────────────────────────

    /**
     * Renders the favorites list in the sidebar.
     */
    function renderFavorites() {
        if (!listEl) return;

        if (favorites.length === 0) {
            emptyEl.style.display = 'flex';
            listEl.querySelectorAll('.favorite-item').forEach(el => el.remove());
            return;
        }

        emptyEl.style.display = 'none';

        // Keep only the items container (remove old items but keep empty state)
        const existingItems = listEl.querySelectorAll('.favorite-item');
        existingItems.forEach(el => el.remove());

        favorites.forEach((movie, index) => {
            const itemEl = createFavoriteItemElement(movie, index);
            listEl.appendChild(itemEl);
        });
    }

    /**
     * Creates a DOM element for a single favorite item.
     * @param {object} movie - Favorite movie object
     * @param {number} index - Position in the list
     * @returns {HTMLElement}
     */
    function createFavoriteItemElement(movie, index) {
        const item = document.createElement('div');
        item.className = 'favorite-item';
        item.draggable = true;
        item.dataset.index = index;
        item.dataset.movieId = movie.id;

        const poster = API.posterUrl(movie.posterPath, 'w200');
        const rating = movie.voteAverage ? movie.voteAverage.toFixed(1) : '—';

        item.innerHTML = `
            <div class="favorite-item-drag-handle" aria-hidden="true">
                <span></span><span></span><span></span>
            </div>
            <img class="favorite-item-poster"
                 src="${poster}"
                 alt="${Search.escapeHtml(movie.title)}"
                 loading="lazy">
            <div class="favorite-item-info">
                <div class="favorite-item-title">${Search.escapeHtml(movie.title)}</div>
                <div class="favorite-item-rating">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--gold)" stroke="none">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    ${rating}
                </div>
            </div>
            <button class="favorite-item-remove" aria-label="Remove ${Search.escapeHtml(movie.title)} from watchlist" title="Remove">
                ✕
            </button>`;

        // Remove button
        item.querySelector('.favorite-item-remove').addEventListener('click', () => {
            remove(movie.id);
        });

        // Drag events for reordering within the sidebar
        item.addEventListener('dragstart', (e) => {
            dragSrcIndex = index;
            e.dataTransfer.effectAllowed = 'move';
            item.classList.add('drag-active');
        });

        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            item.classList.add('drag-over');
        });

        item.addEventListener('dragleave', () => {
            item.classList.remove('drag-over');
        });

        item.addEventListener('drop', (e) => {
            e.preventDefault();
            item.classList.remove('drag-over');

            // Only handle reorder if it's an internal drag (not from card grid)
            if (dragSrcIndex !== null && dragSrcIndex !== index) {
                const movedItem = favorites.splice(dragSrcIndex, 1)[0];
                favorites.splice(index, 0, movedItem);
                saveToStorage();
                renderFavorites();
                syncReorderToBackend();
            }
            dragSrcIndex = null;
        });

        item.addEventListener('dragend', () => {
            item.classList.remove('drag-active');
            dragSrcIndex = null;
        });

        // Entry animation
        item.style.animation = `slideInRight ${300}ms var(--ease-out) ${index * 50}ms both`;

        return item;
    }

    // ─── Sidebar Toggle ──────────────────────────────────────────

    function toggleSidebar() {
        setSidebarOpen(!isOpen);
    }

    function setSidebarOpen(open) {
        isOpen = open;
        sidebarEl.classList.toggle('open', isOpen);
        mainContentEl.classList.toggle('sidebar-open', isOpen);
        toggleBtn.classList.toggle('active', isOpen);
    }

    // ─── External Drag (from card grid) ──────────────────────────

    function onExternalDragStart() {
        dropzoneEl.classList.add('visible');
        if (!isOpen) setSidebarOpen(true);
    }

    function onExternalDragEnd() {
        dropzoneEl.classList.remove('visible', 'drag-over');
    }

    function onDropzoneDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        dropzoneEl.classList.add('drag-over');
    }

    function onDropzoneDragLeave() {
        dropzoneEl.classList.remove('drag-over');
    }

    function onDropzoneDrop(e) {
        e.preventDefault();
        dropzoneEl.classList.remove('drag-over', 'visible');

        try {
            const movieData = e.dataTransfer.getData('application/json');
            if (movieData) {
                const movie = JSON.parse(movieData);
                add(movie);
                Cards.updateFavoriteState(movie.id, true);
            }
        } catch (err) {
            console.error('[Favorites] Drop failed:', err);
        }
    }

    // ─── Badge ───────────────────────────────────────────────────

    function updateBadge() {
        if (badgeEl) {
            badgeEl.textContent = favorites.length;
        }
    }

    // ─── Persistence (localStorage) ──────────────────────────────

    function saveToStorage() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
        } catch (e) {
            console.warn('[Favorites] localStorage save failed:', e);
        }
    }

    function loadFromStorage() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                favorites = JSON.parse(stored);
                updateBadge();
            }
        } catch (e) {
            console.warn('[Favorites] localStorage load failed:', e);
            favorites = [];
        }
    }

    // ─── Backend Sync ────────────────────────────────────────────

    async function syncAddToBackend(movie) {
        try { await API.addFavorite(movie); }
        catch (e) { console.warn('[Favorites] Backend sync (add) failed:', e); }
    }

    async function syncRemoveFromBackend(movieId) {
        try { await API.removeFavorite(movieId); }
        catch (e) { console.warn('[Favorites] Backend sync (remove) failed:', e); }
    }

    async function syncReorderToBackend() {
        try {
            const ids = favorites.map(m => m.id);
            await API.reorderFavorites(ids);
        } catch (e) {
            console.warn('[Favorites] Backend sync (reorder) failed:', e);
        }
    }

    // ─── Public API ──────────────────────────────────────────────

    return { init, add, remove, isFavorite, getAll };
})();
