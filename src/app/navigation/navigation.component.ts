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
  isMenuOpen = false;

  constructor(
    private router: Router,
    private fetchApiData: FetchApiDataService
  ) {}

  // Toggle menu visibility when hamburger is clicked
  toggleMenu(): void {
    console.log('Toggling menu'); // Debugging to check if this function is triggered
    this.isMenuOpen = !this.isMenuOpen;
    console.log('Menu Open:', this.isMenuOpen); // Check the value of `isMenuOpen`
  }

  // Close menu on screen resize (for responsiveness)
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    const screenWidth = window.innerWidth;
    if (screenWidth > 768) {
      this.isMenuOpen = false;
    }
  }

  // Navigate to Movies
  goToMovies(): void {
    this.router.navigate(['/movies']);
  }

  // Navigate to Profile
  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  // Logout functionality
  logOut(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
