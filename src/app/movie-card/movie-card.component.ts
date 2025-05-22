import {
    Component,
    OnInit,
    Output,
    EventEmitter,
    ChangeDetectorRef,
  } from '@angular/core';
  import { FetchApiDataService, Movie, User } from '../fetch-api-data.service';
  import { Router, NavigationEnd } from '@angular/router';
  import { MatSnackBar } from '@angular/material/snack-bar';
  import { MatCardModule } from '@angular/material/card';
  import { MatIconModule } from '@angular/material/icon';
  import { MatButtonModule } from '@angular/material/button';
  import { MatDialogModule } from '@angular/material/dialog';
  import { MatSnackBarModule } from '@angular/material/snack-bar';
  import { CommonModule } from '@angular/common';
  import { RouterModule } from '@angular/router';
  import { FormsModule } from '@angular/forms';
  import { MatFormFieldModule } from '@angular/material/form-field';
  import { HttpErrorResponse } from '@angular/common/http';
  import { MatInputModule } from '@angular/material/input';
  
  /**
   * The MovieCardComponent displays a list of movies and manages user interactions like toggling favorites.
   * This component is standalone and imports Angular Material modules and common Angular modules it needs.
   */
  @Component({
    selector: 'app-movie-card',
    templateUrl: './movie-card.component.html',
    styleUrls: ['./movie-card.component.scss'],
    standalone: true,
    imports: [
      MatCardModule,
      MatIconModule,
      MatButtonModule,
      MatDialogModule,
      CommonModule,
      RouterModule,
      MatSnackBarModule,
      FormsModule,
      MatFormFieldModule,
      MatInputModule,
    ],
  })
  export class MovieCardComponent implements OnInit {
    /**
     * Event emitted when the favorite state of a movie is toggled.
     * Keep if this event is used outside; otherwise, can be removed.
     */
    @Output() favoriteToggled = new EventEmitter<void>();
  
    /** User data including username, email, birthdate, and favorite movies. */
    userData: User = {
      username: '',
      email: '',
      birthdate: new Date(),
      favoriteMovies: [],
      password: '',
    };
  
    /** List of the user's favorite movies. */
    favoriteMovies: Movie[] = [];
  
    /** List of all movies fetched from API. */
    movies: Movie[] = [];
  
    /** Filtered list of movies based on the search query. */
    filteredMovies: Movie[] = [];
  
    /** The search query entered by the user. */
    searchQuery: string = '';
  
    /** Indicates whether the component is loading data. */
    loading: boolean = true;
  
    /** Stores error messages, if any, to display to the user. */
    error: string | null = null;
  
    /**
     * Constructor with injected services.
     * Sets up router event listener to refresh data on navigation to /movies.
     */
    constructor(
      private fetchApiData: FetchApiDataService,
      private router: Router,
      private snackBar: MatSnackBar,
      private cdRef: ChangeDetectorRef
    ) {
      // Refresh user data and movies when navigating to /movies route
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd && event.url === '/movies') {
          this.getUser(() => this.getAllMovies());
        }
      });
    }
  
    /** Lifecycle hook that runs after the component is initialized. */
    ngOnInit(): void {
      this.getUser(() => {
        this.getAllMovies();
        this.loadFavoritesFromLocalStorage();
      });
    }
  
    /**
     * Checks if the user is authenticated based on the token in localStorage.
     * Navigates to login if no token found.
     * @returns true if authenticated; false otherwise.
     */
    isAuthenticated(): boolean {
      const token = localStorage.getItem('authToken');
      if (!token) {
        this.router.navigate(['/login']);
        return false;
      }
      return true;
    }
  
    /**
     * Centralized API error handler.
     * Logs error and stores message for UI feedback.
     * @param error The HttpErrorResponse from API call.
     */
    private handleError(error: HttpErrorResponse): void {
      this.error = error.message || 'An unknown error occurred.';
      console.error('API Error:', error);
    }
  
    /**
     * Fetches user data from API and updates favorites.
     * @param callback Optional callback after user data fetched.
     */
    private getUser(callback?: () => void): void {
      this.loading = true;
      this.error = null;
  
      this.fetchApiData.getUser().subscribe({
        next: (userData: User) => {
          this.userData = userData;
          this.favoriteMovies = userData.favoriteMovies;
          this.updateMovieFavorites();
  
          if (callback) callback();
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.handleError(error);
          this.loading = false;
        },
      });
    }
  
    /**
     * Updates favorite status for each movie based on user's favoriteMovies.
     */
    private updateMovieFavorites(): void {
      this.movies.forEach((movie) => {
        movie.isFavorite = this.favoriteMovies.some(
          (fav) => fav._id === movie._id
        );
      });
    }
  
    /**
     * Fetches all movies from API and initializes additional UI flags.
     */
    getAllMovies(): void {
      this.fetchApiData.getAllMovies().subscribe({
        next: (movies: Movie[]) => {
          // Initialize additional UI flags on each movie
          this.movies = movies.map((movie) => ({
            ...movie,
            showSynopsis: false,
            showGenreDetails: false,
            showDirectorDetails: false,
            originalImagePath: movie.imagePath,
            director: {
              ...movie.director,
              deathYear: this.isValidDeathYear(movie.director.deathYear)
                ? movie.director.deathYear
                : undefined,
            },
          }));
  
          this.filteredMovies = this.movies;
          this.updateMovieFavorites();
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load movies. Please try again later.';
          console.error('Error fetching movies:', err);
          this.loading = false;
        },
      });
    }
  
    /**
     * Validates that deathYear is a proper number.
     * @param deathYear Value to validate.
     * @returns true if valid, false otherwise.
     */
    isValidDeathYear(deathYear: any): boolean {
      return !isNaN(deathYear) && deathYear !== null && deathYear !== undefined;
    }
  
    /**
     * Loads favorites from localStorage and syncs with current movies.
     */
    private loadFavoritesFromLocalStorage(): void {
      const storedFavorites = JSON.parse(
        localStorage.getItem('favoriteMovies') || '[]'
      );
      this.favoriteMovies = storedFavorites;
  
      this.movies.forEach((movie) => {
        movie.isFavorite = this.favoriteMovies.some(
          (fav) => fav._id === movie._id
        );
      });
    }
  
    /**
     * Toggles favorite status of a movie via API calls and updates local state.
     * @param movie The movie object to toggle favorite.
     */
    toggleFavorite(movie: Movie): void {
      const isFavorite = this.favoriteMovies.some((m) => m._id === movie._id);
      const request = isFavorite
        ? this.fetchApiData.removeFromFavorites(movie._id)
        : this.fetchApiData.addToFavorites(movie._id);
  
      request.subscribe({
        next: () => {
          if (isFavorite) {
            this.favoriteMovies = this.favoriteMovies.filter(
              (m) => m._id !== movie._id
            );
            movie.isFavorite = false;
            this.snackBar.open('Removed from favorites!', 'Close', {
              duration: 2000,
            });
          } else {
            this.favoriteMovies.push(movie);
            movie.isFavorite = true;
            this.snackBar.open('Added to favorites!', 'Close', {
              duration: 2000,
            });
          }
  
          localStorage.setItem(
            'favoriteMovies',
            JSON.stringify(this.favoriteMovies)
          );
        },
        error: (err) => this.handleError(err),
      });
    }
  
    /**
     * Toggles one detail section for a movie and closes others.
     * Also toggles hiding of movie image for UI effect.
     * @param movie Movie object whose section is toggled.
     * @param section One of 'synopsis' | 'genre' | 'director' to toggle.
     */
    toggleContent(
      movie: Movie,
      section: 'synopsis' | 'genre' | 'director'
    ): void {
      const sectionKeys: Record<'synopsis' | 'genre' | 'director', keyof Movie> = {
        synopsis: 'showSynopsis',
        genre: 'showGenreDetails',
        director: 'showDirectorDetails',
      };
  
      const selectedSection = sectionKeys[section];
      const isSectionOpen = !(movie as any)[selectedSection];
  
      // Close all sections
      for (const key of ['synopsis', 'genre', 'director']) {
        const sectionKey = sectionKeys[key as keyof typeof sectionKeys];
        (movie as any)[sectionKey] = false;
      }
  
      // Toggle the selected section
      (movie as any)[selectedSection] = isSectionOpen;
  
      // Hide image while details are shown
      movie.hideImage = isSectionOpen;
  
      this.cdRef.detectChanges();
    }
  
    /**
     * Handles fallback when movie image fails to load.
     * @param event The image error event.
     */
    onImageError(event: Event): void {
      const target = event.target as HTMLImageElement;
      target.src = 'assets/placeholder-image.jpg';
    }
  
    /**
     * Filters movies by search query matching title, director name, or genre name.
     */
    filterMovies(): void {
      const query = this.searchQuery.toLowerCase();
  
      this.filteredMovies = this.movies.filter((movie) => {
        const titleMatches = movie.title.toLowerCase().includes(query);
        const directorMatches = movie.director.name.toLowerCase().includes(query);
        const genreMatches = movie.genre.name.toLowerCase().includes(query);
  
        return titleMatches || directorMatches || genreMatches;
      });
    }
  }
  