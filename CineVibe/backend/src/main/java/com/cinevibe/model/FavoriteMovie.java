package com.cinevibe.model;

/**
 * Domain model representing a movie saved to the user's favorites list.
 * Stores essential display information to avoid repeated TMDb lookups.
 */
public class FavoriteMovie {

    /** TMDb movie ID (used as unique key) */
    private int id;

    /** Movie title */
    private String title;

    /** Relative poster path for TMDb CDN */
    private String posterPath;

    /** Average rating at the time of favoriting */
    private double voteAverage;

    /** Position in the user's ordered favorites list */
    private int position;

    // ─── Constructors ────────────────────────────────────────────

    public FavoriteMovie() {}

    public FavoriteMovie(int id, String title, String posterPath, double voteAverage) {
        this.id = id;
        this.title = title;
        this.posterPath = posterPath;
        this.voteAverage = voteAverage;
    }

    // ─── Getters & Setters ───────────────────────────────────────

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getPosterPath() { return posterPath; }
    public void setPosterPath(String posterPath) { this.posterPath = posterPath; }

    public double getVoteAverage() { return voteAverage; }
    public void setVoteAverage(double voteAverage) { this.voteAverage = voteAverage; }

    public int getPosition() { return position; }
    public void setPosition(int position) { this.position = position; }
}
