import { Component, OnInit, Optional } from '@angular/core';
import { FetchApiDataService } from '../fetch-api-data.service';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSnackBarModule } from '@angular/material/snack-bar';

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
  ],
})
export class UserLoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoggedIn: boolean = false;

  constructor(
    private fetchApiData: FetchApiDataService,
    @Optional() private dialogRef: MatDialogRef<UserLoginComponent>,
    private snackBar: MatSnackBar,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    if (!this.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    const username = localStorage.getItem('username');
    if (!username) {
      this.snackBar.open('No username found. Please log in.', 'Close', {
        duration: 3000,
      });
      this.router.navigate(['/login']);
      return;
    }

    this.fetchUserData();
  }

  public logInUser(): void {
    const credentials = this.loginForm.value;

    this.fetchApiData.userLogin(credentials).subscribe({
      next: (response) => {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('username', credentials.username);

        // Redirect to the profile page after successful login
        this.router.navigate(['/profile']);
      },
      error: (err) => {
        this.snackBar.open('Login failed. Please try again.', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  private handleError(error: any): void {
    console.error('Login error:', error);
    this.snackBar.open('Login failed, please try again', 'OK', {
      duration: 2000,
    });
  }

  private isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    return !!token; // Returns true if the token exists, false otherwise
  }

  private fetchUserData(): void {
    const username = localStorage.getItem('username');
    if (username) {
      this.snackBar.open(`Welcome back, ${username}!`, 'Close', {
        duration: 3000,
      });
    }
  }

  public closeDialog(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  public logOutUser(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    this.isLoggedIn = false;
    this.snackBar.open('Logged out successfully', 'OK', { duration: 2000 });
    this.router.navigate(['/login']); // Redirect to login page after logout
  }
}
