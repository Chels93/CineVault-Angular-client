import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { RouterModule } from '@angular/router';
import { NavigationComponent } from './navigation/navigation.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [RouterModule, NavigationComponent, CommonModule],
})
export class AppComponent implements OnInit {
  /**
   * A flag to determine whether the navigation bar should be hidden.
   */
  hideNavBar: boolean = false;

  /**
   * The title of the application, used in metadata or branding.
   */
  title = 'CineVault-Angular-client';

  /**
   * @param router -  Injects the Router service for listening to route events.
   * @param router - Angular's Router service for handling navigation.
   */
  constructor(private router: Router) {}

  /**
   * Angular lifecycle hook that runs once the component has been initialized.
   * Subscribes to route events to update the visibility of the navigation bar based on the current route.
   */
  ngOnInit(): void {
    // Subscribe to router events to track when navigation ends
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd) // Only process NavigationEnd events
      )
      .subscribe((event) => {
        // Cast event to NavigationEnd type for strong typing
        const navigationEndEvent = event as NavigationEnd;

        /**
         * Conditional logic to hide the navigation bar on specific routes.
         * The navigation bar is hidden when the user is on login, register, or welcome pages.
         */
        if (
          navigationEndEvent.urlAfterRedirects === '/login' ||
          navigationEndEvent.urlAfterRedirects === '/register' ||
          navigationEndEvent.urlAfterRedirects === '/welcome'
        ) {
          this.hideNavBar = true;
        } else {
          this.hideNavBar = false;
        }
      });
  }
}
