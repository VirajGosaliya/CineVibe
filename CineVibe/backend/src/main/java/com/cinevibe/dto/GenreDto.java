package com.cinevibe.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Data Transfer Object for a movie genre.
 * Maps directly from TMDb's /genre/movie/list response items.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class GenreDto {

    /** TMDb genre ID */
    private int id;

    /** Genre display name (e.g. "Action", "Comedy") */
    private String name;

    public GenreDto() {}

    public GenreDto(int id, String name) {
        this.id = id;
        this.name = name;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
