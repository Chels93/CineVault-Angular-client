import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Movie {
  _id: string;
  title: string;
  genre: { name: string; description: string };
  director: { name: string; bio: string; birthYear: number; deathYear: number };
  synopsis: string;
  imagePath: string;
  releaseDate: Date;
  areDetailsVisible?: boolean;
  isFavorite?: boolean;
}

export interface User {
  username: string;
  password: string;
  email: string;
  birthdate?: Date;
  favoriteMovies: Movie[];
}

@Injectable({
  providedIn: 'root',
})
export class FetchApiDataService {
  private apiUrl = 'https://mymoviesdb-6c5720b5bef1.herokuapp.com';

  constructor(private httpClient: HttpClient) {}

  private getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private getUsername(): string | null {
    const username = localStorage.getItem('username');
    console.log('Retrieved username:', username); // Debugging
    return username;
  }

  private createAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token found. Please log in.');
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('HTTP Status Code:', error.status);
    console.error('Error Details:', error.message);
    if (error.status === 401) {
      // Additional handling for unauthorized errors
      console.error('Unauthorized access - Invalid or expired token.');
    }
    return throwError(() => new Error(error.message || 'An unknown error occurred.'));
  }

  // Fetch all movies
  public getAllMovies(): Observable<Movie[]> {
    return this.httpClient
      .get<Movie[]>(`${this.apiUrl}/movies`, {
        headers: this.createAuthHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  // Fetch user information
  public getUser(): Observable<User> {
    const username = this.getUsername();
    if (!username) {
      return throwError(() => new Error('No username found. Please log in.'));
    }
    return this.httpClient
      .get<User>(`${this.apiUrl}/users/${username}`, {
        headers: this.createAuthHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  // Fetch favorite movies of a user
  public getFavoriteMovies(): Observable<Movie[]> {
    const username = this.getUsername();
    if (!username) {
      return throwError(() => new Error('No username found. Please log in.'));
    }

    return this.httpClient
      .get<Movie[]>(`${this.apiUrl}/users/${username}/favoriteMovies`, {
        headers: this.createAuthHeaders(),
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 404) {
            return throwError(() => new Error('No favorite movies found for this user.'));
          } else {
            return throwError(() => new Error('Error fetching favorite movies.'));
          }
        })
      );
  }

  // Add a movie to favorites
  public addToFavorites(movieId: string): Observable<any> {
    const username = this.getUsername();
    if (!username) {
      throw new Error('No username found. Please log in.');
    }
    return this.httpClient
      .post<any>(
        `${this.apiUrl}/users/${username}/movies/${movieId}`,
        {},
        { headers: this.createAuthHeaders() }
      )
      .pipe(catchError(this.handleError));
  }

  // Remove a movie from favorites
  public removeFromFavorites(movieId: string): Observable<any> {
    const username = this.getUsername();
    if (!username) {
      throw new Error('No username found. Please log in.');
    }
    return this.httpClient
      .delete<any>(`${this.apiUrl}/users/${username}/movies/${movieId}`, {
        headers: this.createAuthHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  // User login
  public userLogin(credentials: {
    username: string;
    password: string;
  }): Observable<any> {
    return this.httpClient
      .post(`${this.apiUrl}/login`, credentials)
      .pipe(catchError(this.handleError));
  }

  // User registration
  public userRegistration(user: User): Observable<any> {
    return this.httpClient
      .post(`${this.apiUrl}/users`, user)
      .pipe(catchError(this.handleError));
  }

  // Update user information
  public updateUser(updatedUserData: Partial<User>): Observable<User> {
    const username = this.getUsername();
    if (!username) {
      throw new Error('No username found. Please log in.');
    }

    if (!updatedUserData.username || !updatedUserData.email) {
      throw new Error('Both username and email are required.');
    }

    return this.httpClient
      .put<User>(`${this.apiUrl}/users/${username}`, updatedUserData, {
        headers: this.createAuthHeaders(),
      })
      .pipe(catchError(this.handleError));
  }
}
