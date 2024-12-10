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
  registrationForm!: FormGroup; // To manage form controls and validation

  @Output() openLoginEvent = new EventEmitter<void>(); // To trigger login dialog or page open

  constructor(
    public fetchApiData: FetchApiDataService, // To handle API requests for user registration
    private router: Router, // For navigation
    @Optional() // To close dialog after registration
    public dialogRef: MatDialogRef<UserRegistrationComponent> | null = null,
    public snackBar: MatSnackBar, // To show snack bar notifcations
    private fb: FormBuilder // Service for creating reactive forms
  ) {
    this.registrationForm = this.fb.group({
      // FOrm group for user registration, with form controls and validation
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      email: ['', [Validators.required, Validators.email]],
      birthdate: [''], // Optional field
    });
  }

  ngOnInit(): void {
    // Any additional setup can go here
  }

  // Method to register the user
  registerUser(): void {
    // Ensure form is valid before proceeding with registration
    if (this.registrationForm.valid) {
      // Call registration API with form values
      this.fetchApiData.userRegistration(this.registrationForm.value).subscribe(
        (result: any) => {
          console.log('Registration successful:', result);
          localStorage.removeItem('authToken'); // Clear any existing authToken to ensure a fresh login
          this.snackBar.open('User registration successful!', 'OK', {
            duration: 2000,
          });

          // Redirect to the login page after successful registration
          this.router.navigate(['/login']);
        },
        (error: any) => {
          // Handle errors from the registration API
          const errorMessage = this.extractErrorMessage(error);
          this.snackBar.open(
            `User registration failed: ${errorMessage}`,
            'OK',
            { duration: 3000 }
          );
        }
      );
    }
  }

  // Emit the event when the link is clicked
  openLoginDialog(): void {
    this.openLoginEvent.emit();
  }

  // Close dialog if user is not redirected or registration fails
  closeDialog(): void {
    this.dialogRef?.close();
  }

  // Navigate to login after registration
  navigateToLogin(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
    this.router.navigate(['/login']);
  }

  // Method to extract error messages from the backend error response
  private extractErrorMessage(error: any): string {
    console.log('Error response from backend:', error);
    if (error.error && error.error.errors) {
      return error.error.errors
        .map((err: { path: string; msg: string }) => `${err.path}: ${err.msg}`)
        .join(', ');
    }
    // Return a generic error message if no specific error details are available
    return (
      error.message || 'An unknown error occurred. Please try again later.'
    );
  }
}
