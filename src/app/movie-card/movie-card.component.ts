import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FetchApiDataService, Movie } from '../fetch-api-data.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';  // Import HttpErrorResponse

// Import the User type if it's defined in your fetch-api-data.service
import { User } from '../fetch-api-data.service';  // Import the User type

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
    favoriteMovies: [],  // This is an array of Movie objects, not IDs
    password: '',
  };

  favoriteMovies: Movie[] = [];  // Array of Movie objects, not strings
  movies: Movie[] = [];  // Array to store all movies (this was missing)
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private fetchApiData: FetchApiDataService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.getAllMovies();
    this.getUser(); // Call getUser to fetch user data
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }

  private getUser(): void {
    this.loading = true;
    this.error = null; // Reset error state on each attempt to fetch data

    this.fetchApiData.getUser().subscribe({
      next: (userData: User) => {
        this.userData = userData;
        this.favoriteMovies = userData.favoriteMovies; // Update favoriteMovies list
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error fetching user data:', error);
        this.snackBar.open('Error fetching user data.', 'Close', { duration: 3000 });
        this.error = 'Error fetching user data'; // Set error message
        this.loading = false;
      },
    });
  }

  getAllMovies(): void {
    this.fetchApiData.getAllMovies().subscribe({
      next: (movies: Movie[]) => {
        this.movies = Array.isArray(movies) ? movies : []; // Ensure movies is an array
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
    const movieIndex = this.favoriteMovies.findIndex((m) => m._id === movie._id);
  
    if (movieIndex !== -1) {
      // If the movie is in favorites, remove it
      this.fetchApiData.removeFromFavorites(movie._id).subscribe(() => {
        this.favoriteMovies = this.favoriteMovies.filter((m) => m._id !== movie._id);
        movie.isFavorite = false;
        this.snackBar.open('Removed from favorites!', 'Close', { duration: 2000 });
  
        // Re-fetch updated user data after removing the movie
        this.getUser(); // Re-fetch the updated user data
      });
    } else {
      // If the movie is not in favorites, add it
      this.fetchApiData.addToFavorites(movie._id).subscribe(() => {
        this.favoriteMovies.push(movie); // Add the entire movie object to favorites
        movie.isFavorite = true;
        this.snackBar.open('Added to favorites!', 'Close', { duration: 2000 });
  
        // Re-fetch updated user data after adding the movie
        this.getUser(); // Re-fetch the updated user data
      });
    }
  }
  
  

  addToFavorites(movieId: string): void {
    if (!movieId) {
      this.snackBar.open('Invalid movie ID.', 'Close', {
        duration: 2000,
      });
      return;
    }

    this.fetchApiData.addToFavorites(movieId).subscribe({
      next: () => {
        const movie = this.movies.find((m) => m._id === movieId);
        if (movie) {
          this.favoriteMovies.push(movie); // Add the entire Movie object
        }
        this.favoriteToggled.emit();
        this.snackBar.open('Movie added to favorites!', 'Close', {
          duration: 2000,
        });
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error adding to favorites:', err);
        this.snackBar.open('Failed to add movie to favorites. Please try again.', 'Close', {
          duration: 2000,
        });
      },
    });
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/placeholder-image.jpg';
  }
  
  toggleAllDetails(movie: any): void {
    // Assert that `movie` has an `areDetailsVisible` property, and toggle its value
    if (movie.areDetailsVisible === undefined) {
      movie.areDetailsVisible = false; // Initialize the property if it's undefined
    }
    movie.areDetailsVisible = !movie.areDetailsVisible;
  }
  

}
