import { Component, OnInit } from '@angular/core';
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
    MatSnackBarModule
  ],
  templateUrl: './user-registration.component.html',
  styleUrls: ['./user-registration.component.scss'],
})
export class UserRegistrationComponent implements OnInit {
  registrationForm!: FormGroup;

  constructor(
    public fetchApiData: FetchApiDataService,
    public dialogRef: MatDialogRef<UserRegistrationComponent>,
    public snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.registrationForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      email: ['', [Validators.required, Validators.email]],
      birthdate: ['']
    });
  }

  registerUser(): void {
    if (this.registrationForm.valid) {
      this.fetchApiData.userRegistration(this.registrationForm.value).subscribe(
        (result: any) => {
          this.dialogRef.close();
          this.snackBar.open('User registration successful', 'OK', { duration: 2000 });
        },
        (error: any) => {
          const errorMessage = this.extractErrorMessage(error);
          this.snackBar.open(`User registration failed: ${errorMessage}`, 'OK', { duration: 3000 });
        }
      );
    } else {
      this.registrationForm.markAllAsTouched();
      this.snackBar.open('Please fill in all required fields correctly', 'OK', { duration: 3000 });
    }
  }

  private extractErrorMessage(error: any): string {
    if (error.error && error.error.errors) {
      return error.error.errors
        .map((err: { path: string; msg: string }) => `${err.path}: ${err.msg}`)
        .join(', ');
    }
    return error.message || 'An unknown error occurred. Please try again later.';
  }
}
