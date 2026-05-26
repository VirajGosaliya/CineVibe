/**
 * ═══════════════════════════════════════════════════════════════
 * CineVibe — API Client (api.js)
 * Three-tier: Backend → Direct TMDb → Built-in sample data.
 * Ensures the app always displays content regardless of network.
 * ═══════════════════════════════════════════════════════════════
 */

const API = (() => {
    const BASE_URL = 'http://localhost:8081/api';
    const TMDB_BASE = 'https://api.themoviedb.org/3';
    const TMDB_KEY = '2659aad84af4d618a3c533c8ca11a476';
    const IMAGE_BASE = 'https://image.tmdb.org/t/p';

    let useDirectTmdb = false;
    let useSampleData = false;

    // ─── Sample Data (used when TMDb is unreachable) ─────────────

    const SAMPLE_GENRES = [
        {id:28,name:"Action"},{id:12,name:"Adventure"},{id:16,name:"Animation"},
        {id:35,name:"Comedy"},{id:80,name:"Crime"},{id:99,name:"Documentary"},
        {id:18,name:"Drama"},{id:10751,name:"Family"},{id:14,name:"Fantasy"},
        {id:36,name:"History"},{id:27,name:"Horror"},{id:10402,name:"Music"},
        {id:9648,name:"Mystery"},{id:10749,name:"Romance"},{id:878,name:"Science Fiction"},
        {id:53,name:"Thriller"},{id:10752,name:"War"},{id:37,name:"Western"}
    ];

    const SAMPLE_MOVIES = [
        {id:550,title:"Fight Club",overview:"A ticking-Loss of reality. An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into much more.",poster_path:"/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",backdrop_path:"/hZkgoQYus5dXo3H8T7Uef6DNknx.jpg",release_date:"1999-10-15",vote_average:8.4,vote_count:28000,genre_ids:[18,53,35],genreNames:["Drama","Thriller","Comedy"]},
        {id:278,title:"The Shawshank Redemption",overview:"Imprisoned in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison.",poster_path:"/9cjIGRQL1SL3SVUO1P9F1IMKbeL.jpg",backdrop_path:"/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg",release_date:"1994-09-23",vote_average:8.7,vote_count:26000,genre_ids:[18,80],genreNames:["Drama","Crime"]},
        {id:238,title:"The Godfather",overview:"Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family.",poster_path:"/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",backdrop_path:"/tmU7GeKVybMWFButWEGl2M4GeiP.jpg",release_date:"1972-03-14",vote_average:8.7,vote_count:20000,genre_ids:[18,80],genreNames:["Drama","Crime"]},
        {id:680,title:"Pulp Fiction",overview:"A burger-loving hit man, his philosophical partner, a drug-addled gangster's moll and a washed-up boxer converge in this sprawling, comedic crime caper.",poster_path:"/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",backdrop_path:"/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg",release_date:"1994-09-10",vote_average:8.5,vote_count:27000,genre_ids:[53,80],genreNames:["Thriller","Crime"]},
        {id:155,title:"The Dark Knight",overview:"Batman raises the stakes in his war on crime, going after the Joker, who brings Gotham City to its knees.",poster_path:"/qJ2tW6WMUDux911BF4uQlhVvLYV.jpg",backdrop_path:"/nMKdUUepR0i5zn0y1T4CsSB5ez.jpg",release_date:"2008-07-16",vote_average:8.5,vote_count:32000,genre_ids:[28,80,18],genreNames:["Action","Crime","Drama"]},
        {id:13,title:"Forrest Gump",overview:"A man with a low IQ has accomplished great things in his life and been present during significant historic events.",poster_path:"/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",backdrop_path:"/jenYj1CoVbGQ6YH9bB0yMRAEh6z.jpg",release_date:"1994-06-23",vote_average:8.5,vote_count:26000,genre_ids:[35,18,10749],genreNames:["Comedy","Drama","Romance"]},
        {id:27205,title:"Inception",overview:"Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets, is offered a chance to have his criminal record erased.",poster_path:"/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",backdrop_path:"/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",release_date:"2010-07-15",vote_average:8.4,vote_count:36000,genre_ids:[28,878,12],genreNames:["Action","Science Fiction","Adventure"]},
        {id:424,title:"Schindler's List",overview:"The true story of how businessman Oskar Schindler saved over a thousand Jewish lives from the Nazis while they worked as slaves in his factory.",poster_path:"/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg",backdrop_path:"/loRmRzQXZY0Lnp9IxkPk0Q8CTJQ.jpg",release_date:"1993-12-15",vote_average:8.6,vote_count:15000,genre_ids:[18,36,10752],genreNames:["Drama","History","War"]},
        {id:122,title:"The Lord of the Rings: The Return of the King",overview:"Aragorn is revealed as the heir to the ancient kings as Gandalf and company prepare for the final battle with Sauron.",poster_path:"/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg",backdrop_path:"/pm0RiwOy1De9tbIqmaPAzp4g93.jpg",release_date:"2003-12-01",vote_average:8.5,vote_count:23000,genre_ids:[12,14,28],genreNames:["Adventure","Fantasy","Action"]},
        {id:603,title:"The Matrix",overview:"Set in the 22nd century, The Matrix tells the story of a computer hacker who joins a group of underground insurgents fighting the vast and powerful computers that now rule the earth.",poster_path:"/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",backdrop_path:"/fNG7i7RqMErkcqhohV2a6cV1Ehy.jpg",release_date:"1999-03-30",vote_average:8.2,vote_count:25000,genre_ids:[28,878],genreNames:["Action","Science Fiction"]},
        {id:497,title:"The Green Mile",overview:"A supernatural tale set on death row in a Southern prison, where gentle giant John Coffey possesses the mysterious power to heal people's ailments.",poster_path:"/velWPhVMQeQKcxggNEU8YmIo52R.jpg",backdrop_path:"/Rlt20sEbOQKPVjia7lUilFm49W.jpg",release_date:"1999-12-10",vote_average:8.5,vote_count:16000,genre_ids:[14,18,80],genreNames:["Fantasy","Drama","Crime"]},
        {id:389,title:"12 Angry Men",overview:"The defense and the prosecution have rested and the jury is filing into the jury room to decide if a young Spanish-American is guilty or innocent of murdering his father.",poster_path:"/ow3wq89wM8qd5X7hWKxiRfsFf9C.jpg",backdrop_path:"/qqHQsStV6exghCM7zbObuYBiYxw.jpg",release_date:"1957-04-10",vote_average:8.5,vote_count:8000,genre_ids:[18],genreNames:["Drama"]},
        {id:569094,title:"Spider-Man: Across the Spider-Verse",overview:"After reuniting with Gwen Stacy, Brooklyn's full-time, friendly neighborhood Spider-Man is catapulted across the Multiverse.",poster_path:"/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",backdrop_path:"/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg",release_date:"2023-05-31",vote_average:8.4,vote_count:7000,genre_ids:[16,28,12],genreNames:["Animation","Action","Adventure"]},
        {id:157336,title:"Interstellar",overview:"The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel.",poster_path:"/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",backdrop_path:"/xJHokMbljvjADYdit5fK1DDNfLJ.jpg",release_date:"2014-11-05",vote_average:8.4,vote_count:35000,genre_ids:[12,18,878],genreNames:["Adventure","Drama","Science Fiction"]},
        {id:496243,title:"Parasite",overview:"All unemployed, Ki-taek's family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.",poster_path:"/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",backdrop_path:"/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg",release_date:"2019-05-30",vote_average:8.5,vote_count:17000,genre_ids:[35,53,18],genreNames:["Comedy","Thriller","Drama"]},
        {id:372058,title:"Your Name",overview:"High schoolers Mitsuha and Taki are complete strangers living separate lives. But one night, they suddenly switch places.",poster_path:"/q719jXXEzOoYaps6babgKnONONX.jpg",backdrop_path:"/dIWwZW7dJJtqC6CgWzYkNVKIUm2.jpg",release_date:"2016-08-26",vote_average:8.5,vote_count:11000,genre_ids:[10749,16,18],genreNames:["Romance","Animation","Drama"]},
        {id:346698,title:"Barbie",overview:"Barbie and Ken are having the time of their lives in the colorful and seemingly perfect world of Barbie Land. However, when they get a chance to go to the real world, they soon discover the joys and perils of living among humans.",poster_path:"/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg",backdrop_path:"/nHf61UzkfFno5X1ofIhugCPus2R.jpg",release_date:"2023-07-19",vote_average:7.0,vote_count:8500,genre_ids:[35,12,14],genreNames:["Comedy","Adventure","Fantasy"]},
        {id:872585,title:"Oppenheimer",overview:"The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II.",poster_path:"/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",backdrop_path:"/nb3xI8XI3w4pMVZ38VijbsyBqP4.jpg",release_date:"2023-07-19",vote_average:8.1,vote_count:9000,genre_ids:[18,36],genreNames:["Drama","History"]},
        {id:76341,title:"Mad Max: Fury Road",overview:"An apocalyptic story set in the furthest reaches of our planet, in a stark desert landscape where humanity is broken.",poster_path:"/8tZYtuWezp8JbcsvBLjBnGsDJHJ.jpg",backdrop_path:"/phszHPFVhPHhMZgo0fWTKBDQsJL.jpg",release_date:"2015-05-13",vote_average:7.6,vote_count:22000,genre_ids:[28,12,878],genreNames:["Action","Adventure","Science Fiction"]},
        {id:550988,title:"Free Guy",overview:"A bank teller discovers he is actually a background player in an open-world video game, and decides to become the hero of his own story.",poster_path:"/xmbU4JTUm8rsdtn7Y3Fcm30GpeT.jpg",backdrop_path:"/lrLt5VaRwDP3a5pIxEkSkpnGMv.jpg",release_date:"2021-08-11",vote_average:7.5,vote_count:9000,genre_ids:[35,28,12],genreNames:["Comedy","Action","Adventure"]}
    ];

    // ─── Backend check ───────────────────────────────────────────

    async function checkBackend() {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 4000);
            const response = await fetch(`${BASE_URL}/movies/genres`, { signal: controller.signal });
            clearTimeout(timeout);
            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                    console.log('%c✓ Backend + TMDb connected', 'color:#2ecc71;font-weight:bold;');
                    return;
                }
            }
            throw new Error('Empty');
        } catch (e) {
            console.warn('[API] Backend TMDb failed, trying direct TMDb...');
        }

        // Try direct TMDb
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);
            const resp = await fetch(`${TMDB_BASE}/genre/movie/list?api_key=${TMDB_KEY}&language=en-US`, { signal: controller.signal });
            clearTimeout(timeout);
            if (resp.ok) {
                useDirectTmdb = true;
                console.log('%c✓ Direct TMDb connected', 'color:#2ecc71;font-weight:bold;');
                return;
            }
        } catch (e) {
            console.warn('[API] Direct TMDb also failed');
        }

        // Fallback to sample data
        useSampleData = true;
        console.log('%c🎬 Using built-in sample data (TMDb unreachable on this network)', 'color:#f39c12;font-weight:bold;');
    }

    // ─── Request helpers ─────────────────────────────────────────

    async function request(endpoint, options = {}) {
        const url = `${BASE_URL}${endpoint}`;
        const config = { headers: { 'Content-Type': 'application/json', ...options.headers }, ...options };
        const response = await fetch(url, config);
        if (!response.ok) throw new Error(`API ${response.status}`);
        if (response.status === 204) return null;
        return await response.json();
    }

    async function tmdbDirect(path) {
        const sep = path.includes('?') ? '&' : '?';
        const url = `${TMDB_BASE}${path}${sep}api_key=${TMDB_KEY}&language=en-US`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`TMDb ${response.status}`);
        return await response.json();
    }

    // ─── Movie Endpoints ─────────────────────────────────────────

    async function searchMovies(query) {
        if (useSampleData) {
            const q = query.toLowerCase();
            const results = SAMPLE_MOVIES.filter(m => m.title.toLowerCase().includes(q));
            return { results, total_results: results.length };
        }
        if (useDirectTmdb) return await tmdbDirect(`/search/movie?query=${encodeURIComponent(query)}&page=1`);
        try { return await request(`/movies/search?q=${encodeURIComponent(query)}`); }
        catch (e) { return { results: [], total_results: 0 }; }
    }

    async function getTrending() {
        if (useSampleData) return [...SAMPLE_MOVIES];
        if (useDirectTmdb) {
            const data = await tmdbDirect('/trending/movie/week');
            return data.results || [];
        }
        try { return await request('/movies/trending'); }
        catch (e) { return []; }
    }

    async function getGenres() {
        if (useSampleData) return SAMPLE_GENRES;
        if (useDirectTmdb) {
            const data = await tmdbDirect('/genre/movie/list');
            return data.genres || [];
        }
        try { return await request('/movies/genres'); }
        catch (e) { return SAMPLE_GENRES; }
    }

    async function getRecommendations(genreIds, minRating = 7.0, page = 1) {
        if (useSampleData) {
            return SAMPLE_MOVIES.filter(m =>
                m.genre_ids.some(gid => genreIds.includes(gid)) &&
                m.vote_average >= minRating
            );
        }
        if (useDirectTmdb) {
            const data = await tmdbDirect(
                `/discover/movie?with_genres=${genreIds.join(',')}&vote_average.gte=${minRating}&sort_by=vote_average.desc&vote_count.gte=100&page=${page}`
            );
            return data.results || [];
        }
        try { return await request(`/movies/recommend?genres=${genreIds.join(',')}&minRating=${minRating}&page=${page}`); }
        catch (e) { return []; }
    }

    // ─── Favorites (backend with localStorage fallback) ──────────

    async function getFavorites() {
        try { return await request('/favorites'); } catch (e) { return []; }
    }
    async function addFavorite(movie) {
        try { return await request('/favorites', { method: 'POST', body: JSON.stringify(movie) }); }
        catch (e) { return movie; }
    }
    async function removeFavorite(movieId) {
        try { await request(`/favorites/${movieId}`, { method: 'DELETE' }); } catch (e) {}
    }
    async function reorderFavorites(orderedIds) {
        try { return await request('/favorites/reorder', { method: 'PUT', body: JSON.stringify(orderedIds) }); }
        catch (e) { return []; }
    }

    // ─── Image Helpers ───────────────────────────────────────────

    function posterUrl(path, size = 'w500') {
        if (!path) return 'data:image/svg+xml,' + encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"><rect fill="%23181c24" width="300" height="450"/><text fill="%23555" font-family="sans-serif" font-size="18" x="50%" y="50%" text-anchor="middle" dominant-baseline="middle">No Poster</text></svg>'
        );
        if (useSampleData) {
            // Use TMDb URLs — they'll show broken if network is down, but will work when connected
            return `${IMAGE_BASE}/${size}${path}`;
        }
        return `${IMAGE_BASE}/${size}${path}`;
    }

    function backdropUrl(path, size = 'w1280') {
        if (!path) return null;
        return `${IMAGE_BASE}/${size}${path}`;
    }

    return {
        checkBackend, searchMovies, getTrending, getGenres, getRecommendations,
        getFavorites, addFavorite, removeFavorite, reorderFavorites,
        posterUrl, backdropUrl,
    };
})();
