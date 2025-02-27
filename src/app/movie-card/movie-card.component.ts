import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  HostListener,
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
import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';
import { MatInputModule } from '@angular/material/input';


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
    FormsModule,
    MatFormFieldModule,
    MatInputModule
  ],
})
export class MovieCardComponent implements OnInit {
  /**
   * Event emitted when the favorite state of a movie is toggled.
   */
  @Output() favoriteToggled = new EventEmitter<void>();

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
   * Filtered list of movies based on the search query.
   */
  filteredMovies: Movie[] = [];

  /**
   * The search query entered by the user.
   */
  searchQuery: string = '';

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
    private snackBar: MatSnackBar,
    private cdRef: ChangeDetectorRef
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
      // Initialize movies with the fetched data and set default values for show details flags
      this.movies = movies.map((movie) => ({
        ...movie,
        showSynopsis: false,
        showGenreDetails: false,
        showDirectorDetails: false,
        originalImagePath: movie.imagePath, // Store the original image path
      }));

      // Initialize filteredMovies with all movies
      this.filteredMovies = this.movies;

      // Sync favorites after loading movies
      this.updateMovieFavorites();

      // Set loading to false once data is fetched
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
    const isFavorite = this.favoriteMovies.some((m) => m._id === movie._id);
    const request = isFavorite
      ? this.fetchApiData.removeFromFavorites(movie._id)
      : this.fetchApiData.addToFavorites(movie._id);

    request.subscribe({
      next: () => {
        if (isFavorite) {
          // Remove from favorites
          this.favoriteMovies = this.favoriteMovies.filter(
            (m) => m._id !== movie._id
          );
          movie.isFavorite = false;
          this.snackBar.open('Removed from favorites!', 'Close', {
            duration: 2000,
          });
        } else {
          // Add to favorites
          this.favoriteMovies.push(movie);
          movie.isFavorite = true;
          this.snackBar.open('Added to favorites!', 'Close', {
            duration: 2000,
          });
        }

        // Save favorite movies list in localStorage
        localStorage.setItem(
          'favoriteMovies',
          JSON.stringify(this.favoriteMovies)
        );
      },
      error: (err) => this.handleError(err),
    });
  }

  /**
   * Toggles the visibility of a specific movie detail section while ensuring only one section is open at a time.
   *
   * @param {Movie} movie - The movie object whose details are being toggled.
   * @param {string} section - The section to toggle ('synopsis', 'genre' or 'director').
   */
  toggleContent(
    movie: Movie,
    section: 'synopsis' | 'genre' | 'director'
  ): void {
    // Define section keys to map to the correct properties in the movie object
    const sectionKeys: Record<'synopsis' | 'genre' | 'director', keyof Movie> = {
      synopsis: 'showSynopsis',
      genre: 'showGenreDetails',
      director: 'showDirectorDetails',
    };
  
    // First, close all sections by setting them to false
    for (const key in sectionKeys) {
      if (sectionKeys.hasOwnProperty(key)) {
        const sectionKey = sectionKeys[key as 'synopsis' | 'genre' | 'director'];
        (movie as any)[sectionKey] = false; // Set all sections to false
      }
    }
  
    // Then, open the selected section
    const selectedSection = sectionKeys[section];
    const isSectionOpen = !(movie as any)[selectedSection]; // Get the current state of the section
    (movie as any)[selectedSection] = isSectionOpen;
  
    // If the 'synopsis' section is being opened, hide the movie image
    if (section === 'synopsis') {
      if (isSectionOpen) {
        movie.imagePath = 'assets/placeholder-image.jpg'; // Replace image with placeholder when synopsis is open
      } else {
        movie.imagePath = movie.imagePath || movie.imagePath; // Restore original image if synopsis is closed
      }
    }
  
    // If the 'genre' section is being opened, hide the movie image
    if (section === 'genre') {
      if (isSectionOpen) {
        movie.imagePath = 'assets/placeholder-image.jpg'; // Replace image with placeholder when genre is open
      } else {
        movie.imagePath = movie.imagePath || movie.imagePath; // Restore original image if genre is closed
      }
    }
  
    // If the 'director' section is being opened, hide the movie image
    if (section === 'director') {
      if (isSectionOpen) {
        movie.imagePath = 'assets/placeholder-image.jpg'; // Replace image with placeholder when director is open
      } else {
        movie.imagePath = movie.imagePath || movie.imagePath; // Restore original image if director is closed
      }
    }
  
    // Manually trigger change detection after toggling content
    this.cdRef.detectChanges(); // Add this line to ensure the UI updates correctly
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
   * Filters the list of movies based on the search query.
   * Called on every input change.
   */
  filterMovies(): void {
    const query = this.searchQuery.toLowerCase();
    this.filteredMovies = this.movies.filter((movie) =>
      movie.title.toLowerCase().includes(query)
    );
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
