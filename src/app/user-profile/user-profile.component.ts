import { Component, OnInit } from '@angular/core';
import { FetchApiDataService, User, Movie } from '../fetch-api-data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { NavigationComponent } from '../navigation/navigation.component';
import { finalize } from 'rxjs/operators';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    FormsModule,
    NavigationComponent,
  ],
})
export class UserProfileComponent implements OnInit {
  /**
   * The user's profile data.
   */
  userData: User = {
    username: '',
    email: '',
    birthdate: new Date(),
    favoriteMovies: [],
    password: '',
  };
  updatedUsername = '';
  updatedEmail = '';
  updatedBirthdate = '';
  favoriteMovies: Movie[] = [];

  loading = false;
  error: string | null = null;
  currentRoute = '';

  /**
   * The search query entered by the user.
   */
  searchQuery: string = '';

  /**
   * Filtered list of movies based on the search query.
   */
  filteredMovies: Movie[] = [];

  showDropdown: boolean = false;

  /**
   * List of all movies.
   */
  movies: Movie[] = [];

  /**
   * Initializes the `UserProfileComponent`.
   * @param fetchApiData Service for API operations.
   * @param snackBar Service for displaying notifications.
   * @param router Service for navigation.
   */
  constructor(
    private fetchApiData: FetchApiDataService,
    private snackBar: MatSnackBar,
    private router: Router,
    private cdRef: ChangeDetectorRef,
  ) {}

  /**
   * Lifecycle hook that runs on component initialization.
   * Checks authentication and retrieves user data and favorite movies.
   */
  ngOnInit(): void {
    this.checkAuthentication();
    this.getUser();
    this.getfavoriteMovies();
    this.currentRoute = this.router.url.split('/').pop() || '';
  }

  /**
   * Checks if the user is authenticated. Redirects to the login page if not authenticated.
   */
  private checkAuthentication(): void {
    if (!this.isAuthenticated()) {
      this.router.navigate(['/login']);
      this.snackBar.open('Please log in to access your profile.', 'Close', {
        duration: 3000,
      });
    }
  }

  /**
   * Validates the user's authentication token.
   * @returns `true` if the token is valid, `false` otherwise.
   */
  private isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  /**
   * Centralized error handler for API responses.
   * @param error The HTTP error to handle.
   */
  private handleError(error: HttpErrorResponse): void {
    console.error('Error occurred:', error);
    this.snackBar.open(
      error.status === 404
        ? 'User or favorite movies not found.'
        : 'An error occurred. Please try again later.',
      'Close',
      { duration: 3000 },
    );
    this.error = error.message;
    this.loading = false;
  }

