import { Component, OnInit, Optional } from '@angular/core';
import { FetchApiDataService } from '../fetch-api-data.service';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.scss'],
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    CommonModule,
    MatSnackBarModule,
    RouterModule,
    MatDialogModule,
  ],
})
export class UserLoginComponent implements OnInit {
  /**
   * Reactive form group for the login form fields.
   */
  loginForm: FormGroup;

  /**
   * Indicates whether the user is currently logged in.
   */
  isLoggedIn: boolean = false;

  /**
   * Initializes the `UserLoginComponent`.
   * @param fetchApiData Service to handle API requests, including user login.
   * @param dialogRef Reference to the dialog (optional) for managing the modal.
   * @param snackBar Service for displaying notifications to the user.
   * @param router Router for navigating between application views.
   * @param fb FormBuilder for creating and managing reactive forms.
   * @param dialog Service for managing dialogs.
   */
  constructor(
    private fetchApiData: FetchApiDataService,
    @Optional() private dialogRef: MatDialogRef<UserLoginComponent>,
    private snackBar: MatSnackBar,
    private router: Router,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    /**
     * Initializes the login form with fields for `username` and `password`,
     * both of which are required.
     */
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  /**
   * Lifecycle hook called on component initialization.
   * Checks if the user is already authenticated and redirects to the profile page if so.
   */
  ngOnInit(): void {
    if (this.isAuthenticated()) {
      this.router.navigate(['/movies']);
    }
  }

  /**
   * Handles user login.
   * Validates the login form, sends the login request, and stores the user's token upon success.
   */
  logInUser(): void {
    if (this.loginForm.invalid) {
      this.snackBar.open('Please fill out all fields correctly.', 'Close', {
        duration: 2000,
      });
      return;
    }

    /**
     * Extract form values (username and password)
     */
    const credentials = this.loginForm.value;

    /**
     * Call API service to log in the user with the provided credentials
     */
    this.fetchApiData.userLogin(credentials).subscribe({
      next: (response) => {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('username', credentials.username);
        this.isLoggedIn = true;
        this.snackBar.open('Login successful!', 'Close', { duration: 2000 });
        this.router.navigate(['/movies']);
      },
      error: (error) => {
        const errorMessage =
          error.error?.message || 'Login failed. Please try again.';
        this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
      },
    });
  }

  /**
   * Navigates the user to the registration page.
   */
  navigateToRegistration(): void {
    this.router.navigate(['/register']);
  }

  /**
   * Checks if the user is authenticated by validating the token stored in local storage.
   * @returns `true` if the user is authenticated, `false` otherwise.
   */
  private isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return false;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decode the JWT
      const isTokenExpired = payload.exp * 1000 < Date.now(); // Check if token is expired
      return !isTokenExpired;
    } catch (error) {
      console.error('Invalid token:', error);
      return false;
    }
  }
}
