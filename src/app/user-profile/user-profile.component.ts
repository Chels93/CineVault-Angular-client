import { Component, OnInit } from '@angular/core';
import { FetchApiDataService, User, Movie } from '../fetch-api-data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatSnackBarModule],
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
  }

   // Method to fetch the user data (including favorite movies)
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
        this.snackBar.open('Error fetching user data.', 'Close', {
          duration: 3000,
        });
        this.error = 'Error fetching user data'; // Set error message
        this.loading = false;
      },
    });
  }

    // Toggle favorite movie logic
    toggleFavorite(movie: Movie): void {
        const movieIndex = this.favoriteMovies.findIndex(m => m._id === movie._id);
    
        if (movieIndex !== -1) {
          // If the movie is in favorites, remove it
          this.fetchApiData.removeFromFavorites(movie._id).subscribe(() => {
            this.favoriteMovies = this.favoriteMovies.filter((m) => m._id !== movie._id);
            movie.isFavorite = false; // Update movie object to reflect change
            this.snackBar.open('Removed from favorites!', 'Close', {
              duration: 2000,
            });
    
            // Optionally, refresh user data after removing
            this.getUser(); // Re-fetch the updated user data
          });
        } else {
          // If the movie is not in favorites, add it
          this.fetchApiData.addToFavorites(movie._id).subscribe(() => {
            this.favoriteMovies.push(movie); // Push the entire movie object, not just the _id
            movie.isFavorite = true; // Update movie object to reflect change
            this.snackBar.open('Added to favorites!', 'Close', {
              duration: 2000,
            });
    
            // Optionally, refresh user data after adding
            this.getUser(); // Re-fetch the updated user data
          });
        }
      }
    

// UserProfileComponent
private getFavoriteMovies(): void {
    this.fetchApiData.getfavoriteMovies().subscribe({
      next: (movies: Movie[]) => {
        this.favoriteMovies = movies;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error fetching favorite movies:', error);
        this.snackBar.open('Error fetching favorite movies.', 'Close', {
          duration: 3000,
        });
      },
    });
  }
  
  // Update user profile
  public updateUser(updatedUserData: User): void {
    this.loading = true;

    this.fetchApiData.updateUser(updatedUserData).subscribe({
      next: (updatedData: User) => {
        this.userData = updatedData;
        this.loading = false;
        this.snackBar.open('Profile updated successfully!', 'Close', {
          duration: 3000,
        });
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error updating user data:', error);
        this.snackBar.open('Error updating user data.', 'Close', {
          duration: 3000,
        });
        this.loading = false;
      },
    });
  }

  // Remove movie from favorites
  public removeFromFavorites(movieId: string): void {
    this.loading = true;

    this.fetchApiData.removeFromFavorites(movieId).subscribe({
      next: () => {
        this.favoriteMovies = this.favoriteMovies.filter(
          (movie) => movie._id !== movieId
        );
        this.snackBar.open('Removed from favorites!', 'Close', {
          duration: 3000,
        });
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error removing movie from favorites:', error);
        this.snackBar.open('Error removing from favorites.', 'Close', {
          duration: 3000,
        });
        this.loading = false;
      },
    });
  }

  // Logout user
  public logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
    this.snackBar.open('Logged out successfully!', 'Close', {
      duration: 3000,
    });
  }

  // Check if the user is authenticated (logged in)
  private isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}
