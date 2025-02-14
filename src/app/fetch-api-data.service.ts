import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

/**
 * Interface representing a Movie object.
 *
 * @property _id - Unique identifier for the movie.
 * @property title - Title of the movie.
 * @property genre - Genre information containing name and description.
 * @property director - Director details including name, biography, birth year, and optional death year.
 * @property synopsis - Brief description of the movie.
 * @property imagePath - URL for the movie poster or image.
 * @property releaseDate - Release date of the movie.
 * @property areDetailsVisible - Optional flag for displaying movie details.
 * @property isFavorite - Optional flag indicating if the movie is a favorite.
 */
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

/**
 * Interface representing a User object.
 *
 * @property username - Unique username for the user.
 * @property password - User's password.
 * @property email - User's email address.
 * @property birthdate - Optional birthdate of the user.
 * @property favoriteMovies - Array of favorite movies associated with the user.
 */
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
  private apiUrl = 'https://mymoviesdb-6c5720b5bef1.herokuapp.com';

  constructor(private httpClient: HttpClient) {}

  /**
   * Retrieves the authentication token from localStorage.
   *
   * @returns The authentication token or null if not found.
   */
  private getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  /**
   * Retrieves the username from localStorage.
   *
   * @returns The username or null if not found.
   */
  private getUsername(): string | null {
    const username = localStorage.getItem('username');
    console.log('Retrieved username:', username);
    return username;
  }

  /**
   * Creates authorization headers for HTTP requests.
   *
   * @returns An instance of HttpHeaders with the 'Authorization' token.
   * @throws An error if no token is found.
   */
  private createAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token found. Please log in.');
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  /**
   * Centralized error handling for API requests.
   *
   * @param error - The error response from the HTTP request.
   * @returns An Observable with the error.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('HTTP Status Code:', error.status);
    console.error('Error Details:', error.message);

    if (error.status === 401) {
      console.error('Unauthorized access - Invalid or expired token.');
    }
    return throwError(
      () => new Error(error.message || 'An unknown error occurred.')
    );
  }

  /**
   * Fetches all movies from the backend API.
   *
   * @returns An Observable containing an array of movies.
   */
  public getAllMovies(): Observable<Movie[]> {
    return this.httpClient
      .get<Movie[]>(`${this.apiUrl}/movies`, {
        headers: this.createAuthHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Fetches user information from the backend.
   *
   * @returns An Observable containing user data.
   */
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

  /**
   * Fetches favorite movies of a user.
   *
   * @returns An Observable containing an array of favorite movies.
   */
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

  /**
   * Adds a movie to the user's favorites.
   *
   * @param movieId - Unique identifier of the movie to be added.
   * @returns An Observable containing the result of the operation.
   */
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

  /**
   * Removes a movie from the user's favorites.
   *
   * @param movieId - Unique identifier of the movie to be removed.
   * @returns An Observable containing the result of the operation.
   */

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

  /**
   * Handles user login.
   *
   * @param credentials - The username and password for login.
   * @returns An Observable containing the login result.
   */
  public userLogin(credentials: {
    username: string;
    password: string;
  }): Observable<any> {
    return this.httpClient
      .post(`${this.apiUrl}/login`, credentials)
      .pipe(catchError(this.handleError));
  }

  /**
   * Handles user registration.
   *
   * @param user - User object containing registration details.
   * @returns An Observable containing the registration result.
   */
  public userRegistration(user: User): Observable<any> {
    return this.httpClient
      .post(`${this.apiUrl}/users`, user)
      .pipe(catchError(this.handleError));
  }

  /**
   * Updates user information.
   *
   * @param payload - The updated user data.
   * @returns An Observable containing the result of the update operation.
   */
  public updateUser(payload: any): Observable<any> {
    const username = this.getUsername();
    if (!username) {
      return throwError(() => new Error('No username found. Please log in.'));
    }

    return this.httpClient
      .put(`${this.apiUrl}/users/${username}`, payload, {
        headers: this.createAuthHeaders(),
      })
      .pipe(catchError(this.handleError));
  }
}