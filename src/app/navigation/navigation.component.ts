import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FetchApiDataService } from '../fetch-api-data.service';  // Service import is fine
import { CommonModule } from '@angular/common';

// Ensure that the UserLoginComponent and MovieCardComponent exist and are correctly imported
import { UserLoginComponent } from '../user-login/user-login.component';  // Adjust path as needed
import { MovieCardComponent } from '../movie-card/movie-card.component';  // Adjust path as needed

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
  standalone: true,  // Assuming this is a standalone component
  imports: [
    MatToolbarModule,
    UserLoginComponent,  // Import the components as needed
    MovieCardComponent, 
    CommonModule
  ]
})
export class NavigationComponent {
  constructor(private router: Router, private fetchApiData: FetchApiDataService) {}

  // Log out the user by clearing localStorage and navigating to the login page
  logOut(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    this.router.navigate(['/login']); // Navigate to the login page after logout
  }

  // Navigate to the movies page (updated from go() to goToMovies() for clarity)
  goToMovies(): void {
    this.router.navigate(['/movies']); // Navigate to the /movies route
  }

  // Navigate to the profile page
  goToProfile(): void {
    this.router.navigate(['/profile']); // Navigate to the /profile page
  }
}
