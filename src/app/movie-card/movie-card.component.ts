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
  @Output() favoriteToggled = new EventEmitter<void>(); // Output event to notify when the favorite state changes

  // User data and favorite movies properties
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

  constructor(
    private fetchApiData: FetchApiDataService, // Injecting the FetchApiDataService to handle API calls
    private router: Router, // Injecting the Router to handle navigation events
    private snackBar: MatSnackBar // Injecting MatSnackBar for notifications
  ) {
    // Subscribe to navigation events to refresh data on /movies navigation
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd && event.url === '/movies') {
        this.getUser(() => this.getAllMovies()); // Fetch user and movies when navigating to '/movies'
      }
    });
  }

  ngOnInit(): void {
    // Fetch user data and movies when the component is initialized
    this.getUser(() => {
      this.getAllMovies(); // Fetch all movies
      this.loadFavoritesFromLocalStorage(); // Load favorites from localStorage
    });
  }

  // Checks if the user is authenticated based on token in localStorage
  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    if (!token) {
      this.router.navigate(['/login']); // Navigate to login if no token is found
      return false;
    }
    return true;
  }

  // Fetch user data and handle errors
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

  private updateMovieFavorites(): void {
    this.movies.forEach((movie) => {
      movie.isFavorite = this.favoriteMovies.some(
        (fav) => fav._id === movie._id
      );
    });
  }

  // Fetch all movies and map favorite status based on user data
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

  // Load favorite movies from localStorage and update their favorite status
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

  // Toggle the favorite status of a movie
  toggleFavorite(movie: Movie): void {
    if (movie.isFavorite) {
      // Remove from favorites
      this.fetchApiData.removeFromFavorites(movie._id).subscribe({
        next: () => {
          // Update favorite movies and movie state
          this.favoriteMovies = this.favoriteMovies.filter((m) => m._id !== movie._id);
          movie.isFavorite = false; // Immediately update the UI state
          localStorage.setItem('favoriteMovies', JSON.stringify(this.favoriteMovies));
          this.snackBar.open('Removed from favorites!', 'Close', { duration: 2000 });
        },
        error: (err) => {
          console.error('Error removing favorite:', err);
          this.snackBar.open('Failed to remove from favorites. Please try again.', 'Close', {
            duration: 2000,
          });
        },
      });
    } else {
      // Add to favorites
      this.fetchApiData.addToFavorites(movie._id).subscribe({
        next: () => {
          // Update favorite movies and movie state
          this.favoriteMovies.push(movie);
          movie.isFavorite = true; // Immediately update the UI state
          localStorage.setItem('favoriteMovies', JSON.stringify(this.favoriteMovies));
          this.snackBar.open('Added to favorites!', 'Close', { duration: 2000 });
        },
        error: (err) => {
          console.error('Error adding favorite:', err);
          this.snackBar.open('Failed to add to favorites. Please try again.', 'Close', {
            duration: 2000,
          });
        },
      });
    }
  }
  

  // Handle image loading errors by setting a placeholder image
  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/placeholder-image.jpg';
  }

  // Toggle visibility of movie details
  toggleAllDetails(movie: Movie): void {
    if (movie.areDetailsVisible === undefined) {
      movie.areDetailsVisible = false; // Initialize if not defined
    }
    movie.areDetailsVisible = !movie.areDetailsVisible; // Toggle visibility
  }

  // Create authorization headers with token for API calls
  createAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token found. Please log in.'); // Throw error if no token
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`); // Return headers with token
  }

  // Get the authentication token from localStorage
  getToken(): string | null {
    return localStorage.getItem('authToken'); // Return the token from localStorage
  }

  // Handle errors from API calls
  private handleError(error: HttpErrorResponse): void {
    this.error = error.message || 'An unknown error occurred.';
    console.error('Error:', error);
  }
}
