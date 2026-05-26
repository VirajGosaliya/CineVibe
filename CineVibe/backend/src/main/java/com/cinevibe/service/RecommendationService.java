package com.cinevibe.service;

import com.cinevibe.dto.GenreDto;
import com.cinevibe.dto.MovieDto;
import com.cinevibe.dto.TmdbSearchResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Recommendation engine that filters and ranks movies by genre and rating.
 * Acts as an intelligent layer on top of TmdbService, enriching results
 * with genre names and applying business-logic sorting.
 */
@Service
public class RecommendationService {

    private static final Logger log = LoggerFactory.getLogger(RecommendationService.class);

    private final TmdbService tmdbService;

    /** Cached genre map (id → name) to avoid repeated API calls */
    private Map<Integer, String> genreMap;

    public RecommendationService(TmdbService tmdbService) {
        this.tmdbService = tmdbService;
    }

    // ─── Public API ──────────────────────────────────────────────

    /**
     * Recommends movies based on selected genres and a minimum rating threshold.
     * Results are enriched with human-readable genre names and sorted
     * by vote average (descending).
     *
     * @param genreIds  list of TMDb genre IDs to filter by
     * @param minRating minimum vote average (0–10)
     * @param page      pagination page number
     * @return list of enriched MovieDto objects sorted by quality
     */
    public List<MovieDto> recommend(List<Integer> genreIds, double minRating, int page) {
        log.info("Generating recommendations — genres: {}, minRating: {}, page: {}", genreIds, minRating, page);

        // Build comma-separated genre string for TMDb API
        String genreParam = genreIds.stream()
                .map(String::valueOf)
                .collect(Collectors.joining(","));

        // Fetch raw results from TMDb discover endpoint
        TmdbSearchResponse response = tmdbService.discoverMovies(genreParam, minRating, page);

        if (response == null || response.getResults() == null) {
            return Collections.emptyList();
        }

        // Enrich each movie with resolved genre names
        return response.getResults().stream()
                .map(this::enrichWithGenreNames)
                .sorted(Comparator.comparingDouble(MovieDto::getVoteAverage).reversed())
                .collect(Collectors.toList());
    }

    /**
     * Retrieves trending movies enriched with genre names.
     * Used for the landing page before the user applies any filters.
     *
     * @return list of trending movies with genre names populated
     */
    public List<MovieDto> getTrendingEnriched() {
        TmdbSearchResponse response = tmdbService.getTrendingMovies();

        if (response == null || response.getResults() == null) {
            return Collections.emptyList();
        }

        return response.getResults().stream()
                .map(this::enrichWithGenreNames)
                .collect(Collectors.toList());
    }

    // ─── Genre Resolution ────────────────────────────────────────

    /**
     * Enriches a MovieDto with human-readable genre names by looking up
     * each genre ID in the cached genre map.
     *
     * @param movie the movie DTO to enrich
     * @return the same movie DTO with genreNames populated
     */
    private MovieDto enrichWithGenreNames(MovieDto movie) {
        if (movie.getGenreIds() == null || movie.getGenreIds().isEmpty()) {
            movie.setGenreNames(Collections.emptyList());
            return movie;
        }

        Map<Integer, String> genres = getGenreMap();
        List<String> names = movie.getGenreIds().stream()
                .map(id -> genres.getOrDefault(id, "Unknown"))
                .collect(Collectors.toList());

        movie.setGenreNames(names);
        return movie;
    }

    /**
     * Lazily loads and caches the genre map from TMDb.
     * The map is fetched once and reused for the lifetime of the service.
     *
     * @return map of genre ID → genre name
     */
    private Map<Integer, String> getGenreMap() {
        if (genreMap == null) {
            List<GenreDto> genres = tmdbService.getGenres();
            genreMap = genres.stream()
                    .collect(Collectors.toMap(GenreDto::getId, GenreDto::getName));
            log.info("Cached {} genres from TMDb", genreMap.size());
        }
        return genreMap;
    }
}
