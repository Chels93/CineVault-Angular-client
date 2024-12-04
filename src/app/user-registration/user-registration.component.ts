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
  registrationForm!: FormGroup;

  @Output() openLoginEvent = new EventEmitter<void>();

  constructor(
    public fetchApiData: FetchApiDataService,
    private router: Router,
    @Optional()
    public dialogRef: MatDialogRef<UserRegistrationComponent> | null = null,
    public snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.registrationForm = this.fb.group({
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
    if (this.registrationForm.valid) {
      this.fetchApiData.userRegistration(this.registrationForm.value).subscribe(
        (result: any) => {
          console.log('Registration successful:', result);
          // Clear any authToken to ensure it's not considered logged in
          localStorage.removeItem('authToken');
          this.snackBar.open('User registration successful!', 'OK', { duration: 2000 });
          
          // Redirect to the login page
          this.router.navigate(['/login']);
        },
        (error: any) => {
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

  closeDialog(): void {
    this.dialogRef?.close();
  }

  // Navigate to login
  navigateToLogin(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
    this.router.navigate(['/login']);
  }

  // Method to extract error messages from the backend error response
  private extractErrorMessage(error: any): string {
    console.log('Error response from backend:', error);  // Log the full error response
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
