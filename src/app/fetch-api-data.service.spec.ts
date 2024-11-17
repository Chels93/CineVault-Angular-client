import { FetchApiDataService, User, Movie } from './fetch-api-data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

describe('UserProfileComponent', () => {
  let component: UserProfileComponent;
  let fetchApiDataSpy: jasmine.SpyObj<FetchApiDataService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    fetchApiDataSpy = jasmine.createSpyObj('FetchApiDataService', [
      'getUser', 
      'updateUser', 
      'addToFavorites', 
      'removeFromFavorites', 
      'getAllMovies'
    ]);

    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: FetchApiDataService, useValue: fetchApiDataSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    component = new UserProfileComponent(fetchApiDataSpy, snackBarSpy, routerSpy);
  });

  it('should log out and navigate to the login page', () => {
    spyOn(localStorage, 'clear');

    component.logout();

    expect(localStorage.clear).toHaveBeenCalled();
    expect(snackBarSpy.open).toHaveBeenCalledWith('Logged out successfully!', 'Close', { duration: 3000 });
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should update user profile successfully', () => {
    const updatedUser: User = {
      username: 'updatedUser',
      email: 'updated@test.com',
      birthdate: '1990-01-01',
    };
    fetchApiDataSpy.updateUser.and.returnValue(of(updatedUser));

    component.updateUser(updatedUser);

    expect(fetchApiDataSpy.updateUser).toHaveBeenCalledWith(updatedUser);
    expect(snackBarSpy.open).toHaveBeenCalledWith('User updated successfully!', 'Close', { duration: 3000 });
  });

  it('should handle errors when updating user profile', () => {
    fetchApiDataSpy.updateUser.and.returnValue(throwError(() => new Error('Failed to update user profile')));

    component.updateUser({ username: 'testUser' } as User);

    expect(snackBarSpy.open).toHaveBeenCalledWith('Failed to update user profile', 'Close', { duration: 3000 });
  });

  it('should add a movie to favorites successfully', () => {
    const username = 'testUser';
    const movieId = '123';
    fetchApiDataSpy.addToFavorites.and.returnValue(of({}));

    expect(fetchApiDataSpy.addToFavorites).toHaveBeenCalledWith(username, movieId);
    expect(snackBarSpy.open).toHaveBeenCalledWith('Movie added to favorites!', 'Close', { duration: 3000 });
  });

  it('should handle errors when adding a movie to favorites', () => {
    const username = 'testUser';
    const movieId = '123';
    fetchApiDataSpy.addToFavorites.and.returnValue(throwError(() => new Error('Failed to add movie to favorites')));
    expect(snackBarSpy.open).toHaveBeenCalledWith('Failed to add movie to favorites', 'Close', { duration: 3000 });
  });
});

describe('FetchApiDataService', () => {
  let service: FetchApiDataService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FetchApiDataService],
    });

    service = TestBed.inject(FetchApiDataService);
    httpTestingController = TestBed.inject(HttpTestingController);

    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'authToken') return 'mock-token';
      if (key === 'user') return JSON.stringify({ username: 'test-user', _id: 'mock-id' });
      return null;
    });
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUser', () => {
    it('should fetch user details successfully', () => {
      const mockUser: User = {
        username: 'test-user',
        email: 'test@test.com',
        birthdate: '2000-01-01',
        favoriteMovies: [],
      };

      service.getUser().subscribe((user) => {
        expect(user).toEqual(mockUser);
      });

      const req = httpTestingController.expectOne(`${service['apiUrl']}/users/test-user`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });

    it('should handle errors when fetching user details', () => {
      service.getUser().subscribe({
        next: () => fail('Expected an error, but got a response'),
        error: (error) => expect(error.message).toContain('Unauthorized access'),
      });

      const req = httpTestingController.expectOne(`${service['apiUrl']}/users/test-user`);
      req.flush('Unauthorized access', { status: 401, statusText: 'Unauthorized' });
    });
  });
});
