package com.cinevibe;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * CineVibe Application — Entry point for the cinematic movie recommendation engine.
 * Bootstraps the Spring context and starts the embedded Tomcat server.
 */
@SpringBootApplication
public class CineVibeApplication {

    public static void main(String[] args) {
        SpringApplication.run(CineVibeApplication.class, args);
    }
}
