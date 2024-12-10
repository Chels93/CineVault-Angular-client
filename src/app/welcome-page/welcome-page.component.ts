import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-welcome-page',
  templateUrl: './welcome-page.component.html',
  styleUrls: ['./welcome-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule, // To use basic Anguolar directives like ngIf, ngFor
    RouterModule, // To enable routing functionality within this component
  ],
})
export class WelcomePageComponent implements OnInit {
  // Inject Router service into constructor for navigation functionality
  constructor(private router: Router) {}

  // Lifecycle hook that runs once component is initialized
  ngOnInit(): void {}

  // Method to navigate directly to Register page when signup button is clicked
  openSignupDialog(): void {
    this.router.navigate(['/register']);
  }

  // Method to navigate directly to Login page when login button is clicked
  openLoginDialog(): void {
    this.router.navigate(['/login']);
  }
}
