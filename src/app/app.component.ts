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
  hideNavBar: boolean = false; // Flag to determine if navigation bar should be hidden
  title = 'myFlix-Angular-client';

  constructor(private router: Router) {} // Router service to listen to routing events

  ngOnInit(): void {
    // Subscribe to router events to track when navigation ends
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd) // Only process NavigationEnd events
      )
      .subscribe((event) => {
        // Cast event to NavigationEnd type for strong typing
        const navigationEndEvent = event as NavigationEnd;

        // Conditional logic to hide navigation bar on specific routes
        // If user navigates to one of these pages, hide the navbar
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
