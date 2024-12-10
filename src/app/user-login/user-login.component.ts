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
  loginForm: FormGroup; // Form group for login fields
  isLoggedIn: boolean = false; // Flag to check if user is logged in

  constructor(
    private fetchApiData: FetchApiDataService, // Inject API service for login request
    @Optional() private dialogRef: MatDialogRef<UserLoginComponent>,
    private snackBar: MatSnackBar, // Inject snackbar service for user notifications
    private router: Router, // Inject router for navigation
    private fb: FormBuilder, // Form builder to create reactive form
    private dialog: MatDialog // Inject MatDialog for dialog/modal management
  ) {
    // Initialize the login form with validation
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  // lifecycle hook for initialization
  ngOnInit(): void {
    // Check if the user is already authenticated and navigate to profile page if logged in
    if (this.isAuthenticated()) {
      this.router.navigate(['/profile']);
    }
  }

  // Method to login the user
  logInUser(): void {
    // If th eform is invalid, show a snackbar with a message
    if (this.loginForm.invalid) {
      this.snackBar.open('Please fill out all fields correctly.', 'Close', {
        duration: 2000,
      });
      return;
    }

    // Extract form values (username and password)
    const credentials = this.loginForm.value;

    // Call API service to log in the user with the provided credentials
    this.fetchApiData.userLogin(credentials).subscribe({
      next: (response) => {
        // Store authentiaction token and username in localStorage upon successful login
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('username', credentials.username);
        this.isLoggedIn = true; // Update login status
        this.snackBar.open('Login successful!', 'Close', { duration: 2000 });
        this.router.navigate(['/profile']);
      },
      error: (error) => {
        // Show error message if login fails
        const errorMessage =
          error.error?.message || 'Login failed. Please try again.';
        this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
      },
    });
  }

  // Method to navigate to the registration page
  navigateToRegistration(): void {
    this.router.navigate(['/register']);
  }

  // Helper method to check if the user is authenticated
  private isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken'); // Retreive token from localStorage
    if (!token) {
      return false; // If no token, user is not authenticated
    }

    // Token validation logic
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decode the JWT
      const isTokenExpired = payload.exp * 1000 < Date.now(); // Check if token is expired
      return !isTokenExpired;
    } catch (error) {
      console.error('Invalid token:', error);
      return false; // Return false if decoding fails
    }
  }
}
