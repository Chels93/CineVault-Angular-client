import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserRegistrationComponent } from './user-registration.component';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { FetchApiDataService } from '../fetch-api-data.service';

describe('UserRegistrationComponent', () => {
  let component: UserRegistrationComponent;
  let fixture: ComponentFixture<UserRegistrationComponent>;
  let fetchApiDataService: jasmine.SpyObj<FetchApiDataService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<UserRegistrationComponent>>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    const fetchApiDataSpy = jasmine.createSpyObj('FetchApiDataService', ['userRegistration']);
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      declarations: [UserRegistrationComponent],
      imports: [
        MatSnackBarModule,
        ReactiveFormsModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: FetchApiDataService, useValue: fetchApiDataSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserRegistrationComponent);
    component = fixture.componentInstance;
    fetchApiDataService = TestBed.inject(FetchApiDataService) as jasmine.SpyObj<FetchApiDataService>;
    dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<UserRegistrationComponent>>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with empty fields and required validators', () => {
    const form = component.registrationForm;
    expect(form).toBeDefined();
    expect(form.get('username')?.hasError('required')).toBeTrue();
    expect(form.get('password')?.hasError('required')).toBeTrue();
    expect(form.get('email')?.hasError('required')).toBeTrue();
  });

  it('should mark the form as touched and show error if form is invalid', () => {
    component.registerUser();
    expect(component.registrationForm.touched).toBeTrue();
    expect(snackBar.open).toHaveBeenCalledWith(
      'Please fill in all required fields correctly',
      'OK',
      { duration: 3000 }
    );
  });

  it('should call userRegistration on FetchApiDataService when form is valid', () => {
    component.registrationForm.setValue({
      username: 'testuser',
      password: 'password123',
      email: 'test@example.com',
      birthdate: ''
    });
    fetchApiDataService.userRegistration.and.returnValue(of({ success: true }));

    component.registerUser();
    expect(fetchApiDataService.userRegistration).toHaveBeenCalledWith(component.registrationForm.value);
  });

  it('should show success message and close dialog on successful registration', () => {
    component.registrationForm.setValue({
      username: 'testuser',
      password: 'password123',
      email: 'test@example.com',
      birthdate: ''
    });
    fetchApiDataService.userRegistration.and.returnValue(of({ success: true }));

    component.registerUser();
    expect(snackBar.open).toHaveBeenCalledWith('User registration successful', 'OK', { duration: 2000 });
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('should show error message if registration fails', () => {
    component.registrationForm.setValue({
      username: 'testuser',
      password: 'password123',
      email: 'test@example.com',
      birthdate: ''
    });
    fetchApiDataService.userRegistration.and.returnValue(throwError({ error: 'Registration failed' }));

    component.registerUser();
    expect(snackBar.open).toHaveBeenCalledWith('User registration failed: Registration failed', 'OK', { duration: 3000 });
  });
});
