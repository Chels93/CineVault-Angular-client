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
    fetchApiDataService = jasmine.createSpyObj('FetchApiDataService', [
      'getAllMovies',
      'addToFavorites',
      'removeFromFavorites',
      'createAuthHeaders',
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
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch movies on initialization', () => {
    const mockMovies = [{ _id: '1', title: 'Test Movie' }] as any;
    fetchApiDataService.getAllMovies.and.returnValue(of(mockMovies));

    component.ngOnInit();

    expect(fetchApiDataService.getAllMovies).toHaveBeenCalled();
    expect(component.movies).toEqual(mockMovies);
    expect(component.loading).toBeFalse();
  });

  it('should handle API error when fetching movies', () => {
    const errorResponse = new HttpErrorResponse({ error: 'Error', status: 500 });
    fetchApiDataService.getAllMovies.and.returnValue(throwError(() => errorResponse));

    component.ngOnInit();

    expect(component.error).toEqual(`Error fetching movies: Error`);
    expect(component.loading).toBeFalse();
  });

  it('should toggle favorite status and update UI', () => {
    const movie = { _id: '1', isFavorite: false } as any;
    const user = { favoriteMovies: [] };
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(user));
    fetchApiDataService.addToFavorites.and.returnValue(of({ favoriteMovies: ['1'] }));

    component.toggleFavorite(movie);

    expect(fetchApiDataService.addToFavorites).toHaveBeenCalledWith('username', '1', jasmine.any(Object)); // Updated for correct headers
    expect(snackBar.open).toHaveBeenCalledWith('Added to favorites', 'Close', { duration: 2000 });
    expect(movie.isFavorite).toBeTrue();
  });

  it('should remove a movie from favorites', () => {
    const movie = { _id: '1', isFavorite: true } as any;
    const user = { favoriteMovies: ['1'] };
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(user));
    fetchApiDataService.removeFromFavorites.and.returnValue(of({ favoriteMovies: [] }));

    component.toggleFavorite(movie);

    expect(fetchApiDataService.removeFromFavorites).toHaveBeenCalledWith('username', '1', jasmine.any(Object)); // Updated for correct headers
    expect(snackBar.open).toHaveBeenCalledWith('Removed from favorites', 'Close', { duration: 2000 });
    expect(movie.isFavorite).toBeFalse();
  });

  it('should navigate to login if the user is not authenticated', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
  
    // Now you can access isAuthenticated since it's public
    expect(component.isAuthenticated()).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
  

  it('should toggle synopsis visibility', () => {
    const movie = { isSynopsisVisible: false } as any;

    component.toggleSynopsis(movie);

    expect(movie.isSynopsisVisible).toBeTrue();
    component.toggleSynopsis(movie);
    expect(movie.isSynopsisVisible).toBeFalse();
  });

  it('should toggle director visibility', () => {
    const movie = { isDirectorVisible: false } as any;

    component.toggleDirector(movie);

    expect(movie.isDirectorVisible).toBeTrue();
    component.toggleDirector(movie);
    expect(movie.isDirectorVisible).toBeFalse();
  });

  it('should toggle genre visibility', () => {
    const movie = { isGenreVisible: false } as any;

    component.toggleGenre(movie);

    expect(movie.isGenreVisible).toBeTrue();
    component.toggleGenre(movie);
    expect(movie.isGenreVisible).toBeFalse();
  });
});
