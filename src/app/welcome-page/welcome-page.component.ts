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
    CommonModule,
    RouterModule
  ],
})
export class WelcomePageComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {}

  // Navigate directly to the Register page
  openSignupDialog(): void {
    this.router.navigate(['/register']);
  }

  // Open the Login dialog (if you still want to keep this feature)
  openLoginDialog(): void {
    this.router.navigate(['/login']);
  }
}
