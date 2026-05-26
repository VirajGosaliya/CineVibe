package com.cinevibe.service;

import com.cinevibe.dto.GenreDto;
import com.cinevibe.dto.MovieDto;
import com.cinevibe.dto.TmdbSearchResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

/**
 * Unit tests for the RecommendationService.
 * Verifies genre enrichment, sorting by rating, and edge-case handling.
 */
@ExtendWith(MockitoExtension.class)
class RecommendationServiceTest {

    @Mock
    private TmdbService tmdbService;

    private RecommendationService recommendationService;

    @BeforeEach
    void setUp() {
        recommendationService = new RecommendationService(tmdbService);
    }

    @Test
    @DisplayName("recommend() should return movies sorted by vote average descending")
    void recommendSortsByRating() {
        // Arrange: create movies with different ratings
        MovieDto lowRated = createMovie(1, "Low Movie", 5.5, List.of(28));
        MovieDto highRated = createMovie(2, "High Movie", 8.9, List.of(28));
        MovieDto midRated = createMovie(3, "Mid Movie", 7.2, List.of(28));

        TmdbSearchResponse response = new TmdbSearchResponse();
        response.setResults(Arrays.asList(lowRated, highRated, midRated));

        when(tmdbService.discoverMovies(anyString(), anyDouble(), anyInt())).thenReturn(response);
        when(tmdbService.getGenres()).thenReturn(List.of(new GenreDto(28, "Action")));

        // Act
        List<MovieDto> results = recommendationService.recommend(List.of(28), 5.0, 1);

        // Assert: results should be sorted highest rating first
        assertEquals(3, results.size());
        assertEquals("High Movie", results.get(0).getTitle());
        assertEquals("Mid Movie", results.get(1).getTitle());
        assertEquals("Low Movie", results.get(2).getTitle());
    }

    @Test
    @DisplayName("recommend() should enrich movies with genre names")
    void recommendEnrichesGenreNames() {
        // Arrange
        MovieDto movie = createMovie(1, "Action Comedy", 7.5, List.of(28, 35));

        TmdbSearchResponse response = new TmdbSearchResponse();
        response.setResults(List.of(movie));

        when(tmdbService.discoverMovies(anyString(), anyDouble(), anyInt())).thenReturn(response);
        when(tmdbService.getGenres()).thenReturn(List.of(
                new GenreDto(28, "Action"),
                new GenreDto(35, "Comedy")
        ));

        // Act
        List<MovieDto> results = recommendationService.recommend(List.of(28, 35), 7.0, 1);

        // Assert: genre names should be populated
        assertEquals(1, results.size());
        assertNotNull(results.get(0).getGenreNames());
        assertTrue(results.get(0).getGenreNames().contains("Action"));
        assertTrue(results.get(0).getGenreNames().contains("Comedy"));
    }

    @Test
    @DisplayName("recommend() should return empty list when TMDb returns null")
    void recommendHandlesNullResponse() {
        when(tmdbService.discoverMovies(anyString(), anyDouble(), anyInt())).thenReturn(null);

        List<MovieDto> results = recommendationService.recommend(List.of(28), 7.0, 1);

        assertNotNull(results);
        assertTrue(results.isEmpty());
    }

    @Test
    @DisplayName("recommend() should handle movies with no genre IDs")
    void recommendHandlesNoGenreIds() {
        MovieDto movie = createMovie(1, "No Genre", 8.0, Collections.emptyList());

        TmdbSearchResponse response = new TmdbSearchResponse();
        response.setResults(List.of(movie));

        when(tmdbService.discoverMovies(anyString(), anyDouble(), anyInt())).thenReturn(response);

        List<MovieDto> results = recommendationService.recommend(List.of(28), 7.0, 1);

        assertEquals(1, results.size());
        assertNotNull(results.get(0).getGenreNames());
        assertTrue(results.get(0).getGenreNames().isEmpty());
    }

    // ─── Test Helpers ────────────────────────────────────────────

    /**
     * Creates a MovieDto with the specified properties for testing.
     */
    private MovieDto createMovie(int id, String title, double rating, List<Integer> genreIds) {
        MovieDto movie = new MovieDto();
        movie.setId(id);
        movie.setTitle(title);
        movie.setVoteAverage(rating);
        movie.setGenreIds(genreIds);
        movie.setOverview("Test overview for " + title);
        movie.setPosterPath("/test-poster.jpg");
        return movie;
    }
}
