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
  hideNavBar: boolean = false;
  title = 'myFlix-Angular-client';

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Subscribe to router events to check the current route
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd)
      )
      .subscribe((event) => {
        const navigationEndEvent = event as NavigationEnd; // Cast event to NavigationEnd type
        // Hide the navbar on specific routes
        if (navigationEndEvent.urlAfterRedirects === '/login' || 
            navigationEndEvent.urlAfterRedirects === '/register' || 
            navigationEndEvent.urlAfterRedirects === '/welcome') {
          this.hideNavBar = true;
        } else {
          this.hideNavBar = false;
        }
      });
  }
}
