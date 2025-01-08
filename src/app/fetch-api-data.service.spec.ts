import { TestBed } from '@angular/core/testing'; // Importing the Angular testing framework
import { FetchApiDataService, User, Movie } from './fetch-api-data.service'; // Importing the service and related interfaces
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing'; // Modules for mocking HTTP requests

// Main test suite for the FetchApiDataService
describe('FetchApiDataService', () => {
  let service: FetchApiDataService; // Service instance to test
  let httpTestingController: HttpTestingController; // Controller to handle mock HTTP requests

  // Set up the test environment before each test
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // Import the HttpClientTestingModule for mocking HTTP calls
      providers: [FetchApiDataService], // Provide the FetchApiDataService to be tested
    });

    // Inject the service and HTTP testing controller into the test
    service = TestBed.inject(FetchApiDataService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  // Clean up after each test to ensure no outstanding HTTP requests remain
  afterEach(() => {
    httpTestingController.verify();
  });

  // Test case: Fetch all movies successfully
  it('should fetch all movies', () => {
    const mockMovies: Movie[] = [
      {
        _id: '1',
        title: 'Test Movie',
        genre: { name: 'Action', description: 'Action genre' },
        director: {
          name: 'John',
          bio: 'Director bio',
          birthYear: 1970,
          deathYear: null,
        }, // Mock data allowing null for `deathYear`
        synopsis: 'Test synopsis',
        imagePath: 'path/to/image',
        releaseDate: new Date(), // Mock release date
      },
    ];

    // Subscribe to the `getAllMovies` method and assert the response
    service.getAllMovies().subscribe((movies) => {
      expect(movies.length).toBe(1); // Assert the length of the response
      expect(movies).toEqual(mockMovies); // Assert the response matches the mock data
    });

    // Expect a GET request to the `/movies` endpoint
    const req = httpTestingController.expectOne(`${service['apiUrl']}/movies`);
    expect(req.request.method).toBe('GET'); // Ensure the HTTP method is GET
    req.flush(mockMovies); // Simulate a successful backend response with mock data
  });

  // Test case: Handle errors when fetching movies
  it('should handle errors when fetching movies', () => {
    // Subscribe to the `getAllMovies` method and assert error handling
    service.getAllMovies().subscribe(
      () => fail('Expected an error'), // Fail the test if no error is thrown
      (error) => expect(error.message).toBe('An unknown error occurred.') // Assert the error message
    );

    // Expect a GET request to the `/movies` endpoint
    const req = httpTestingController.expectOne(`${service['apiUrl']}/movies`);
    // Simulate a server error response
    req.flush('Error occurred', { status: 500, statusText: 'Server Error' });
  });
});
