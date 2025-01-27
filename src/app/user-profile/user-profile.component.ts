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
 * MovieCardComponent displays individual movie cards and manages the user's favorite movies.
 * It provides functionality for adding/removing movies from favorites, handling image errors, and toggling movie details.
 *
 * @class
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
  /** Emits an event when the favorite status of a movie is toggled */
  @Output() favoriteToggled = new EventEmitter<void>();
  /** Stores the current user's data */
  userData: User = {
    username: '',
    email: '',
    birthdate: new Date(),
    favoriteMovies: [],
    password: '',
  };

  favoriteMovies: Movie[] = [];
  movies: Movie[] = [];
  loading: boolean = true;
  error: string | null = null;

  /**
   * Creates an instance of the MovieCardComponent.
   *
   * @param fetchApiData Service to interact with the API for fetching movie and user data.
   * @param router Angular Router to handle navigation.
   * @param snackBar Angular Material Snackbar for displaying notifications.
   */
  constructor(
    private fetchApiData: FetchApiDataService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd && event.url === '/movies') {
        this.getUser(() => this.getAllMovies()); // Ensure getUser accepts this callback
      }
    });
  }

  /**
   * Initializes the component by loading user data and movie list.
   */
  ngOnInit(): void {
    this.getUser(() => {
      this.getAllMovies();
      this.loadFavoritesFromLocalStorage();
    });
  }

  /**
   * Checks if the user is authenticated by checking the presence of an authentication token.
   * If not authenticated, redirects to the login page.
   *
   * @returns true if the user is authenticated, otherwise false.
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
   * Fetches the current user's data from the API and updates the favorite movies.
   * Optionally calls a callback function once the data is retrieved.
   *
   * @param callback Optional callback to be executed after fetching the user data.
   */
  private getUser(callback?: () => void): void {
    this.loading = true;
    this.error = null;

    const username = this.fetchApiData.getUsername() || ''; // Get updated username from localStorage

    this.fetchApiData.getUser(username).subscribe({
      next: (userData: User) => {
        this.userData = userData;
        this.favoriteMovies = userData.favoriteMovies;
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('username', userData.username); // Update the username in localStorage
        this.loading = false;
        if (callback) callback();
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  /**
   * Updates the movie list to reflect the user's favorite movies.
   * Marks each movie as favorite if it exists in the user's favorite list.
   */
  private updateMovieFavorites(): void {
    this.movies.forEach((movie) => {
      movie.isFavorite = this.favoriteMovies.some(
        (fav) => fav._id === movie._id
      );
    });
  }

  /**
   * Fetches all movies from the API and updates the movie list.
   * Marks the movies as favorites based on the user's favorite list.
   */
  getAllMovies(): void {
    this.fetchApiData.getAllMovies().subscribe({
      next: (movies: Movie[]) => {
        this.movies = movies;
        this.updateMovieFavorites();
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
   * Loads the user's favorite movies from local storage and updates the movie list accordingly.
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
   * Toggles the favorite status of a movie.
   * If the movie is already a favorite, it is removed from the favorites list.
   * If the movie is not a favorite, it is added to the favorites list.
   * Updates the local storage and displays a notification.
   *
   * @param movie The movie to toggle as a favorite.
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
   * Handles image load errors by replacing the broken image with a placeholder.
   *
   * @param event The error event triggered when an image fails to load.
   */
  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/placeholder-image.jpg';
  }

  /**
   * Toggles the visibility of movie details.
   * If the details are currently visible, they will be hidden, and vice versa.
   *
   * @param movie The movie whose details visibility is to be toggled.
   */
  toggleAllDetails(movie: Movie): void {
    if (movie.areDetailsVisible === undefined) {
      movie.areDetailsVisible = false;
    }
    movie.areDetailsVisible = !movie.areDetailsVisible;
  }

  /**
   * Creates the authorization headers to be used in API requests.
   *
   * @returns The HttpHeaders object containing the Authorization header with the token.
   * @throws Error if no authentication token is found.
   */
  createAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  /**
   * Retrieves the authentication token from local storage.
   *
   * @returns The authentication token or null if not found.
   */
  getToken(): string {
    const token = localStorage.getItem('authToken');
    if (token === null || token.trim() === '') {
      throw new Error('Authentication token is missing or invalid.');
    }
    return token;
  }

  /**
   * Handles API errors by setting an error message and logging the error.
   *
   * @param error The error object returned by the API.
   */
  private handleError(error: HttpErrorResponse): void {
    this.error = error.message || 'An unknown error occurred.';
    console.error('Error:', error);
  }
}
