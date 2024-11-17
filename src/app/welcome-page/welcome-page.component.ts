import { Component, OnInit } from '@angular/core';
import { UserLoginComponent } from '../user-login/user-login.component';
import { UserRegistrationComponent } from '../user-registration/user-registration.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-welcome-page',
  standalone: true,   // Standalone component flag
  imports: [MatDialogModule],  // Ensure MatDialogModule is imported here
  templateUrl: './welcome-page.component.html',
  styleUrls: ['./welcome-page.component.scss']
})
export class WelcomePageComponent implements OnInit {

  // Common configuration for dialog boxes
  private dialogConfig: MatDialogConfig = {
    width: '280px',
    disableClose: true // Prevents closing by clicking outside the dialog
  };

  constructor(public dialog: MatDialog) { }

  ngOnInit(): void {}

  // Opens the registration dialog
  openUserRegistrationDialog(): void {
    this.dialog.open(UserRegistrationComponent, this.dialogConfig);
  }

  // Opens the login dialog
  openUserLoginDialog(): void {
    this.dialog.open(UserLoginComponent, this.dialogConfig);
  }
}
