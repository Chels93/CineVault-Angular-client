import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FetchApiDataService, Movie } from '../fetch-api-data.service';
import { Router, NavigationEnd } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { User } from '../fetch-api-data.service';

/**
 * The MovieCardComponent displays a list of movies and manages user interactions like toggling favorites.
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
  ],
})
export class MovieCardComponent implements OnInit {
  /**
   * Event emitted when the favorite state of a movie is toggled.
   */
  @Output() favoriteToggled = new EventEmitter<void>(); // Output event to notify when the favorite state changes

  /**
   * User data including username, email, birthdate, and favorite movies.
   */
  userData: User = {
    username: '',
    email: '',
    birthdate: new Date(),
    favoriteMovies: [],
    password: '',
  };

  /**
   * List of the user's favorite movies.
   */
  favoriteMovies: Movie[] = [];

  /**
   * List of all movies.
   */
  movies: Movie[] = [];

  /**
   * Indicates whether the component is loading data.
   */
  loading: boolean = true;
  /**
   * Stores error messages, if any.
   */
  error: string | null = null;

  /**
   * Constructor for MovieCardComponent.
   * @param fetchApiData Service for API interactions.
   * @param router Angular Router for navigation.
   * @param snackBar MatSnackBar for notifications.
   */
  constructor(
    private fetchApiData: FetchApiDataService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    // Subscribe to navigation events to refresh data on /movies navigation
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd && event.url === '/movies') {
        this.getUser(() => this.getAllMovies()); // Fetch user and movies when navigating to '/movies'
      }
    });
  }

  /**
   * Lifecycle hook that runs after the component is initialized.
   */
  ngOnInit(): void {
    this.getUser(() => {
      this.getAllMovies(); // Fetch all movies
      this.loadFavoritesFromLocalStorage(); // Load favorites from localStorage
    });
  }

  /**
   * Checks if the user is authenticated based on the token in localStorage.
   * @returns True if authenticated, false otherwise.
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    if (!token) {
      this.router.navigate(['/login']); // Navigate to login if no token is found
      return false;
    }
    return true;
  }

  /**
   * Fetches user data from the API.
   * @param callback Optional callback function to run after user data is fetched.
   */
  private getUser(callback?: () => void): void {
    this.loading = true;
    this.error = null;

    this.fetchApiData.getUser().subscribe({
      next: (userData: User) => {
        this.userData = userData;
        this.favoriteMovies = userData.favoriteMovies;

        // Ensure movies are synced with favorites
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
   * Updates the favorite status of each movie based on user data.
   */
  private updateMovieFavorites(): void {
    this.movies.forEach((movie) => {
      movie.isFavorite = this.favoriteMovies.some(
        (fav) => fav._id === movie._id
      );
    });
  }

  /**
   * Fetches all movies from the API and updates their favorite status.
   */
  getAllMovies(): void {
    this.fetchApiData.getAllMovies().subscribe({
      next: (movies: Movie[]) => {
        this.movies = movies;
        this.updateMovieFavorites(); // Sync favorites after loading movies
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = 'Failed to load movies. Please try again later.';
        console.error('Error fetching movies:', err);
        this.loading = false;
      },
    });
  }

  /**
   * Loads the user's favorite movies from localStorage.
   */
  private loadFavoritesFromLocalStorage(): void {
    const storedFavorites = JSON.parse(
      localStorage.getItem('favoriteMovies') || '[]'
    );
    this.favoriteMovies = storedFavorites;

    // Update the favorite status for each movie based on localStorage
    this.movies.forEach((movie) => {
      movie.isFavorite = this.favoriteMovies.some(
        (fav) => fav._id === movie._id
      );
    });
  }

  /**
   * Toggles the favorite status of a movie.
   * @param movie The movie to toggle.
   */
  toggleFavorite(movie: Movie): void {
    if (movie.isFavorite) {
      this.fetchApiData.removeFromFavorites(movie._id).subscribe({
        next: () => {
          this.favoriteMovies = this.favoriteMovies.filter(
            (m) => m._id !== movie._id
          );
          movie.isFavorite = false;
          localStorage.setItem(
            'favoriteMovies',
            JSON.stringify(this.favoriteMovies)
          );
          this.snackBar.open('Removed from favorites!', 'Close', {
            duration: 2000,
          });
        },
        error: (err) => {
          console.error('Error removing favorite:', err);
          this.snackBar.open(
            'Failed to remove from favorites. Please try again.',
            'Close',
            {
              duration: 2000,
            }
          );
        },
      });
    } else {
      this.fetchApiData.addToFavorites(movie._id).subscribe({
        next: () => {
          this.favoriteMovies.push(movie);
          movie.isFavorite = true;
          localStorage.setItem(
            'favoriteMovies',
            JSON.stringify(this.favoriteMovies)
          );
          this.snackBar.open('Added to favorites!', 'Close', {
            duration: 2000,
          });
        },
        error: (err) => {
          console.error('Error adding favorite:', err);
          this.snackBar.open(
            'Failed to add to favorites. Please try again.',
            'Close',
            {
              duration: 2000,
            }
          );
        },
      });
    }
  }

  /**
   * Handles image loading errors by replacing the source with a placeholder.
   * @param event The image error event.
   */
  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/placeholder-image.jpg';
  }

  /**
   * Toggles the visibility of movie details.
   * @param movie The movie to toggle details for.
   */
  toggleAllDetails(movie: Movie): void {
    if (movie.areDetailsVisible === undefined) {
      movie.areDetailsVisible = false;
    }
    movie.areDetailsVisible = !movie.areDetailsVisible;
  }

  /**
   * Creates authorization headers for API calls.
   * @returns The HTTP headers with the authorization token.
   */
  createAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token found. Please log in.');
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  /**
   * Retrieves the authentication token from localStorage.
   * @returns The authentication token, or null if not found.
   */
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  /**
   * Handles errors from API calls.
   * @param error The error response from the API.
   */
  private handleError(error: HttpErrorResponse): void {
    this.error = error.message || 'An unknown error occurred.';
    console.error('Error:', error);
  }
}