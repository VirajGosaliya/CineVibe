/**
 * ═══════════════════════════════════════════════════════════════
 * CineVibe — Search Module (search.js)
 * Handles the hero search bar with debounced auto-suggest,
 * keyboard navigation, and result selection.
 * ═══════════════════════════════════════════════════════════════
 */

const Search = (() => {
    // DOM elements
    let inputEl, clearBtn, dropdownEl;

    // State
    let debounceTimer = null;
    let activeIndex = -1;
    let currentResults = [];

    const DEBOUNCE_MS = 300;

    /**
     * Initializes the search module.
     * Binds event listeners for input, keyboard navigation, and clear.
     */
    function init() {
        inputEl = document.getElementById('searchInput');
        clearBtn = document.getElementById('searchClear');
        dropdownEl = document.getElementById('searchDropdown');

        if (!inputEl || !dropdownEl) return;

        // Input handler with debounce
        inputEl.addEventListener('input', onInput);

        // Keyboard navigation
        inputEl.addEventListener('keydown', onKeyDown);

        // Clear button
        clearBtn.addEventListener('click', clearSearch);

        // Close dropdown on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#searchWrapper')) {
                closeDropdown();
            }
        });

        // Re-open on focus if there are results
        inputEl.addEventListener('focus', () => {
            if (currentResults.length > 0) {
                openDropdown();
            }
        });
    }

    /**
     * Handles input changes with debounced API calls.
     */
    function onInput() {
        const query = inputEl.value.trim();

        // Toggle clear button visibility
        clearBtn.classList.toggle('visible', query.length > 0);

        // Clear previous timer
        if (debounceTimer) clearTimeout(debounceTimer);

        if (query.length < 2) {
            closeDropdown();
            currentResults = [];
            return;
        }

        // Debounce the search
        debounceTimer = setTimeout(async () => {
            try {
                const data = await API.searchMovies(query);
                currentResults = data.results || [];
                renderResults(currentResults.slice(0, 8)); // Show top 8
                activeIndex = -1;
                openDropdown();
            } catch (err) {
                console.error('[Search] Auto-suggest failed:', err);
            }
        }, DEBOUNCE_MS);
    }

    /**
     * Handles keyboard navigation within the dropdown.
     * @param {KeyboardEvent} e
     */
    function onKeyDown(e) {
        const items = dropdownEl.querySelectorAll('.search-result-item');
        if (items.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                activeIndex = Math.min(activeIndex + 1, items.length - 1);
                updateActiveItem(items);
                break;

            case 'ArrowUp':
                e.preventDefault();
                activeIndex = Math.max(activeIndex - 1, -1);
                updateActiveItem(items);
                break;

            case 'Enter':
                e.preventDefault();
                if (activeIndex >= 0 && activeIndex < currentResults.length) {
                    selectResult(currentResults[activeIndex]);
                } else if (inputEl.value.trim().length >= 2) {
                    // Trigger full search with current input
                    selectResult(null, inputEl.value.trim());
                }
                break;

            case 'Escape':
                closeDropdown();
                inputEl.blur();
                break;
        }
    }

    /**
     * Highlights the active item in the dropdown.
     * @param {NodeList} items - All result items
     */
    function updateActiveItem(items) {
        items.forEach((item, i) => {
            item.classList.toggle('active', i === activeIndex);
            if (i === activeIndex) {
                item.scrollIntoView({ block: 'nearest' });
            }
        });
    }

    /**
     * Renders search results into the dropdown.
     * @param {Array} movies - Array of MovieDto objects
     */
    function renderResults(movies) {
        if (movies.length === 0) {
            dropdownEl.innerHTML = `
                <div class="search-result-item" style="justify-content:center; color:var(--text-muted); cursor:default;">
                    No results found
                </div>`;
            return;
        }

        dropdownEl.innerHTML = movies.map((movie, index) => {
            const releaseDate = movie.releaseDate || movie.release_date;
            const voteAverage = movie.voteAverage ?? movie.vote_average;
            const posterPath = movie.posterPath || movie.poster_path;
            const year = releaseDate ? releaseDate.substring(0, 4) : '—';
            const rating = voteAverage ? Number(voteAverage).toFixed(1) : '—';
            const poster = API.posterUrl(posterPath, 'w200');

            return `
                <div class="search-result-item" data-index="${index}" role="option">
                    <img class="search-result-poster"
                         src="${poster}"
                         alt="${escapeHtml(movie.title)} poster"
                         loading="lazy">
                    <div class="search-result-info">
                        <div class="search-result-title">${escapeHtml(movie.title)}</div>
                        <div class="search-result-meta">
                            <span>${year}</span>
                            <span>•</span>
                            <span class="search-result-rating">★ ${rating}</span>
                        </div>
                    </div>
                </div>`;
        }).join('');

        // Click handlers for each result
        dropdownEl.querySelectorAll('.search-result-item[data-index]').forEach(item => {
            item.addEventListener('click', () => {
                const idx = parseInt(item.dataset.index);
                selectResult(currentResults[idx]);
            });
        });
    }

    /**
     * Handles selection of a search result.
     * Dispatches a custom event for the app to handle.
     * @param {object|null} movie - Selected movie or null for text search
     * @param {string} query - Optional search query text
     */
    function selectResult(movie, query = null) {
        closeDropdown();

        if (movie) {
            inputEl.value = movie.title;
            clearBtn.classList.add('visible');

            // Dispatch event for the cards module to display results
            document.dispatchEvent(new CustomEvent('cinevibe:search-select', {
                detail: { movie, results: currentResults }
            }));
        } else if (query) {
            document.dispatchEvent(new CustomEvent('cinevibe:search-query', {
                detail: { query }
            }));
        }
    }

    /**
     * Clears the search input and closes the dropdown.
     */
    function clearSearch() {
        inputEl.value = '';
        clearBtn.classList.remove('visible');
        closeDropdown();
        currentResults = [];
        activeIndex = -1;

        // Dispatch event to revert to trending
        document.dispatchEvent(new CustomEvent('cinevibe:search-cleared'));
    }

    function openDropdown() {
        dropdownEl.classList.add('open');
    }

    function closeDropdown() {
        dropdownEl.classList.remove('open');
        activeIndex = -1;
    }

    /**
     * Escapes HTML special characters to prevent XSS.
     * @param {string} str
     * @returns {string}
     */
    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    return { init, escapeHtml };
})();