  /**
   * Fetches user data from the API.
   */
  private getUser(): void {
    this.loading = true;
    this.fetchApiData
      .getUser()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (userData: User) => {
          this.userData = userData;
          this.updatedUsername = userData.username;
          this.updatedEmail = userData.email;
          this.updatedBirthdate = userData.birthdate
            ? new Date(userData.birthdate).toISOString().split('T')[0]
            : '';
        },
        error: (err) => this.handleError(err),
      });
  }

  /**
   * Fetches the user's favorite movies from the API.
   */
  private getfavoriteMovies(): void {
    this.loading = true;
    this.fetchApiData
      .getfavoriteMovies()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (movies: Movie[]) => {
          this.favoriteMovies = movies;

          // ✅ Initialize filteredMovies so the UI can render them
          this.filteredMovies = [...movies];

          // Set the favorite status for each movie
          this.favoriteMovies.forEach((movie) => {
            movie.isFavorite = true;
          });
        },
        error: (err) => this.handleError(err),
      });
  }

  /**
   * Toggles the visibility of genre details.
   * @param movie The movie object.
   */
  toggleGenreDetails(movie: Movie): void {
    movie.showGenreDetails = !movie.showGenreDetails;
  }

  /**
   * Toggles the visibility of director details.
   * @param movie The movie object.
   */
  toggleDirectorDetails(movie: Movie): void {
    movie.showDirectorDetails = !movie.showDirectorDetails;
  }

  /**
   * Toggles the visibility of a specific movie detail section while ensuring only one section is open at a time.
   *
   * @param {Movie} movie - The movie object whose details are being toggled.
   * @param {string} section - The section to toggle ('synopsis', 'genre' or 'director').
   */
  toggleContent(
    movie: Movie,
    section: 'synopsis' | 'genre' | 'director',
  ): void {
    const sectionKeys: Record<'synopsis' | 'genre' | 'director', keyof Movie> =
      {
        synopsis: 'showSynopsis',
        genre: 'showGenreDetails',
        director: 'showDirectorDetails',
      };

    const selectedSection = sectionKeys[section];
    const isSectionOpen = !(movie as any)[selectedSection]; // Get current state

    // Close all other sections
    for (const key of ['synopsis', 'genre', 'director']) {
      const sectionKey = sectionKeys[key as keyof typeof sectionKeys];
      (movie as any)[sectionKey] = false;
    }

    // Toggle selected section
    (movie as any)[selectedSection] = isSectionOpen;

    // Set hideImage flag for UI logic instead of changing the image path
    movie.hideImage = isSectionOpen;

    // Trigger change detection
    this.cdRef.detectChanges();
  }

  /**
   * Adds or removes a movie from the user's favorites.
   * @param movie The movie to add or remove.
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
            (m) => m._id !== movie._id,
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

        // Update favoriteMovies in localStorage
        localStorage.setItem(
          'favoriteMovies',
          JSON.stringify(this.favoriteMovies),
        );

        // Manually notify the /movies page (optional: you can use a shared service or event emitter here)
        window.dispatchEvent(new Event('favoritesUpdated'));
      },
      error: (err) => this.handleError(err),
    });
  }

  /**
   * Updates the user's profile with new data.
   */
  updateUser(): void {
    if (!this.updatedUsername || !this.updatedEmail || !this.updatedBirthdate) {
      this.error = 'Username, Email, and Birthdate are required!';
      return;
    }

    this.fetchApiData
      .updateUser({
        username: this.updatedUsername,
        email: this.updatedEmail,
        birthdate: this.updatedBirthdate,
      })
      .subscribe({
        next: () => {
          this.snackBar.open('Profile updated! Please log in again.', 'Close', {
            duration: 3000,
          });
          this.logout(); // 🔁 Immediately logout after update
        },
        error: (err) => this.handleError(err),
      });
  }

  onSearchInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchQuery = inputElement.value;

    if (this.searchQuery.trim() === '') {
      this.showDropdown = false;
    } else {
      this.filterMovies();
      this.showDropdown = this.filteredMovies.length > 0;
    }
  }

  // 🔵 WHEN USER CLICKS A MOVIE IN THE DROPDOWN
  selectMovie(movie: Movie): void {
    this.searchQuery = movie.title;
    this.showDropdown = false;
    // You could add more behavior here (like opening the movie details)
  }

  /**
   * Logs the user out by clearing their authentication token.
   */
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  /**
   * Handles fallback for broken image links.
   * @param event The image error event.
   */
  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/placeholder-image.jpg';
  }

  /**
   * Filters the movies based on the search query.
   */
  filterMovies(): void {
    if (this.searchQuery) {
      this.filteredMovies = this.favoriteMovies.filter((movie) =>
        movie.title.toLowerCase().includes(this.searchQuery.toLowerCase()),
      );
    } else {
      this.filteredMovies = [...this.favoriteMovies]; // Reset to all movies when no search query
    }
  }

  /**
   * Helper method to check for valid death year values.
   * Returns false if deathYear is null, undefined, empty string, or the literal string "null".
   * Useful when deathYear can come as a string "null" from some APIs.
   */
  isValidDeathYear(deathYear: any): boolean {
    return (
      deathYear !== null &&
      deathYear !== undefined &&
      deathYear !== '' &&
      deathYear !== 'null' &&
      !isNaN(Number(deathYear)) &&
      Number(deathYear) > 0
    );
  }
}