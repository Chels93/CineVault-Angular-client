import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovieCardComponent } from './movie-card.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FetchApiDataService, Movie } from '../fetch-api-data.service'; // Import Movie type here
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterModule } from '@angular/router';

// IMPORTANT:
// App's Movie interface (imported above) includes these UI flags:
//   showSynopsis: boolean;
//   showGenreDetails: boolean;
//   showDirectorDetails: boolean;
//   hideImage: boolean;
// So **all test movie objects must include these properties** to satisfy TS.

describe('MovieCardComponent', () => {
  let component: MovieCardComponent;
  let fixture: ComponentFixture<MovieCardComponent>;
  let fetchApiDataService: jasmine.SpyObj<FetchApiDataService>;
  let router: jasmine.SpyObj<Router>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    fetchApiDataService = jasmine.createSpyObj('FetchApiDataService', [
      'getAllMovies',
      'addToFavorites',
      'removeFromFavorites',
      'getUser',
    ]);
    router = jasmine.createSpyObj('Router', ['navigate']);
    snackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      declarations: [MovieCardComponent],
      imports: [
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        CommonModule,
        RouterModule,
      ],
      providers: [
        { provide: FetchApiDataService, useValue: fetchApiDataService },
        { provide: Router, useValue: router },
        { provide: MatSnackBar, useValue: snackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MovieCardComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch user and movies on initialization', () => {
    const mockUser = {
      username: 'testuser',
      email: 'test@example.com',
      birthdate: new Date(),
      favoriteMovies: [],
      password: '',
    };

    // Provide all required properties, including UI flags
    const mockMovies: Movie[] = [
      {
        _id: '1',
        title: 'Test Movie',
        director: { name: 'Director Name' },
        genre: { name: 'Genre Name' },
        imagePath: 'path/to/image.jpg',
        synopsis: 'Test synopsis',
        isFavorite: false,
        showSynopsis: false,
        showGenreDetails: false,
        showDirectorDetails: false,
        hideImage: false,
      },
    ];

    fetchApiDataService.getUser.and.returnValue(of(mockUser));
    fetchApiDataService.getAllMovies.and.returnValue(of(mockMovies));

    component.ngOnInit();
    fixture.detectChanges();

    expect(fetchApiDataService.getUser).toHaveBeenCalled();
    expect(fetchApiDataService.getAllMovies).toHaveBeenCalled();
    expect(component.userData).toEqual(mockUser);
    expect(component.movies.length).toBe(1);
    expect(component.movies[0].title).toBe('Test Movie');
  });

  it('should handle error when fetching movies fails', () => {
    const errorResponse = new HttpErrorResponse({
      error: 'Error fetching movies',
      status: 500,
    });

    fetchApiDataService.getUser.and.returnValue(of(component.userData));
    fetchApiDataService.getAllMovies.and.returnValue(throwError(errorResponse));

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.error).toBe(
      'Failed to load movies. Please try again later.',
    );
    expect(component.movies).toEqual([]);
  });

  it('should add movie to favorites when toggleFavorite is called on a non-favorite movie', () => {
    const movie: Movie = {
      _id: '1',
      title: 'Test Movie',
      director: { name: 'Director Name' },
      genre: { name: 'Genre Name' },
      imagePath: 'path/to/image.jpg',
      synopsis: 'Test synopsis',
      isFavorite: false,
      showSynopsis: false,
      showGenreDetails: false,
      showDirectorDetails: false,
      hideImage: false,
    };

    fetchApiDataService.addToFavorites.and.returnValue(of(movie));

    component.favoriteMovies = [];
    component.toggleFavorite(movie);

    expect(fetchApiDataService.addToFavorites).toHaveBeenCalledWith(movie._id);
    expect(movie.isFavorite).toBeTrue();
    expect(snackBar.open).toHaveBeenCalledWith('Added to favorites!', 'Close', {
      duration: 2000,
    });
  });

  it('should remove movie from favorites when toggleFavorite is called on a favorite movie', () => {
    const movie: Movie = {
      _id: '1',
      title: 'Test Movie',
      director: { name: 'Director Name' },
      genre: { name: 'Genre Name' },
      imagePath: 'path/to/image.jpg',
      synopsis: 'Test synopsis',
      isFavorite: true,
      showSynopsis: false,
      showGenreDetails: false,
      showDirectorDetails: false,
      hideImage: false,
    };

    fetchApiDataService.removeFromFavorites.and.returnValue(of(movie));

    component.favoriteMovies = [movie];
    component.toggleFavorite(movie);

    expect(fetchApiDataService.removeFromFavorites).toHaveBeenCalledWith(
      movie._id,
    );
    expect(movie.isFavorite).toBeFalse();
    expect(snackBar.open).toHaveBeenCalledWith(
      'Removed from favorites!',
      'Close',
      { duration: 2000 },
    );
  });

  it('should handle image loading errors gracefully by setting fallback image source', () => {
    const imgElement = document.createElement('img');
    const event = { target: imgElement } as unknown as Event;

    component.onImageError(event);

    expect(imgElement.src).toContain('assets/placeholder-image.jpg');
  });

  it('should toggle movie detail sections correctly and hide image accordingly', () => {
    // Use a Movie with all UI flags initialized
    const movie: Movie = {
      _id: '1',
      title: 'Test Movie',
      director: { name: 'Director Name' },
      genre: { name: 'Genre Name' },
      imagePath: 'path/to/image.jpg',
      synopsis: 'Test synopsis',
      isFavorite: false,
      showSynopsis: false,
      showGenreDetails: false,
      showDirectorDetails: false,
      hideImage: false,
    };

    component.toggleContent(movie, 'synopsis');
    expect(movie.showSynopsis).toBeTrue();
    expect(movie.showGenreDetails).toBeFalse();
    expect(movie.showDirectorDetails).toBeFalse();
    expect(movie.hideImage).toBeTrue();

    component.toggleContent(movie, 'synopsis');
    expect(movie.showSynopsis).toBeFalse();
    expect(movie.hideImage).toBeFalse();

    component.toggleContent(movie, 'genre');
    expect(movie.showGenreDetails).toBeTrue();
    expect(movie.showSynopsis).toBeFalse();
    expect(movie.showDirectorDetails).toBeFalse();
    expect(movie.hideImage).toBeTrue();

    component.toggleContent(movie, 'director');
    expect(movie.showDirectorDetails).toBeTrue();
    expect(movie.showSynopsis).toBeFalse();
    expect(movie.showGenreDetails).toBeFalse();
    expect(movie.hideImage).toBeTrue();
  });

  it('should navigate to login if user is not authenticated', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);

    const isAuth = component.isAuthenticated();

    expect(isAuth).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  // No test for createAuthHeaders as it doesn't exist on the component
});