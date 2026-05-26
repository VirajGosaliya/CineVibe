package com.cinevibe.service;

import com.cinevibe.config.TmdbConfig;
import com.cinevibe.dto.GenreDto;
import com.cinevibe.dto.MovieDto;
import com.cinevibe.dto.TmdbSearchResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Service layer for communicating with the TMDb (The Movie Database) API.
 * Handles search, discover, trending, and genre-list operations.
 * All methods return parsed DTOs ready for the controller or recommendation layer.
 */
@Service
public class TmdbService {

    private static final Logger log = LoggerFactory.getLogger(TmdbService.class);

    private final RestClient tmdbRestClient;
    private final String apiKey;

    public TmdbService(RestClient tmdbRestClient, TmdbConfig tmdbConfig) {
        this.tmdbRestClient = tmdbRestClient;
        this.apiKey = tmdbConfig.getApiKey();
    }

    // ─── Search ──────────────────────────────────────────────────

    /**
     * Searches for movies matching the given query string.
     * Uses TMDb's /search/movie endpoint with language=en-US.
     *
     * @param query the user's search text
     * @return paginated search response containing matching movies
     */
    public TmdbSearchResponse searchMovies(String query) {
        log.info("Searching TMDb for: {}", query);

        try {
            return tmdbRestClient.get()
                    .uri("/search/movie?api_key={key}&query={query}&language=en-US&page=1", apiKey, query)
                    .retrieve()
                    .body(TmdbSearchResponse.class);
        } catch (Exception e) {
            log.error("TMDb search failed for query '{}': {}", query, e.getMessage());
            return emptyResponse();
        }
    }

    // ─── Discover ────────────────────────────────────────────────

    /**
     * Discovers movies filtered by genre and minimum rating.
     * Results are sorted by vote average descending for quality-first ordering.
     *
     * @param genreIds  comma-separated genre IDs (e.g. "28,12")
     * @param minRating minimum vote_average threshold (0–10)
     * @param page      page number for pagination
     * @return paginated response of filtered movies
     */
    public TmdbSearchResponse discoverMovies(String genreIds, double minRating, int page) {
        log.info("Discovering movies — genres: {}, minRating: {}, page: {}", genreIds, minRating, page);

        try {
            return tmdbRestClient.get()
                    .uri("/discover/movie?api_key={key}&with_genres={genres}&vote_average.gte={rating}" +
                         "&sort_by=vote_average.desc&vote_count.gte=100&language=en-US&page={page}",
                         apiKey, genreIds, minRating, page)
                    .retrieve()
                    .body(TmdbSearchResponse.class);
        } catch (Exception e) {
            log.error("TMDb discover failed: {}", e.getMessage());
            return emptyResponse();
        }
    }

    // ─── Trending ────────────────────────────────────────────────

    /**
     * Fetches the current weekly trending movies from TMDb.
     * Used for the initial landing page display before user interaction.
     *
     * @return paginated response of trending movies
     */
    public TmdbSearchResponse getTrendingMovies() {
        log.info("Fetching weekly trending movies");

        try {
            return tmdbRestClient.get()
                    .uri("/trending/movie/week?api_key={key}&language=en-US", apiKey)
                    .retrieve()
                    .body(TmdbSearchResponse.class);
        } catch (Exception e) {
            log.error("TMDb trending fetch failed: {}", e.getMessage());
            return emptyResponse();
        }
    }

    // ─── Genres ──────────────────────────────────────────────────

    /**
     * Retrieves the full list of movie genres from TMDb.
     * The genre IDs are needed for discover/filter operations.
     *
     * @return list of GenreDto objects with id and name
     */
    public List<GenreDto> getGenres() {
        log.info("Fetching genre list from TMDb");

        try {
            Map<String, List<GenreDto>> response = tmdbRestClient.get()
                    .uri("/genre/movie/list?api_key={key}&language=en-US", apiKey)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});

            return response != null ? response.getOrDefault("genres", Collections.emptyList())
                                    : Collections.emptyList();
        } catch (Exception e) {
            log.error("TMDb genre fetch failed: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    // ─── Helpers ─────────────────────────────────────────────────

    /**
     * Creates an empty TmdbSearchResponse for error fallback.
     */
    private TmdbSearchResponse emptyResponse() {
        TmdbSearchResponse response = new TmdbSearchResponse();
        response.setPage(1);
        response.setTotalResults(0);
        response.setTotalPages(0);
        response.setResults(Collections.emptyList());
        return response;
    }
}
