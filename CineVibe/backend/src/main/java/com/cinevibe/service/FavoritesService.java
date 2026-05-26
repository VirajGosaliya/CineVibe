package com.cinevibe.service;

import com.cinevibe.model.FavoriteMovie;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * In-memory favorites storage service.
 * Manages the user's "watch later" list with add, remove, list, and reorder operations.
 * Uses a ConcurrentHashMap for thread-safe access in a multi-request environment.
 *
 * Note: For v1 this is ephemeral (resets on server restart).
 * A future version could persist favorites to a database.
 */
@Service
public class FavoritesService {

    private static final Logger log = LoggerFactory.getLogger(FavoritesService.class);

    /** Thread-safe map of movieId → FavoriteMovie */
    private final Map<Integer, FavoriteMovie> favorites = new ConcurrentHashMap<>();

    /** Tracks insertion order for consistent list rendering */
    private final List<Integer> ordering = Collections.synchronizedList(new ArrayList<>());

    // ─── CRUD Operations ─────────────────────────────────────────

    /**
     * Adds a movie to the favorites list.
     * If the movie already exists, it is not duplicated.
     *
     * @param movie the movie to favorite
     * @return the added (or existing) FavoriteMovie
     */
    public FavoriteMovie addFavorite(FavoriteMovie movie) {
        if (favorites.containsKey(movie.getId())) {
            log.info("Movie {} already in favorites, skipping", movie.getId());
            return favorites.get(movie.getId());
        }

        movie.setPosition(ordering.size());
        favorites.put(movie.getId(), movie);
        ordering.add(movie.getId());

        log.info("Added movie {} ('{}') to favorites at position {}", movie.getId(), movie.getTitle(), movie.getPosition());
        return movie;
    }

    /**
     * Removes a movie from the favorites list by its TMDb ID.
     *
     * @param movieId the TMDb movie ID to remove
     */
    public void removeFavorite(int movieId) {
        favorites.remove(movieId);
        ordering.remove(Integer.valueOf(movieId));
        recalculatePositions();

        log.info("Removed movie {} from favorites", movieId);
    }

    /**
     * Returns all favorites in the user's custom order.
     *
     * @return ordered list of favorite movies
     */
    public List<FavoriteMovie> getFavorites() {
        return ordering.stream()
                .map(favorites::get)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    /**
     * Reorders the favorites list based on the provided ID sequence.
     * This is called after a drag-and-drop reorder on the frontend.
     *
     * @param orderedIds the new ordering of movie IDs
     */
    public void reorder(List<Integer> orderedIds) {
        ordering.clear();
        ordering.addAll(orderedIds);
        recalculatePositions();

        log.info("Reordered favorites: {}", orderedIds);
    }

    // ─── Helpers ─────────────────────────────────────────────────

    /**
     * Updates the position field of each FavoriteMovie to match
     * its index in the ordering list.
     */
    private void recalculatePositions() {
        for (int i = 0; i < ordering.size(); i++) {
            FavoriteMovie movie = favorites.get(ordering.get(i));
            if (movie != null) {
                movie.setPosition(i);
            }
        }
    }
}
