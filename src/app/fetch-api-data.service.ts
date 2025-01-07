import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

// Define Movie and User interfaces to structure data for type safety
export interface Movie {
  _id: string;
  title: string;
  genre: { name: string; description: string };
  director: {
    name: string;
    bio: string;
    birthYear: number;
    deathYear?: number | null;
  };
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
  providedIn: 'root', // This ensures the service is provided globally
})
export class FetchApiDataService {
  private apiUrl = 'https://mymoviesdb-6c5720b5bef1.herokuapp.com'; // Define the base API URL

  constructor(private httpClient: HttpClient) {}

  // Retrieve the authentication token from localStorage
  private getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // Retrieve the username from localStorage
  private getUsername(): string | null {
    const username = localStorage.getItem('username');
    console.log('Retrieved username:', username); // Debugging - This could be removed for production
    return username;
  }

  // Create authorization headers for HTTP requests
  private createAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token found. Please log in.'); // Notify user if no token is found
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Centralized error handling to improve maintainability and debugging
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('HTTP Status Code:', error.status);
    console.error('Error Details:', error.message);

    if (error.status === 401) {
      // Provide more details when unauthorized access occurs
      console.error('Unauthorized access - Invalid or expired token.');
    }

    // Throw an error to propagate it to the calling function
    return throwError(
      () => new Error(error.message || 'An unknown error occurred.')
    );
  }

  // Fetch all movies from the backend API
  public getAllMovies(): Observable<Movie[]> {
    return this.httpClient
      .get<Movie[]>(`${this.apiUrl}/movies`, {
        headers: this.createAuthHeaders(),
      })
      .pipe(catchError(this.handleError)); // Catch errors with a centralized handler
  }

  // Fetch user information from the backend
  public getUser(): Observable<User> {
    const username = this.getUsername();
    if (!username) {
      return throwError(() => new Error('No username found. Please log in.'));
    }

    return this.httpClient
      .get<User>(`${this.apiUrl}/users/${username}`, {
        headers: this.createAuthHeaders(),
      })
      .pipe(
        catchError(this.handleError),
        tap((user) => console.log('Fetched user data:', user)) // Debugging
      );
  }

  // Fetch favorite movies of a user
  public getfavoriteMovies(): Observable<Movie[]> {
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
          // Handle error cases like no favorite movies
          if (error.status === 404) {
            return throwError(
              () => new Error('No favorite movies found for this user.')
            );
          } else {
            return throwError(
              () => new Error('Error fetching favorite movies.')
            );
          }
        })
      );
  }

  // Add a movie to the user's favorites
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
      .pipe(catchError(this.handleError)); // Centralized error handling
  }

  // Remove a movie from the user's favorites
  public removeFromFavorites(movieId: string): Observable<any> {
    const username = this.getUsername();
    if (!username) {
      throw new Error('No username found. Please log in.');
    }
    return this.httpClient
      .delete<any>(`${this.apiUrl}/users/${username}/movies/${movieId}`, {
        headers: this.createAuthHeaders(),
      })
      .pipe(catchError(this.handleError)); // Centralized error handling
  }

  // User login service call
  public userLogin(credentials: {
    username: string;
    password: string;
  }): Observable<any> {
    return this.httpClient
      .post(`${this.apiUrl}/login`, credentials)
      .pipe(catchError(this.handleError)); // Centralized error handling
  }

  // User registration service call
  public userRegistration(user: User): Observable<any> {
    return this.httpClient
      .post(`${this.apiUrl}/users`, user)
      .pipe(catchError(this.handleError)); // Centralized error handling
  }

// Updated updateUser method without using username in the URL
public updateUser(payload: any): Observable<any> {
    const username = this.getUsername();
    if (!username) {
      return throwError(() => new Error('No username found. Please log in.'));
    }
  
    return this.httpClient
      .put(`${this.apiUrl}/users/${username}`, payload, {
        headers: this.createAuthHeaders(),
      })
      .pipe(catchError(this.handleError)); // Catch any errors
  }
  
  
}
