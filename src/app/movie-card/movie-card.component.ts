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
  @Output() favoriteToggled = new EventEmitter<void>();

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
    private fetchApiData: FetchApiDataService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    // Subscribe to navigation events to refresh data on /movies navigation
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd && event.url === '/movies') {
        this.getUser(() => this.getAllMovies());
      }
    });
  }

  ngOnInit(): void {
    this.getUser(() => {
      this.getAllMovies();
    });
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }

  private getUser(callback?: () => void): void {
    this.loading = true;
    this.error = null;

    this.fetchApiData.getUser().subscribe({
      next: (userData: User) => {
        this.userData = userData;
        this.favoriteMovies = userData.favoriteMovies;
        if (callback) callback();
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.handleError(error);
        this.loading = false;
      },
    });
  }

  getAllMovies(): void {
    this.fetchApiData.getAllMovies().subscribe({
      next: (movies: Movie[]) => {
        this.movies = movies.map((movie) => ({
          ...movie,
          isFavorite: this.favoriteMovies.some((fav) => fav._id === movie._id),
        }));
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = 'Failed to load movies. Please try again later.';
        console.error('Error fetching movies:', err);
        this.loading = false;
      },
    });
  }

  toggleFavorite(movie: Movie): void {
    if (movie.isFavorite) {
      this.fetchApiData.removeFromFavorites(movie._id).subscribe(() => {
        this.favoriteMovies = this.favoriteMovies.filter((m) => m._id !== movie._id);
        movie.isFavorite = false;
        this.snackBar.open('Removed from favorites!', 'Close', { duration: 2000 });
        this.getUser();
      });
    } else {
      this.fetchApiData.addToFavorites(movie._id).subscribe(() => {
        this.favoriteMovies.push(movie);
        movie.isFavorite = true;
        this.snackBar.open('Added to favorites!', 'Close', { duration: 2000 });
        this.getUser();
      });
    }
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/placeholder-image.jpg';
  }

  toggleAllDetails(movie: Movie): void {
    if (movie.areDetailsVisible === undefined) {
      movie.areDetailsVisible = false;
    }
    movie.areDetailsVisible = !movie.areDetailsVisible;
  }

  createAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token found. Please log in.');
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private handleError(error: HttpErrorResponse): void {
    this.error = error.message || 'An unknown error occurred.';
    console.error('Error:', error);
  }
}
