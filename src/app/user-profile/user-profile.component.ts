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
    FormsModule 
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

  updatedUsername: string = '';
  updatedEmail: string = '';
  updatedBirthdate: string = '';

  favoriteMovies: Movie[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private fetchApiData: FetchApiDataService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getUser();
    this.getFavoriteMovies();
  }

  private handleError(error: HttpErrorResponse): void {
    console.error('Error occurred:', error);
    if (error.status === 404) {
      this.snackBar.open('User or favorite movies not found.', 'Close', { duration: 3000 });
    } else {
      this.snackBar.open('An error occurred. Please try again later.', 'Close', { duration: 3000 });
    }
    this.error = error.message;
    this.loading = false;
  }

  private getUser(): void {
    this.loading = true;
    this.fetchApiData.getUser().subscribe({
      next: (userData: User) => {
        this.userData = userData;
        this.updatedUsername = userData.username;
        this.updatedEmail = userData.email;

        if (typeof userData.birthdate === 'string') {
          userData.birthdate = new Date(userData.birthdate); 
        }

        this.updatedBirthdate = userData.birthdate instanceof Date 
          ? userData.birthdate.toISOString().split('T')[0] 
          : ''; 

        this.loading = false;
      },
      error: (err) => this.handleError(err),
    });
  }

  private getFavoriteMovies(): void {
    this.loading = true;
    this.fetchApiData.getfavoriteMovies().subscribe({
      next: (movies: Movie[]) => {
        this.favoriteMovies = movies;
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.snackBar.open('Error fetching favorite movies.', 'Close', { duration: 3000 });
        this.loading = false;
      },
    });
  }

  toggleFavorite(movie: Movie): void {
    const movieIndex = this.favoriteMovies.findIndex((m) => m._id === movie._id);

    if (movieIndex !== -1) {
      this.fetchApiData.removeFromFavorites(movie._id).subscribe({
        next: () => {
          this.favoriteMovies = this.favoriteMovies.filter((m) => m._id !== movie._id);
          movie.isFavorite = false;
          this.snackBar.open('Removed from favorites!', 'Close', { duration: 2000 });
        },
        error: (error) => this.handleError(error),
      });
    } else {
      this.fetchApiData.addToFavorites(movie._id).subscribe({
        next: () => {
          this.favoriteMovies.push(movie);
          movie.isFavorite = true;
          this.snackBar.open('Added to favorites!', 'Close', { duration: 2000 });
        },
        error: (error) => this.handleError(error),
      });
    }
  }

  public updateUser(): void {
    if (!this.updatedUsername || !this.updatedEmail || !this.updatedBirthdate) {
      this.snackBar.open('All fields are required.', 'Close', { duration: 3000 });
      this.loading = false;
      return;
    }

    this.loading = true;

    const updatedUserData: User = {
      ...this.userData,
      username: this.updatedUsername,
      email: this.updatedEmail,
      birthdate: new Date(this.updatedBirthdate),
    };

    this.fetchApiData.updateUser(updatedUserData).subscribe({
      next: (updatedData: User) => {
        this.userData = updatedData;
        this.loading = false;
        this.snackBar.open('Profile updated successfully!', 'Close', { duration: 3000 });
      },
      error: (error: HttpErrorResponse) => {
        this.snackBar.open('Error updating user data.', 'Close', { duration: 3000 });
        this.loading = false;
      },
    });
  }

  public logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
    this.snackBar.open('Logged out successfully!', 'Close', { duration: 3000 });
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/placeholder-image.jpg';
  }

  toggleAllDetails(movie: any): void {
    if (movie.areDetailsVisible === undefined) {
      movie.areDetailsVisible = false;
    }
    movie.areDetailsVisible = !movie.areDetailsVisible;
  }
}
