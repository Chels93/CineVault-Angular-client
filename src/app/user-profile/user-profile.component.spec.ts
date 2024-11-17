import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { UserProfileComponent } from './user-profile.component';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FetchApiDataService } from '../fetch-api-data.service';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse, HttpHeaders } from '@angular/common/http'; // <-- import HttpHeaders
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

describe('UserProfileComponent', () => {
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;
  let fetchApiDataService: jasmine.SpyObj<FetchApiDataService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // Create spies for the services
    const fetchApiDataSpy = jasmine.createSpyObj('FetchApiDataService', [
      'getUser', 
      'getfavoriteMovies', 
      'updateUser', 
      'removeFromFavorites'
    ]);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    // Configure the testing module
    await TestBed.configureTestingModule({
      declarations: [UserProfileComponent],
      imports: [
        FormsModule,
        CommonModule,
        MatSnackBarModule,
        MatInputModule,
        MatButtonModule,
        MatDialogModule,
        MatCardModule,
      ],
      providers: [
        { provide: FetchApiDataService, useValue: fetchApiDataSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfileComponent);
    component = fixture.componentInstance;
    fetchApiDataService = TestBed.inject(FetchApiDataService) as jasmine.SpyObj<FetchApiDataService>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Mock localStorage functions
    spyOn(localStorage, 'getItem').and.callFake((key: string) => key === 'authToken' ? 'fake-token' : null);
    spyOn(localStorage, 'setItem').and.callThrough();

    // Mock the API responses
    fetchApiDataService.getUser.and.returnValue(of({
      username: 'testuser',
      email: 'test@example.com',
      favoriteMovies: [],
      birthdate: '2000-01-01',
    }));
    fetchApiDataService.getfavoriteMovies.and.returnValue(of([]));
    fetchApiDataService.updateUser.and.returnValue(of({}));
    fetchApiDataService.removeFromFavorites.and.returnValue(of({}));

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch user data on initialization', () => {
    expect(fetchApiDataService.getUser).toHaveBeenCalled();
    expect(component.userData.username).toBe('testuser');
  });

  it('should display a snackbar message if the user update is successful', () => {
    component.updateUser();
    expect(fetchApiDataService.updateUser).toHaveBeenCalledWith(component.userData);
    expect(snackBar.open).toHaveBeenCalledWith('Profile updated successfully', 'Close', { duration: 2000 });
  });

  it('should display a snackbar message if user data fetch fails', () => {
    const error = new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
    fetchApiDataService.getUser.and.returnValue(throwError(() => error));
    fixture.detectChanges();
    expect(snackBar.open).toHaveBeenCalledWith('Error fetching user data', 'Close', { duration: 2000 });
  });

  it('should navigate to login page if no auth token is found', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    component.ngOnInit();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should remove a movie from favorites and show snackbar on successful removal', () => {
    // Updated movie mock objects with correct types for genre and director
    component.favoriteMovies = [
      { 
        _id: '1', 
        title: 'Movie 1', 
        genre: { name: 'Action', description: 'Action-packed movie' }, 
        director: { name: 'Director 1', bio: 'A well-known director', birthYear: 1970, deathYear: 2020 }, 
        synopsis: 'A thrilling action movie.', 
        imagePath: '/path/to/image1.jpg' 
      },
      { 
        _id: '2', 
        title: 'Movie 2', 
        genre: { name: 'Comedy', description: 'A hilarious comedy' }, 
        director: { name: 'Director 2', bio: 'A famous comedian director', birthYear: 1980, deathYear: 2025 }, 
        synopsis: 'A hilarious comedy.', 
        imagePath: '/path/to/image2.jpg' 
      }
    ];
  
    // Call the method with only 2 arguments
    component.removeFromFavorites('testuser', '1');  // Now passing only 2 arguments
    
    // Correct the spy call and check if the method was called with 2 arguments
    expect(fetchApiDataService.removeFromFavorites).toHaveBeenCalledWith('testuser', '1');  // Checking with 2 arguments
    expect(component.favoriteMovies.length).toBe(1);
    expect(snackBar.open).toHaveBeenCalledWith('Movie removed from favorites', 'Close', { duration: 2000 });
  });
  

  it('should log out and navigate to the login page', () => {
    spyOn(localStorage, 'clear');
    component.logout();
    expect(localStorage.clear).toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalledWith('Logged out successfully!', 'Close', { duration: 2000 });
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should load favorite movies from localStorage if present', () => {
    const storedFavorites = JSON.stringify([{ _id: '1', title: 'Stored Movie' }]);
    spyOn(localStorage, 'getItem').and.returnValue(storedFavorites);
    expect(component.favoriteMovies.length).toBe(1);
    expect(component.favoriteMovies[0].title).toBe('Stored Movie');
  });

  it('should not load favorite movies from localStorage if not present', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    expect(component.favoriteMovies.length).toBe(0);
  });

});
