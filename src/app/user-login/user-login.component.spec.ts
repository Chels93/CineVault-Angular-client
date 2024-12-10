import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserLoginComponent } from './user-login.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FetchApiDataService } from '../fetch-api-data.service';
import { of } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

describe('UserLoginComponent', () => {
  let component: UserLoginComponent;
  let fixture: ComponentFixture<UserLoginComponent>;
  let fetchApiDataService: jasmine.SpyObj<FetchApiDataService>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<UserLoginComponent>>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let router: jasmine.SpyObj<Router>;

  // Setting up the test environment before each test
  beforeEach(async () => {
    // Create spies for the services that the component depends on
    fetchApiDataService = jasmine.createSpyObj('FetchApiDataService', [
      'userLogin',
    ]);
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    snackBar = jasmine.createSpyObj('MatSnackBar', ['open']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    // Configure the TestBed
    await TestBed.configureTestingModule({
      declarations: [UserLoginComponent], // Declare the component to be tested
      imports: [
        MatDialogModule, // Import necessary Material modules for dialogs
        MatSnackBarModule, // Import Material Snackbar for notifications
        MatFormFieldModule, // Import Material FormField for input fields
        MatInputModule, // Import Material Input for form controls
        ReactiveFormsModule, // Import ReactiveFormsModule to use reactive forms
        HttpClientTestingModule, // Import HttpClientTestingModule to mock HTTP requests
        RouterTestingModule, // Import RouterTestingModule to mock routing
        MatCardModule, // Import Material Card module for card design
        MatButtonModule, // Import Material Button module for button styling
      ],
      providers: [
        { provide: FetchApiDataService, useValue: fetchApiDataService }, // Provide mocked API service
        { provide: MatDialogRef, useValue: dialogRefSpy }, // Provide mocked MatDialogRef
        { provide: MatSnackBar, useValue: snackBar }, // Provide mocked MatSnackBar
        { provide: Router, useValue: router }, // Provide mocked Router service
      ],
    }).compileComponents(); // Compile components and their templates
  });

  // Setup for each individual test
  beforeEach(() => {
    fixture = TestBed.createComponent(UserLoginComponent); // Create a fixture for the component
    component = fixture.componentInstance; // Get the component instance
    fixture.detectChanges(); // Trigger change detection to update the component template
  });

  // Test for the initial component setup
  it('should create the component', () => {
    expect(component).toBeTruthy(); // Check if the component is created successfully
  });

  // Test for the login form submission (successful login scenario)
  it('should call userLogin when the form is valid and submitted', () => {
    // Prepare mock form data for valid login
    component.loginForm.setValue({
      username: 'testUser',
      password: 'testPassword',
    });

    // Mock the userLogin API call to return a successful response
    fetchApiDataService.userLogin.and.returnValue(of({ token: 'dummyToken' }));

    // Call the login function
    component.logInUser();

    // Check if the userLogin function was called with correct parameters
    expect(fetchApiDataService.userLogin).toHaveBeenCalledWith({
      username: 'testUser',
      password: 'testPassword',
    });

    // Ensure the login token is saved in localStorage
    expect(localStorage.getItem('authToken')).toBe('dummyToken');
    expect(localStorage.getItem('username')).toBe('testUser');

    // Check if the success snackbar is triggered
    expect(snackBar.open).toHaveBeenCalledWith('Login successful!', 'Close', {
      duration: 2000,
    });

    // Ensure the user is navigated to the profile page
    expect(router.navigate).toHaveBeenCalledWith(['/profile']);
  });

  // Test for the login form submission (failed login scenario)
  it('should display an error message when the login fails', () => {
    // Prepare mock form data for valid login
    component.loginForm.setValue({
      username: 'testUser',
      password: 'testPassword',
    });

    // Mock the userLogin API call to simulate a failure
    fetchApiDataService.userLogin.and.returnValue(
      of({
        error: 'Invalid credentials',
      })
    );

    // Call the login function
    component.logInUser();

    // Ensure the error snackbar is triggered
    expect(snackBar.open).toHaveBeenCalledWith(
      'Login failed. Please try again.',
      'Close',
      { duration: 3000 }
    );
  });

  // Test for the case when the form is invalid and submission is prevented
  it('should not call userLogin if the form is invalid', () => {
    // Set invalid form data
    component.loginForm.setValue({
      username: '',
      password: '',
    });

    // Call the login function with invalid form data
    component.logInUser();

    // Verify the userLogin function is not called with invalid form
    expect(fetchApiDataService.userLogin).not.toHaveBeenCalled();
  });

  // Test for the "Sign up here" button click
  it('should navigate to the registration page when "Sign up here" is clicked', () => {
    // Trigger the navigation to the registration page
    component.navigateToRegistration();

    // Check if the router navigates to the /register route
    expect(router.navigate).toHaveBeenCalledWith(['/register']);
  });

  // Test for the "isAuthenticated" method
  it('should check if the user is authenticated based on the token', () => {
    // Mock the localStorage data for a valid token
    spyOn(localStorage, 'getItem').and.returnValue('dummyToken');

    // Call the authentication check method
    const result = component['isAuthenticated'](); // Access private method for testing

    // Assert that the method returns true for a valid token
    expect(result).toBeTrue();
  });

  // Test for the "isAuthenticated" method when the token is expired or invalid
  it('should return false if the token is expired or invalid', () => {
    // Mock an expired token scenario
    spyOn(localStorage, 'getItem').and.returnValue(null);

    const result = component['isAuthenticated'](); // Access private method for testing

    // Assert that the method returns false when no token is found
    expect(result).toBeFalse();
  });
});
