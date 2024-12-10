import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NavigationComponent } from './navigation.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('NavigationComponent', () => {
  let component: NavigationComponent;
  let fixture: ComponentFixture<NavigationComponent>;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NavigationComponent],
      imports: [RouterTestingModule], // Import RouterTestingModule to mock Router navigation
    });

    fixture = TestBed.createComponent(NavigationComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call logOut and navigate to login page', () => {
    spyOn(localStorage, 'removeItem'); // Spy on localStorage methods
    spyOn(router, 'navigate'); // Spy on navigate method

    component.logOut(); // Call logOut method

    expect(localStorage.removeItem).toHaveBeenCalledWith('authToken');
    expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    expect(router.navigate).toHaveBeenCalledWith(['/login']); // Verify navigation to /login
  });

  it('should navigate to movies when goHome is called', () => {
    spyOn(router, 'navigate'); // Spy on navigate method

    component.goToMovies(); // Call goHome method

    expect(router.navigate).toHaveBeenCalledWith(['/movies']); // Verify navigation to /home
  });

  it('should navigate to profile page when goToProfile is called', () => {
    spyOn(router, 'navigate'); // Spy on navigate method

    component.goToProfile(); // Call goToProfile method

    expect(router.navigate).toHaveBeenCalledWith(['/profile']); // Verify navigation to /profile
  });
});
