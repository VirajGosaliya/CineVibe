package com.cinevibe.controller;

import com.cinevibe.dto.GenreDto;
import com.cinevibe.dto.MovieDto;
import com.cinevibe.dto.TmdbSearchResponse;
import com.cinevibe.service.RecommendationService;
import com.cinevibe.service.TmdbService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for movie-related endpoints.
 * Exposes search, trending, genre list, and recommendation APIs
 * to the CineVibe frontend application.
 */
@RestController
@RequestMapping("/api/movies")
public class MovieController {

    private final TmdbService tmdbService;
    private final RecommendationService recommendationService;

    public MovieController(TmdbService tmdbService, RecommendationService recommendationService) {
        this.tmdbService = tmdbService;
        this.recommendationService = recommendationService;
    }

    // ─── Search ──────────────────────────────────────────────────

    /**
     * Searches for movies matching the given query string.
     * Powers the hero search bar auto-suggest feature.
     *
     * @param query the search text from the user
     * @return paginated search results from TMDb
     */
    @GetMapping("/search")
    public ResponseEntity<TmdbSearchResponse> searchMovies(@RequestParam("q") String query) {
        TmdbSearchResponse results = tmdbService.searchMovies(query);
        return ResponseEntity.ok(results);
    }

    // ─── Trending ────────────────────────────────────────────────

    /**
     * Returns the weekly trending movies, enriched with genre names.
     * Used as the default content on the landing page.
     *
     * @return list of trending movies
     */
    @GetMapping("/trending")
    public ResponseEntity<List<MovieDto>> getTrendingMovies() {
        List<MovieDto> trending = recommendationService.getTrendingEnriched();
        return ResponseEntity.ok(trending);
    }

    // ─── Genre List ──────────────────────────────────────────────

    /**
     * Returns the complete list of TMDb movie genres.
     * Used to populate the genre filter pills on the frontend.
     *
     * @return list of genres with id and name
     */
    @GetMapping("/genres")
    public ResponseEntity<List<GenreDto>> getGenres() {
        List<GenreDto> genres = tmdbService.getGenres();
        return ResponseEntity.ok(genres);
    }

    // ─── Recommendations ─────────────────────────────────────────

    /**
     * Generates movie recommendations filtered by genre(s) and minimum rating.
     * The recommendation engine sorts results by quality (vote average descending).
     *
     * @param genres    comma-separated list of genre IDs
     * @param minRating minimum vote average threshold (default: 7.0)
     * @param page      pagination page number (default: 1)
     * @return list of recommended movies meeting the criteria
     */
    @GetMapping("/recommend")
    public ResponseEntity<List<MovieDto>> getRecommendations(
            @RequestParam("genres") List<Integer> genres,
            @RequestParam(value = "minRating", defaultValue = "7.0") double minRating,
            @RequestParam(value = "page", defaultValue = "1") int page) {

        List<MovieDto> recommendations = recommendationService.recommend(genres, minRating, page);
        return ResponseEntity.ok(recommendations);
    }
}
