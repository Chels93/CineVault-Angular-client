import { TestBed } from '@angular/core/testing'; // Import Angular testing utilities
import { FetchApiDataService, User, Movie } from './fetch-api-data.service'; // Import the service and related interfaces
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing'; // Import testing modules for HTTP requests

// Main test suite for the FetchApiDataService
describe('FetchApiDataService', () => {
  let service: FetchApiDataService; // Service instance to be tested
  let httpTestingController: HttpTestingController; // Controller for handling mock HTTP requests

  // Set up the test environment before each test
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // Import HttpClientTestingModule to mock HTTP calls
      providers: [FetchApiDataService], // Provide the FetchApiDataService for testing
    });

    // Inject the service and HTTP testing controller
    service = TestBed.inject(FetchApiDataService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  // Ensure no outstanding HTTP requests remain after each test
  afterEach(() => {
    httpTestingController.verify();
  });

  /**
   * Test: Fetch all movies successfully
   */
  it('should fetch all movies', () => {
    const mockMovies: Movie[] = [
      {
        _id: '1',
        title: 'Test Movie',
        genre: { name: 'Action', description: 'Action-packed genre' },
        director: {
          name: 'John Doe',
          bio: 'Famous director',
          birthYear: 1970,
          deathYear: undefined, // Optional deathYear
        },
        synopsis: 'Exciting test movie synopsis',
        imagePath: 'path/to/image.jpg',
        releaseDate: new Date(),
      },
    ];

    // Subscribe to the `getAllMovies` method and assert the response
    service.getAllMovies().subscribe((movies) => {
      expect(movies.length).toBe(1); // Verify one movie is returned
      expect(movies).toEqual(mockMovies); // Check the response matches mock data
    });

    // Expect a GET request to the `/movies` endpoint
    const req = httpTestingController.expectOne(`${service['apiUrl']}/movies`);
    expect(req.request.method).toBe('GET'); // Ensure the request method is GET
    req.flush(mockMovies); // Simulate a successful backend response
  });

  /**
   * Test: Handle errors when fetching movies
   */
  it('should handle errors when fetching movies', () => {
    service.getAllMovies().subscribe(
      () => fail('Expected an error, but received data'), // Test should fail if no error is thrown
      (error) => expect(error.message).toBe('An unknown error occurred.') // Validate error message
    );

    // Simulate a server error response
    const req = httpTestingController.expectOne(`${service['apiUrl']}/movies`);
    req.flush('Error occurred', { status: 500, statusText: 'Server Error' });
  });

  /**
   * Test: Fetch user details successfully
   */
  it('should fetch user details', () => {
    const mockUser: User = {
      username: 'testUser',
      password: 'hashedPassword',
      email: 'test@example.com',
      birthdate: new Date('2000-01-01'),
      favoriteMovies: [],
    };

    spyOn(localStorage, 'getItem').and.returnValue('testUser'); // Mock localStorage

    service.getUser().subscribe((user) => {
      expect(user).toEqual(mockUser); // Verify response matches mock user
    });

    const req = httpTestingController.expectOne(
      `${service['apiUrl']}/users/testUser`
    );
    expect(req.request.method).toBe('GET'); // Ensure GET request
    req.flush(mockUser); // Simulate response
  });

  /**
   * Test: Handle error when fetching user details
   */
  it('should return error when fetching user fails', () => {
    spyOn(localStorage, 'getItem').and.returnValue('testUser'); // Mock localStorage

    service.getUser().subscribe(
      () => fail('Expected an error, but received data'),
      (error) => expect(error.message).toBe('An unknown error occurred.')
    );

    const req = httpTestingController.expectOne(
      `${service['apiUrl']}/users/testUser`
    );
    req.flush('Error occurred', { status: 404, statusText: 'Not Found' });
  });

  /**
   * Test: Add a movie to favorites successfully
   */
  it('should add a movie to favorites', () => {
    const movieId = '123';
    spyOn(localStorage, 'getItem').and.returnValue('testUser'); // Mock localStorage

    service.addToFavorites(movieId).subscribe((response) => {
      expect(response).toEqual({ message: 'Movie added to favorites' });
    });

    const req = httpTestingController.expectOne(
      `${service['apiUrl']}/users/testUser/movies/${movieId}`
    );
    expect(req.request.method).toBe('POST'); // Ensure POST request
    req.flush({ message: 'Movie added to favorites' });
  });

  /**
   * Test: Remove a movie from favorites successfully
   */
  it('should remove a movie from favorites', () => {
    const movieId = '123';
    spyOn(localStorage, 'getItem').and.returnValue('testUser'); // Mock localStorage

    service.removeFromFavorites(movieId).subscribe((response) => {
      expect(response).toEqual({ message: 'Movie removed from favorites' });
    });

    const req = httpTestingController.expectOne(
      `${service['apiUrl']}/users/testUser/movies/${movieId}`
    );
    expect(req.request.method).toBe('DELETE'); // Ensure DELETE request
    req.flush({ message: 'Movie removed from favorites' });
  });
});
