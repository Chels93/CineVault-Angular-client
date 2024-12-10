import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovieCardComponent } from './movie-card.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FetchApiDataService } from '../fetch-api-data.service';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterModule } from '@angular/router';

describe('MovieCardComponent', () => {
  let component: MovieCardComponent;
  let fixture: ComponentFixture<MovieCardComponent>;
  let fetchApiDataService: jasmine.SpyObj<FetchApiDataService>;
  let router: jasmine.SpyObj<Router>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    // Creating spy objects for dependencies that will be injected into the component
    fetchApiDataService = jasmine.createSpyObj('FetchApiDataService', [
      'getAllMovies',
      'addToFavorites',
      'removeFromFavorites',
      'createAuthHeaders',
    ]);

    router = jasmine.createSpyObj('Router', ['navigate']);
    snackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    // Configuring the testing module with necessary declarations, imports, and providers
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

    // Creating component instance and triggering change detection
    fixture = TestBed.createComponent(MovieCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    // Test to check if the component is created successfully
    expect(component).toBeTruthy();
  });

  it('should fetch movies on initialization', () => {
    // Test to ensure that movies are fetched on component initialization
    const mockMovies = [{ _id: '1', title: 'Test Movie' }] as any;
    fetchApiDataService.getAllMovies.and.returnValue(of(mockMovies));

    component.ngOnInit(); // Calling ngOnInit to trigger the movie fetch

    expect(fetchApiDataService.getAllMovies).toHaveBeenCalled(); // Ensure getAllMovies was called
    expect(component.movies).toEqual(mockMovies); // Ensure movies are set correctly in the component
  });

  it('should handle error when fetching movies fails', () => {
    // Test to simulate an error when fetching movies and ensure it is handled correctly
    const errorResponse = new HttpErrorResponse({
      error: 'Error fetching movies',
      status: 500,
    });
    fetchApiDataService.getAllMovies.and.returnValue(throwError(errorResponse));

    component.ngOnInit(); // Trigger movie fetching

    expect(component.error).toBe(
      'Failed to load movies. Please try again later.'
    );
    expect(component.movies).toEqual([]); // Ensure movies are empty on error
  });

  it('should add movie to favorites when toggleFavorite is called', () => {
    // Test to ensure a movie is added to favorites correctly
    const movie = { _id: '1', title: 'Test Movie', isFavorite: false } as any;
    fetchApiDataService.addToFavorites.and.returnValue(of(movie)); // Mock the add to favorites API call

    component.toggleFavorite(movie); // Calling the toggleFavorite method

    expect(fetchApiDataService.addToFavorites).toHaveBeenCalledWith(movie._id);
    expect(movie.isFavorite).toBeTrue();
    expect(snackBar.open).toHaveBeenCalledWith('Added to favorites!', 'Close', {
      duration: 2000,
    });
  });

  it('should remove movie from favorites when toggleFavorite is called', () => {
    // Test to ensure a movie is removed from favorites correctly
    const movie = { _id: '1', title: 'Test Movie', isFavorite: true } as any;
    fetchApiDataService.removeFromFavorites.and.returnValue(of(movie)); // Mock the remove from favorites API call

    component.toggleFavorite(movie); // Calling the toggleFavorite method

    expect(fetchApiDataService.removeFromFavorites).toHaveBeenCalledWith(
      movie._id
    );
    expect(movie.isFavorite).toBeFalse();
    expect(snackBar.open).toHaveBeenCalledWith(
      'Removed from favorites!',
      'Close',
      { duration: 2000 }
    );
  });

  it('should handle image loading errors gracefully', () => {
    // Test to ensure a fallback image is used when there's an image loading error
    const event = new Event('error');
    const imgElement = document.createElement('img');
    spyOn(imgElement, 'setAttribute'); // Mock setAttribute to ensure it is called

    component.onImageError(event); // Trigger error handling

    expect(imgElement.setAttribute).toHaveBeenCalledWith(
      'src',
      'assets/placeholder-image.jpg'
    );
  });

  it('should toggle movie details visibility', () => {
    // Test to ensure movie details visibility toggles correctly
    const movie = {
      _id: '1',
      title: 'Test Movie',
      areDetailsVisible: false,
    } as any;

    component.toggleAllDetails(movie); // First toggle (details should be visible)
    expect(movie.areDetailsVisible).toBeTrue();

    component.toggleAllDetails(movie); // Second toggle (details should be hidden)
    expect(movie.areDetailsVisible).toBeFalse();
  });

  it('should navigate to login if not authenticated', () => {
    // Test to ensure that navigation occurs when no auth token is found
    localStorage.removeItem('authToken'); // Simulate no token being present

    const result = component.isAuthenticated();

    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should create correct authorization headers', () => {
    // Test to check if correct authorization headers are created
    const token = 'dummyToken';
    spyOn(localStorage, 'getItem').and.returnValue(token); // Mocking localStorage

    const headers = component.createAuthHeaders();

    expect(headers.get('Authorization')).toBe(`Bearer ${token}`);
  });
});
