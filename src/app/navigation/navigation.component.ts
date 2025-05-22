import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FetchApiDataService } from '../fetch-api-data.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
  standalone: true,
  imports: [MatToolbarModule, CommonModule, MatIconModule, MatButtonModule],
})
export class NavigationComponent {
  /**
   * Tracks whether the navigation menu is open.
   */
  isMenuOpen = false;

  /**
   * Initializes the `NavigationComponent`.
   * @param router Handles navigation between application routes.
   * @param fetchApiData Provides access to API data fetching services.
   */
  constructor(
    private router: Router,
    private fetchApiData: FetchApiDataService,
  ) {}

  /**
   * Toggles the visibility of the navigation menu.
   * Called when the hamburger icon is clicked.
   */
  toggleMenu(): void {
    console.log('Toggling menu');
    this.isMenuOpen = !this.isMenuOpen;
    console.log('Menu Open:', this.isMenuOpen);
  }

  /**
   * Listener for the `resize` event to close the menu if the screen width exceeds 768px.
   * Ensures responsive behavior of the navigation menu.
   * @param event The resize event triggered by the window.
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    const screenWidth = window.innerWidth;
    if (screenWidth > 768) {
      this.isMenuOpen = false;
    }
  }

  /**
   * Navigates to the Movies view.
   */
  goToMovies(): void {
    this.router.navigate(['/movies']);
  }

  /**
   * Navigates to the Profile view.
   */
  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  /**
   * Logs the user out by clearing local storage and navigating to the login view.
   */
  logOut(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}