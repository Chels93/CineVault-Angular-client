import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserRegistrationComponent } from './user-registration.component';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { FetchApiDataService } from '../fetch-api-data.service';

// Describe the test suite for UserRegistrationComponent
describe('UserRegistrationComponent', () => {
  // Declare component and service variables to be used in tests
  let component: UserRegistrationComponent;
  let fixture: ComponentFixture<UserRegistrationComponent>;
  let fetchApiDataService: jasmine.SpyObj<FetchApiDataService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<UserRegistrationComponent>>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  // Initialize the testing module and inject necessary dependencies
  beforeEach(async () => {
    // Create spies for the services used in the component (to mock their behavior)
    const fetchApiDataSpy = jasmine.createSpyObj('FetchApiDataService', [
      'userRegistration',
    ]);
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    // Configure the TestBed for the component
    await TestBed.configureTestingModule({
      declarations: [UserRegistrationComponent], // Declare the component to be tested
      imports: [
        MatSnackBarModule, // Import necessary modules for testing
        ReactiveFormsModule,
        HttpClientTestingModule,
      ],
      providers: [
        // Provide mocked services
        { provide: FetchApiDataService, useValue: fetchApiDataSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
      ],
    }).compileComponents(); // Compile the component and its dependencies

    // Create the component instance and inject the dependencies
    fixture = TestBed.createComponent(UserRegistrationComponent);
    component = fixture.componentInstance;
    fetchApiDataService = TestBed.inject(
      FetchApiDataService
    ) as jasmine.SpyObj<FetchApiDataService>;
    dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<
      MatDialogRef<UserRegistrationComponent>
    >;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    fixture.detectChanges(); // Trigger change detection to update the component
  });

  // Test case 1: Ensure the component is created successfully
  it('should create', () => {
    expect(component).toBeTruthy(); // Check if the component instance is created
  });

  // Test case 2: Ensure the registration form initializes with empty fields and validators
  it('should initialize the form with empty fields and required validators', () => {
    const form = component.registrationForm;
    expect(form).toBeDefined(); // Ensure the form is defined
    expect(form.get('username')?.hasError('required')).toBeTrue(); // Check if 'username' field has 'required' validation
    expect(form.get('password')?.hasError('required')).toBeTrue(); // Check if 'password' field has 'required' validation
    expect(form.get('email')?.hasError('required')).toBeTrue(); // Check if 'email' field has 'required' validation
  });

  // Test case 3: Ensure the form shows an error message if invalid
  it('should mark the form as touched and show error if form is invalid', () => {
    component.registerUser(); // Call the registerUser method (form is invalid)
    expect(component.registrationForm.touched).toBeTrue(); // Check if the form has been touched
    expect(snackBar.open).toHaveBeenCalledWith(
      'Please fill in all required fields correctly', // Verify if the correct error message is shown
      'OK',
      { duration: 3000 }
    );
  });

  // Test case 4: Ensure the userRegistration method is called when form is valid
  it('should call userRegistration on FetchApiDataService when form is valid', () => {
    component.registrationForm.setValue({
      username: 'testuser',
      password: 'password123',
      email: 'test@example.com',
      birthdate: '',
    });
    fetchApiDataService.userRegistration.and.returnValue(of({ success: true })); // Mock successful API response

    component.registerUser(); // Call the registerUser method
    expect(fetchApiDataService.userRegistration).toHaveBeenCalledWith(
      component.registrationForm.value
    ); // Verify API call with correct data
  });

  // Test case 5: Ensure success message is shown and dialog is closed on successful registration
  it('should show success message and close dialog on successful registration', () => {
    component.registrationForm.setValue({
      username: 'testuser',
      password: 'password123',
      email: 'test@example.com',
      birthdate: '',
    });
    fetchApiDataService.userRegistration.and.returnValue(of({ success: true })); // Mock successful API response

    component.registerUser(); // Call the registerUser method
    expect(snackBar.open).toHaveBeenCalledWith(
      'User registration successful',
      'OK',
      { duration: 2000 }
    ); // Verify success message is shown
    expect(dialogRef.close).toHaveBeenCalled(); // Verify dialog close action
  });

  // Test case 6: Ensure error message is shown if registration fails
  it('should show error message if registration fails', () => {
    component.registrationForm.setValue({
      username: 'testuser',
      password: 'password123',
      email: 'test@example.com',
      birthdate: '',
    });
    fetchApiDataService.userRegistration.and.returnValue(
      throwError({ error: 'Registration failed' })
    ); // Mock error response

    component.registerUser(); // Call the registerUser method
    expect(snackBar.open).toHaveBeenCalledWith(
      'User registration failed: Registration failed',
      'OK',
      { duration: 3000 }
    ); // Verify error message is shown
  });
});
