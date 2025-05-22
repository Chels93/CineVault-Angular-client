import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-welcome-page',
  templateUrl: './welcome-page.component.html',
  styleUrls: ['./welcome-page.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class WelcomePageComponent implements OnInit {
  /**
   * Injects the Router service for navigation between routes.
   * @param router Service for programmatically navigating to different routes.
   */
  constructor(private router: Router) {}

  /**
   * Lifecycle hook that executes after the component is initialized.
   */
  ngOnInit(): void {}

  /**
   * Navigates to the user registration page when the "Sign Up" button is clicked.
   */
  openSignupDialog(): void {
    this.router.navigate(['/register']);
  }

  /**
   * Navigates to the user login page when the "Log In" button is clicked.
   */
  openLoginDialog(): void {
    this.router.navigate(['/login']);
  }
}