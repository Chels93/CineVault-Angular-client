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
  // Initial user data setup
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

  constructor(
    private fetchApiData: FetchApiDataService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  // Lifecycle hook - Component initialization
  ngOnInit(): void {
    this.checkAuthentication();
    this.getUser();
    this.getFavoriteMovies();
    this.currentRoute = this.router.url.split('/').pop() || '';
  }

  // Check if user is authenticated
  private checkAuthentication(): void {
    if (!this.isAuthenticated()) {
      this.router.navigate(['/login']);
      this.snackBar.open('Please log in to access your profile.', 'Close', {
        duration: 3000,
      });
    }
  }

  // Check token validity
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

  // Centralized error handling
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

  // Get user data
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

  // Get favorite movies
  private getFavoriteMovies(): void {
    this.loading = true;
    this.fetchApiData
      .getfavoriteMovies()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (movies: Movie[]) => (this.favoriteMovies = movies),
        error: (err) => this.handleError(err),
      });
  }

  // Toggle movie details visiblity
  toggleAllDetails(movie: Movie): void {
    movie.areDetailsVisible = !movie.areDetailsVisible;
  }

  // Toggle movie favorite status
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

  // Update user profile
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

  // Logout user
  logout(): void {
    localStorage.removeItem('authToken');
    this.router.navigate(['/login']);
    this.snackBar.open('Logged out successfully!', 'Close', { duration: 3000 });
  }

  // Handle image error
  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/placeholder-image.jpg';
  }
}
