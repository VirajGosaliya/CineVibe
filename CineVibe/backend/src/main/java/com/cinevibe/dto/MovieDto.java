package com.cinevibe.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * Data Transfer Object representing a movie from TMDb.
 * Maps the JSON response fields to Java properties with
 * snake_case → camelCase conversion via @JsonProperty.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class MovieDto {

    /** TMDb movie ID */
    private int id;

    /** Movie title */
    private String title;

    /** Plot overview / synopsis */
    private String overview;

    /** Relative path to the poster image on TMDb CDN */
    @JsonProperty("poster_path")
    private String posterPath;

    /** Relative path to the backdrop image */
    @JsonProperty("backdrop_path")
    private String backdropPath;

    /** Release date in YYYY-MM-DD format */
    @JsonProperty("release_date")
    private String releaseDate;

    /** Average user rating (0–10) */
    @JsonProperty("vote_average")
    private double voteAverage;

    /** Total number of votes */
    @JsonProperty("vote_count")
    private int voteCount;

    /** List of genre IDs associated with this movie */
    @JsonProperty("genre_ids")
    private List<Integer> genreIds;

    /** Resolved genre names (populated by the recommendation service) */
    private List<String> genreNames;

    // ─── Constructors ────────────────────────────────────────────

    public MovieDto() {}

    // ─── Getters & Setters ───────────────────────────────────────

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getOverview() { return overview; }
    public void setOverview(String overview) { this.overview = overview; }

    public String getPosterPath() { return posterPath; }
    public void setPosterPath(String posterPath) { this.posterPath = posterPath; }

    public String getBackdropPath() { return backdropPath; }
    public void setBackdropPath(String backdropPath) { this.backdropPath = backdropPath; }

    public String getReleaseDate() { return releaseDate; }
    public void setReleaseDate(String releaseDate) { this.releaseDate = releaseDate; }

    public double getVoteAverage() { return voteAverage; }
    public void setVoteAverage(double voteAverage) { this.voteAverage = voteAverage; }

    public int getVoteCount() { return voteCount; }
    public void setVoteCount(int voteCount) { this.voteCount = voteCount; }

    public List<Integer> getGenreIds() { return genreIds; }
    public void setGenreIds(List<Integer> genreIds) { this.genreIds = genreIds; }

    public List<String> getGenreNames() { return genreNames; }
    public void setGenreNames(List<String> genreNames) { this.genreNames = genreNames; }
}
