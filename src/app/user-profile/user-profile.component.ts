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
  // User data and input bindings
  userData: User = {
    username: '',
    email: '',
    birthdate: new Date(),
    favoriteMovies: [],
    password: '',
  };

  // Input fields for editing user information
  updatedUsername = '';
  updatedEmail = '';
  updatedBirthdate = '';

  // Array to store the user's favorite movies
  favoriteMovies: Movie[] = [];
  loading = false;
  error: string | null = null;
  currentRoute: string = '';

  constructor(
    private fetchApiData: FetchApiDataService,
    private snackBar: MatSnackBar, // For displaying messages
    private router: Router // For navigation
  ) {}

  ngOnInit(): void {
    // Verify if user is authenticated and fetch user data
    this.checkAuthentication();
    this.getUser();
    this.getfavoriteMovies();
    this.currentRoute = this.router.url.split('/').pop() || ''; // Extract current route
  }

  // Checks if user is authenticated; redirects to login if not
  private checkAuthentication(): void {
    if (!this.isAuthenticated()) {
      this.router.navigate(['/login']);
      this.snackBar.open('Please log in to access your profile.', 'Close', {
        duration: 3000,
      });
    }
  }

  // Determines if user is authenticated by checking the token
  private isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return false;
    }

    // Optional: Add token validation logic
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decode token
      const isTokenExpired = payload.exp * 1000 < Date.now(); // Check expiration
      return !isTokenExpired;
    } catch (error) {
      return false;
    }
  }

  // Handles API errors and displays appropriate messages
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

  // Fetches user data from API and populates input fields
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
          this.updatedBirthdate =
            typeof userData.birthdate === 'string'
              ? new Date(userData.birthdate).toISOString().split('T')[0]
              : '';
        },
        error: (err) => this.handleError(err),
      });
  }

  // Fetches user's favorite movies from API
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

  // Toggles display of movie details in UI
  toggleAllDetails(movie: Movie): void {
    // Ensure the property exists
    if (!movie.hasOwnProperty('areDetailsVisible')) {
      movie.areDetailsVisible = false;
    }
    movie.areDetailsVisible = !movie.areDetailsVisible;
  }

  // Adds or removes a movie from user's favorites
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

  // Updates user profile with the edited details
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

  // Logs out user by clearing authentication token
  logout(): void {
    localStorage.removeItem('authToken');
    this.router.navigate(['/login']);
    this.snackBar.open('Logged out successfully!', 'Close', { duration: 3000 });
  }

  // Replaces broken image links with a placeholder image
  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/placeholder-image.jpg';
  }
}
