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
    MatDialogModule
  ]
})
export class UserLoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoggedIn: boolean = false;

  constructor(
    private fetchApiData: FetchApiDataService,
    @Optional() private dialogRef: MatDialogRef<UserLoginComponent>,
    private snackBar: MatSnackBar,
    private router: Router,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    if (this.isAuthenticated()) {
      this.router.navigate(['/profile']);
    }
  }
  
  logInUser(): void {
    if (this.loginForm.invalid) {
      this.snackBar.open('Please fill out all fields correctly.', 'Close', { duration: 2000 });
      return;
    }

    const credentials = this.loginForm.value;
    this.fetchApiData.userLogin(credentials).subscribe({
      next: (response) => {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('username', credentials.username);
        this.isLoggedIn = true; // Update isLoggedIn after successful login
        this.snackBar.open('Login successful!', 'Close', { duration: 2000 });
        this.router.navigate(['/profile']);
      },
      error: (error) => {
        const errorMessage = error.error?.message || 'Login failed. Please try again.';
        this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
      },
    });
  }
  
  navigateToRegistration(): void {
    this.router.navigate(['/register']);
  }

  private isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return false;
    }
  
    // Optional: Add token validation logic
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decode the JWT
      const isTokenExpired = payload.exp * 1000 < Date.now();
      return !isTokenExpired;
    } catch (error) {
      console.error('Invalid token:', error);
      return false;
    }
  }
  
}
