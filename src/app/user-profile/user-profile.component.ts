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
    MatIconModule
  ],
})
export class UserProfileComponent implements OnInit {
  userData: User = {
    username: '',
    email: '',
    birthdate: new Date(),
    favoriteMovies: [],
    password: '',
  };

  favoriteMovies: Movie[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private fetchApiData: FetchApiDataService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getUser(); // Fetch user data on component initialization
    this.getFavoriteMovies(); // Fetch favorite movies on component initialization
  }

  private handleError(error: HttpErrorResponse): void {
    console.error('Error occurred:', error);
    this.snackBar.open('An error occurred. Please try again later.', 'Close', { duration: 3000 });
    this.error = error.message;
    this.loading = false;
  }

  private getUser(): void {
    this.loading = true;
    this.fetchApiData.getUser().subscribe({
      next: (userData: User) => {
        this.userData = userData;
        this.loading = false;
      },
      error: (err) => this.handleError(err),
    });
  }

  private getFavoriteMovies(): void {
    this.loading = true;
    this.fetchApiData.getfavoriteMovies().subscribe({
      next: (movies: Movie[]) => {
        console.log('Movies data:', movies);
        this.favoriteMovies = movies;
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error fetching favorite movies:', error);
        this.snackBar.open('Error fetching favorite movies.', 'Close', { duration: 3000 });
        this.loading = false;
      },
    });
  }

  toggleFavorite(movie: Movie): void {
    const movieIndex = this.favoriteMovies.findIndex((m) => m._id === movie._id);

    if (movieIndex !== -1) {
      this.fetchApiData.removeFromFavorites(movie._id).subscribe(() => {
        this.favoriteMovies = this.favoriteMovies.filter((m) => m._id !== movie._id);
        movie.isFavorite = false;
        this.snackBar.open('Removed from favorites!', 'Close', { duration: 2000 });
        this.getFavoriteMovies();
      });
    } else {
      this.fetchApiData.addToFavorites(movie._id).subscribe(() => {
        this.favoriteMovies.push(movie);
        movie.isFavorite = true;
        this.snackBar.open('Added to favorites!', 'Close', { duration: 2000 });
        this.getFavoriteMovies();
      });
    }
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/placeholder-image.jpg';
  }

  public updateUser(updatedUserData: User): void {
    this.loading = true;

    this.fetchApiData.updateUser(updatedUserData).subscribe({
      next: (updatedData: User) => {
        this.userData = updatedData;
        this.loading = false;
        this.snackBar.open('Profile updated successfully!', 'Close', { duration: 3000 });
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error updating user data:', error);
        this.snackBar.open('Error updating user data.', 'Close', { duration: 3000 });
        this.loading = false;
      },
    });
  }

  public removeFromFavorites(movieId: string): void {
    this.loading = true;

    this.fetchApiData.removeFromFavorites(movieId).subscribe({
      next: () => {
        this.favoriteMovies = this.favoriteMovies.filter((movie) => movie._id !== movieId);
        this.snackBar.open('Removed from favorites!', 'Close', { duration: 3000 });
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error removing movie from favorites:', error);
        this.snackBar.open('Error removing from favorites.', 'Close', { duration: 3000 });
        this.loading = false;
      },
    });
  }

  toggleSynopsis(movie: Movie): void {
    movie.isSynopsisVisible = !movie.isSynopsisVisible;
  }

  toggleDirector(movie: Movie): void {
    movie.isDirectorVisible = !movie.isDirectorVisible;
  }

  toggleGenre(movie: Movie): void {
    movie.isGenreVisible = !movie.isGenreVisible;
  }

  public logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
    this.snackBar.open('Logged out successfully!', 'Close', { duration: 3000 });
  }

  private isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}
