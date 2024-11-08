import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

const apiUrl = 'https://mymoviesdb-6c5720b5bef1.herokuapp.com/';

@Injectable({
  providedIn: 'root',
})
export class FetchApiDataService {
  constructor(private http: HttpClient) {}

  // User Registration
  public userRegistration(userDetails: any): Observable<any> {
    return this.http
      .post(apiUrl + 'users', userDetails)
      .pipe(catchError(this.handleError));
  }

  // User Login
  public userLogin(userCredentials: any): Observable<any> {
    return this.http
      .post(apiUrl + 'login', userCredentials)
      .pipe(catchError(this.handleError));
  }

  // Get All Movies
  public getAllMovies(): Observable<any> {
    return this.http
      .get(apiUrl + 'movies')
      .pipe(catchError(this.handleError));
  }

  // Get One Movie
  public getMovie(movieId: string): Observable<any> {
    return this.http
      .get(apiUrl + 'movies/' + movieId)
      .pipe(catchError(this.handleError));
  }

  // Get Director
  public getDirector(directorName: string): Observable<any> {
    return this.http
      .get(apiUrl + 'directors/' + directorName)
      .pipe(catchError(this.handleError));
  }

  // Get Genre
  public getGenre(genreName: string): Observable<any> {
    return this.http
      .get(apiUrl + 'genres/' + genreName)
      .pipe(catchError(this.handleError));
  }

  // Get User
  public getUser(username: string): Observable<any> {
    return this.http
      .get(apiUrl + 'users/' + username)
      .pipe(catchError(this.handleError));
  }

  // Get Favorite Movies for a User
  public getFavoriteMovies(username: string): Observable<any> {
    return this.http
      .get(apiUrl + 'users/' + username + '/movies')
      .pipe(catchError(this.handleError));
  }

  // Add a Movie to Favorite Movies
  public addFavoriteMovie(username: string, movieId: string): Observable<any> {
    return this.http
      .post(apiUrl + 'users/' + username + '/movies/' + movieId, {})
      .pipe(catchError(this.handleError));
  }

  // Edit User
  public editUser(username: string, userDetails: any): Observable<any> {
    return this.http
      .put(apiUrl + 'users/' + username, userDetails)
      .pipe(catchError(this.handleError));
  }

  // Delete User
  public deleteUser(username: string): Observable<any> {
    return this.http
      .delete(apiUrl + 'users/' + username)
      .pipe(catchError(this.handleError));
  }

  // Delete a Movie from Favorite Movies
  public deleteFavoriteMovie(username: string, movieId: string): Observable<any> {
    return this.http
      .delete(apiUrl + 'users/' + username + '/movies/' + movieId)
      .pipe(catchError(this.handleError));
  }

  // Error Handling
  private handleError(error: HttpErrorResponse): any {
    if (error.error instanceof ErrorEvent) {
      console.error('Some error occurred:', error.error.message);
    } else {
      console.error(
        `Error Status code ${error.status}, ` + `Error body is: ${error.error}`
      );
    }
    return throwError('Something bad happened; please try again later.');
  }
}
