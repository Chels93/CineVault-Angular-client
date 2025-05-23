import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Optional,
} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FetchApiDataService } from '../fetch-api-data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router'; // Added Router import
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-user-registration-form',
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    CommonModule,
    MatDialogModule,
    MatSnackBarModule,
    RouterModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './user-registration.component.html',
  styleUrls: ['./user-registration.component.scss'],
})
export class UserRegistrationComponent implements OnInit {
  /**
   * Reactive form group for managing registration form controls and validation.
   */
  registrationForm!: FormGroup;

  /**
   * Event emitter to signal when the login dialog or page should open.
   */
  @Output() openLoginEvent = new EventEmitter<void>();

  /**
   * Constructor for initializing component dependencies.
   * @param fetchApiData Service for handling API requests related to user registration.
   * @param router Service for navigation to different routes.
   * @param dialogRef Optional reference for closing the registration dialog.
   * @param snackBar Service for displaying notifications via snack bars.
   * @param fb FormBuilder for creating and managing the registration form.
   */
  constructor(
    public fetchApiData: FetchApiDataService,
    private router: Router,
    @Optional()
    public dialogRef: MatDialogRef<UserRegistrationComponent> | null = null,
    public snackBar: MatSnackBar,
    private fb: FormBuilder,
  ) {
    this.registrationForm = this.fb.group({
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.pattern('^[a-zA-Z0-9]*$'), // Only letters and numbers
        ],
      ],
      password: ['', [Validators.required, Validators.minLength(6)]],
      email: ['', [Validators.required, Validators.email]],
      birthdate: [''],
    });
  }

  /**
   * Lifecycle hook for additional setup after component initialization.
   */
  ngOnInit(): void {
    /**
     * Any additional setup can go here
     */
  }

  /**
   * Handles user registration by validating the form and sending a request to the API.
   * Displays notifications and navigates to the login page on success.
   * Ensures validation errors are shown even for untouched fields after submit attempt.
   */
  registrationAttempted = false;

  registerUser(): void {
    this.registrationAttempted = true;

    if (this.registrationForm.valid) {
      this.fetchApiData.userRegistration(this.registrationForm.value).subscribe(
        (result: any) => {
          console.log('Registration successful:', result);
          localStorage.removeItem('authToken');
          this.snackBar.open('User registration successful!', 'OK', {
            duration: 2000,
          });
          this.router.navigate(['/login']);
        },
        (error: any) => {
          const errorMessage = this.extractErrorMessage(error);
          this.snackBar.open(
            `User registration failed: ${errorMessage}`,
            'OK',
            { duration: 3000 },
          );
        },
      );
    } else {
      // Mark all fields as touched so their errors appear
      this.registrationForm.markAllAsTouched();
    }
  }

  /**
   * Emits an event to trigger the login dialog or page.
   */
  openLoginDialog(): void {
    this.openLoginEvent.emit();
  }

  /**
   * Closes the registration dialog if it exists.
   */
  closeDialog(): void {
    this.dialogRef?.close();
  }

  /**
   * Navigates to the login page after closing the dialog (if open).
   */
  navigateToLogin(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
    this.router.navigate(['/login']);
  }

  /**
   * Extracts and formats error messages from the backend error response.
   * @param error The error response from the backend.
   * @returns A user-friendly error message.
   */
  private extractErrorMessage(error: any): string {
    console.log('Error response from backend:', error);
    if (error.error && error.error.errors) {
      return error.error.errors
        .map((err: { path: string; msg: string }) => `${err.path}: ${err.msg}`)
        .join(', ');
    }
    return (
      error.message || 'An unknown error occurred. Please try again later.'
    );
  }
}