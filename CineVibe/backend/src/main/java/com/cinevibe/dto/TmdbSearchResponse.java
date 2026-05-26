package com.cinevibe.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * Wrapper DTO for TMDb paginated search/discover responses.
 * Captures the pagination metadata alongside the movie results.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class TmdbSearchResponse {

    /** Current page number */
    private int page;

    /** Total number of results across all pages */
    @JsonProperty("total_results")
    private int totalResults;

    /** Total number of pages available */
    @JsonProperty("total_pages")
    private int totalPages;

    /** List of movie results on this page */
    private List<MovieDto> results;

    public TmdbSearchResponse() {}

    // ─── Getters & Setters ───────────────────────────────────────

    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }

    public int getTotalResults() { return totalResults; }
    public void setTotalResults(int totalResults) { this.totalResults = totalResults; }

    public int getTotalPages() { return totalPages; }
    public void setTotalPages(int totalPages) { this.totalPages = totalPages; }

    public List<MovieDto> getResults() { return results; }
    public void setResults(List<MovieDto> results) { this.results = results; }
}
