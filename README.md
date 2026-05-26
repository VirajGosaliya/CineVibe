# CineVibe 🎬

A cinematic movie recommendation app with a sleek dark-mode aesthetic, fluid animations, and real-time TMDb integration.

## Architecture

```
CineVibe/
├── backend/     → Spring Boot 3.4 REST API (Java 21)
└── frontend/    → Vanilla HTML/CSS/JS single-page app
```

## Quick Start

### Prerequisites
- **Java 21** (JDK)
- **Maven 3.9+** (or use the included Maven wrapper)
- **TMDb API Key** — 2659aad84af4d618a3c533c8ca11a476

### 1. Configure TMDb API Key
Edit `backend/src/main/resources/application.yml`:
```yaml
tmdb:
  api-key: 2659aad84af4d618a3c533c8ca11a476
```

### 2. Start the Backend
```bash
cd backend
mvn spring-boot:run
```
The API starts on `http://localhost:8080`.

### 3. Open the Frontend
Open `frontend/index.html` in a browser via **Live Server** (VS Code extension) on port **5500**, or any local HTTP server.

## Features

| Feature | Description |
|---------|-------------|
| 🔍 **Hero Search** | Debounced auto-suggest with keyboard navigation |
| 🎯 **Genre Filters** | Clickable pills with rating slider |
| 🃏 **Movie Cards** | Scale + overlay hover animations |
| ❤️ **Watchlist** | Drag-and-drop sidebar with reordering |
| 🎬 **Recommendations** | Genre + rating filtered results from TMDb |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/movies/search?q=` | Search movies |
| GET | `/api/movies/trending` | Weekly trending |
| GET | `/api/movies/genres` | Genre list |
| GET | `/api/movies/recommend?genres=&minRating=` | Filtered recommendations |
| GET | `/api/favorites` | List favorites |
| POST | `/api/favorites` | Add favorite |
| DELETE | `/api/favorites/{id}` | Remove favorite |
| PUT | `/api/favorites/reorder` | Reorder favorites |

## Tech Stack
- **Backend**: Java 21, Spring Boot 3.4, RestClient, Jackson
- **Frontend**: HTML5, CSS3 (custom properties), Vanilla JavaScript (ES6+ modules)
- **Data**: TMDb API v3
- **Design**: Dark mode, glassmorphism, CSS keyframe animations, Outfit + Inter fonts
