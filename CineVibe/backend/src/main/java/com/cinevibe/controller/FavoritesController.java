package com.cinevibe.controller;

import com.cinevibe.model.FavoriteMovie;
import com.cinevibe.service.FavoritesService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for managing the user's favorites (watch later) list.
 * Supports CRUD operations and drag-and-drop reordering.
 */
@RestController
@RequestMapping("/api/favorites")
public class FavoritesController {

    private final FavoritesService favoritesService;

    public FavoritesController(FavoritesService favoritesService) {
        this.favoritesService = favoritesService;
    }

    // ─── List All Favorites ──────────────────────────────────────

    /**
     * Returns the user's favorites list in their custom order.
     *
     * @return ordered list of favorite movies
     */
    @GetMapping
    public ResponseEntity<List<FavoriteMovie>> getFavorites() {
        return ResponseEntity.ok(favoritesService.getFavorites());
    }

    // ─── Add to Favorites ────────────────────────────────────────

    /**
     * Adds a movie to the user's favorites list.
     * If already present, returns the existing entry without duplication.
     *
     * @param movie the movie to add (JSON request body)
     * @return the added favorite movie with assigned position
     */
    @PostMapping
    public ResponseEntity<FavoriteMovie> addFavorite(@RequestBody FavoriteMovie movie) {
        FavoriteMovie saved = favoritesService.addFavorite(movie);
        return ResponseEntity.ok(saved);
    }

    // ─── Remove from Favorites ───────────────────────────────────

    /**
     * Removes a movie from the favorites list by its TMDb ID.
     *
     * @param id the TMDb movie ID to remove
     * @return 204 No Content on success
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeFavorite(@PathVariable int id) {
        favoritesService.removeFavorite(id);
        return ResponseEntity.noContent().build();
    }

    // ─── Reorder Favorites ───────────────────────────────────────

    /**
     * Reorders the favorites list after a drag-and-drop operation.
     * Accepts the new ordered list of movie IDs.
     *
     * @param orderedIds the new sequence of movie IDs
     * @return 200 OK with the reordered favorites list
     */
    @PutMapping("/reorder")
    public ResponseEntity<List<FavoriteMovie>> reorder(@RequestBody List<Integer> orderedIds) {
        favoritesService.reorder(orderedIds);
        return ResponseEntity.ok(favoritesService.getFavorites());
    }
}
