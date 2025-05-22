import { TestBed } from '@angular/core/testing';
import { FetchApiDataService, User, Movie } from './fetch-api-data.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

// Main test suite for the FetchApiDataService
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
  });

  afterEach(() => {
    httpTestingController.verify();
  });

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
        },
        synopsis: 'Exciting test movie synopsis',
        imagePath: 'path/to/image.jpg',
        releaseDate: new Date(),
        showSynopsis: false,
        showGenreDetails: false,
        showDirectorDetails: false,
        favoriteMovies: [],
      },
    ];

    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'authToken') return 'mock-token';
      return null;
    });

    service.getAllMovies().subscribe((movies) => {
      expect(movies.length).toBe(1);
      expect(movies).toEqual(mockMovies);
    });

    const req = httpTestingController.expectOne('https://mymoviesdb-6c5720b5bef1.herokuapp.com/movies');
    expect(req.request.method).toBe('GET');
    req.flush(mockMovies);
  });

  it('should handle errors when fetching movies', () => {
    spyOn(localStorage, 'getItem').and.returnValue('mock-token');

    service.getAllMovies().subscribe(
      () => fail('Expected an error, but got data'),
      (error) => expect(error.message).toBe('Error occurred')
    );

    const req = httpTestingController.expectOne('https://mymoviesdb-6c5720b5bef1.herokuapp.com/movies');
    req.flush('Error occurred', { status: 500, statusText: 'Server Error' });
  });

  it('should fetch user details', () => {
    const mockUser: User = {
      username: 'testUser',
      password: 'hashedPassword',
      email: 'test@example.com',
      birthdate: new Date('2000-01-01'),
      favoriteMovies: [],
    };

    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'authToken') return 'mock-token';
      if (key === 'username') return 'testUser';
      return null;
    });

    service.getUser().subscribe((user) => {
      expect(user).toEqual(mockUser);
    });

    const req = httpTestingController.expectOne('https://mymoviesdb-6c5720b5bef1.herokuapp.com/users/testUser');
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);
  });

  it('should return error when fetching user fails', () => {
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'authToken') return 'mock-token';
      if (key === 'username') return 'testUser';
      return null;
    });

    service.getUser().subscribe(
      () => fail('Expected error'),
      (error) => expect(error.message).toBe('Error occurred')
    );

    const req = httpTestingController.expectOne('https://mymoviesdb-6c5720b5bef1.herokuapp.com/users/testUser');
    req.flush('Error occurred', { status: 404, statusText: 'Not Found' });
  });

  it('should add a movie to favorites', () => {
    const movieId = '123';

    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'authToken') return 'mock-token';
      if (key === 'username') return 'testUser';
      return null;
    });

    service.addToFavorites(movieId).subscribe((res) => {
      expect(res).toEqual({ message: 'Movie added to favorites' });
    });

    const req = httpTestingController.expectOne('https://mymoviesdb-6c5720b5bef1.herokuapp.com/users/testUser/movies/123');
    expect(req.request.method).toBe('POST');
    req.flush({ message: 'Movie added to favorites' });
  });

  it('should remove a movie from favorites', () => {
    const movieId = '123';

    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'authToken') return 'mock-token';
      if (key === 'username') return 'testUser';
      return null;
    });

    service.removeFromFavorites(movieId).subscribe((res) => {
      expect(res).toEqual({ message: 'Movie removed from favorites' });
    });

    const req = httpTestingController.expectOne('https://mymoviesdb-6c5720b5bef1.herokuapp.com/users/testUser/movies/123');
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'Movie removed from favorites' });
  });
});