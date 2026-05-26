package com.cinevibe.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

/**
 * TMDb API configuration.
 * Reads the API key and base URL from application.yml and exposes
 * a pre-configured RestClient bean for all outbound TMDb requests.
 */
@Configuration
public class TmdbConfig {

    @Value("${tmdb.api-key}")
    private String apiKey;

    @Value("${tmdb.base-url}")
    private String baseUrl;

    @Value("${tmdb.image-base-url}")
    private String imageBaseUrl;

    /**
     * Creates a RestClient pre-configured with the TMDb base URL.
     * The API key is appended as a query parameter by TmdbService
     * (TMDb v3 uses ?api_key= authentication).
     *
     * @return configured RestClient for TMDb API calls
     */
    @Bean
    public RestClient tmdbRestClient() {
        return RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("Accept", "application/json")
                .build();
    }

    /**
     * @return the TMDb API key for query-parameter authentication fallback
     */
    public String getApiKey() {
        return apiKey;
    }

    /**
     * @return the base URL for TMDb image assets (e.g. https://image.tmdb.org/t/p)
     */
    public String getImageBaseUrl() {
        return imageBaseUrl;
    }
}
