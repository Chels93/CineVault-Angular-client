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

// Component for displaying and managing the user's profile. Includes functionality for updating user information, viewing favorite movies, and logging out.
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
  // User data retrieved from the API
  userData: User = {
    username: '',
    email: '',
    birthdate: new Date(),
    favoriteMovies: [],
    password: '',
  };

  // Data used for editing user information
  updatedUsername = '';
  updatedEmail = '';
  updatedBirthdate = '';

  // List of user's favorite movies
  favoriteMovies: Movie[] = [];
  loading = false; // Indicates whether a network request is ongoing
  error: string | null = null; // Holds error messages for display
  currentRoute: string = ''; // Tracks the current route for contextual actions

  constructor(
    private fetchApiData: FetchApiDataService,
    private snackBar: MatSnackBar,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Ensure user is logged in before accessing the profile
    this.checkAuthentication();

    // Fetch user data and favorite movies
    this.getUser();
    this.getfavoriteMovies();

    // Retrieve the current route for any route-specific logic
    this.currentRoute = this.router.url.split('/').pop() || '';
  }

  // Verifies if the user is authenticated; redirects to login if not
  private checkAuthentication(): void {
    if (!this.isAuthenticated()) {
      this.router.navigate(['/login']);
      this.snackBar.open('Please log in to access your profile.', 'Close', {
        duration: 3000,
      });
    }
  }

  // Checks if the user has a valid authentication token
  private isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isTokenExpired = payload.exp * 1000 < Date.now();
      return !isTokenExpired;
    } catch (error) {
      return false;
    }
  }

  // Handles errors by displaying a message and logging the error. @param error - The error object returned from the HTTP request

  private handleError(error: HttpErrorResponse): void {
    console.error('Error occurred:', error);
    const message =
      error.status === 404
        ? 'User or favorite movies not found.'
        : 'An error occurred. Please try again later.';
    this.snackBar.open(message, 'Close', { duration: 3000 });
    this.error = error.message;
    this.loading = false;
  }

  // Fetches user data from the API
  private getUser(): void {
    this.loading = true;
    this.fetchApiData
      .getUser()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (userData: User) => {
          this.userData = userData;

          // Populate the form fields for user update
          this.updatedUsername = userData.username;
          this.updatedEmail = userData.email;
          this.updatedBirthdate =
            typeof userData.birthdate === 'string'
              ? new Date(userData.birthdate).toISOString().split('T')[0]
              : '';
        },
        error: (err) => this.handleError(err),
      });
  }

  // Fetches the user's favorite movies
  private getfavoriteMovies(): void {
    this.loading = true;
    this.fetchApiData
      .getfavoriteMovies()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (movies: Movie[]) => {
          this.favoriteMovies = movies;
        },
        error: (err: HttpErrorResponse) => this.handleError(err),
      });
  }

  // Toggles the display of movie details. @param movie - The movie whose details are toggled
  toggleAllDetails(movie: Movie): void {
    if (!movie.hasOwnProperty('areDetailsVisible')) {
      movie.areDetailsVisible = false;
    }
    movie.areDetailsVisible = !movie.areDetailsVisible;
  }

  // Adds or removes a movie from the user's favorites. @param movie - The movie to be added or removed
  toggleFavorite(movie: Movie): void {
    const isFavorite = this.favoriteMovies.some((m) => m._id === movie._id);

    const request = isFavorite
      ? this.fetchApiData.removeFromFavorites(movie._id)
      : this.fetchApiData.addToFavorites(movie._id);

    request.subscribe({
      next: () => {
        if (isFavorite) {
          // Remove from favorites list
          this.favoriteMovies = this.favoriteMovies.filter(
            (m) => m._id !== movie._id,
          );
          this.snackBar.open('Removed from favorites!', 'Close', {
            duration: 2000,
          });
        } else {
          // Add to favorites list
          this.favoriteMovies.push(movie);
          this.snackBar.open('Added to favorites!', 'Close', {
            duration: 2000,
          });
        }
      },
      error: (err) => this.handleError(err),
    });
  }

  // Updates user information using the API
  updateUser(): void {
    if (!this.updatedUsername || !this.updatedEmail || !this.updatedBirthdate) {
      this.snackBar.open('All fields are required.', 'Close', {
        duration: 3000,
      });
      return;
    }

    this.loading = true;
    const updatedUserData: User = {
      ...this.userData,
      username: this.updatedUsername,
      email: this.updatedEmail,
      birthdate: new Date(this.updatedBirthdate),
    };

    this.fetchApiData
      .updateUser(updatedUserData)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (updatedData: User) => {
          this.userData = updatedData;
          this.snackBar.open('Profile updated successfully!', 'Close', {
            duration: 3000,
          });
        },
        error: (err: HttpErrorResponse) => this.handleError(err),
      });
  }

  // Logs the user out and redirects to the login page
  logout(): void {
    localStorage.removeItem('authToken');
    this.router.navigate(['/login']);
    this.snackBar.open('Logged out successfully!', 'Close', { duration: 3000 });
  }

  // Handles image loading errors by replacing it with a placeholder image. @param event - The image error event
  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/placeholder-image.jpg';
  }
}