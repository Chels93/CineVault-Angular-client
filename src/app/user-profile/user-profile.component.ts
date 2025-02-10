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
   * Initializes the `UserProfileComponent`.
   * @param fetchApiData Service for API operations.
   * @param snackBar Service for displaying notifications.
   * @param router Service for navigation.
   */
  constructor(
    private fetchApiData: FetchApiDataService,
    private snackBar: MatSnackBar,
    private router: Router
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
      { duration: 3000 }
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
        next: (movies: Movie[]) => (this.favoriteMovies = movies),
        error: (err) => this.handleError(err),
      });
  }

  /**
   * Toggles the visibility of details for a specific movie.
   * @param movie The movie to toggle details for.
   */
  toggleAllDetails(movie: Movie): void {
    movie.areDetailsVisible = !movie.areDetailsVisible;
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
          this.favoriteMovies = this.favoriteMovies.filter(
            (m) => m._id !== movie._id
          );
          this.snackBar.open('Removed from favorites!', 'Close', {
            duration: 2000,
          });
        } else {
          this.favoriteMovies.push(movie);
          this.snackBar.open('Added to favorites!', 'Close', {
            duration: 2000,
          });
        }
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
        next: (updatedUserData: User) => {
          this.userData = updatedUserData;
          this.updatedUsername = updatedUserData.username;
          this.updatedEmail = updatedUserData.email;
          this.updatedBirthdate = updatedUserData.birthdate
            ? updatedUserData.birthdate.toString()
            : '';
          this.snackBar.open('Profile updated successfully!', 'Close', {
            duration: 3000,
          });
        },
        error: (err) => this.handleError(err),
      });
  }

  /**
   * Logs the user out by clearing their authentication token.
   */
  logout(): void {
    localStorage.removeItem('authToken');
    this.router.navigate(['/login']);
    this.snackBar.open('Logged out successfully!', 'Close', { duration: 3000 });
  }

  /**
   * Handles fallback for broken image links.
   * @param event The image error event.
   */
  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/placeholder-image.jpg';
  }
}
