// Import core Angular modules for application setup
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Import Angular Material modules for UI components
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';

// Import components specific to app
import { AppComponent } from './app.component';
import { UserRegistrationComponent } from './user-registration/user-registration.component';
import { UserLoginComponent } from './user-login/user-login.component';
import { MovieCardComponent } from './movie-card/movie-card.component';
import { WelcomePageComponent } from './welcome-page/welcome-page.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { AppRoutingModule } from './app-routing.module';
import { RouterModule, Routes } from '@angular/router';
import { NavigationComponent } from './navigation/navigation.component';

// Define routes for application
const routes: Routes = [
  { path: 'register', component: UserRegistrationComponent },
  { path: 'welcome', component: WelcomePageComponent },
  { path: 'movies', component: MovieCardComponent },
  { path: 'profile', component: UserProfileComponent },
  { path: 'login', component: UserLoginComponent },
  { path: 'logout', component: UserLoginComponent },
  { path: '', redirectTo: '/welcome', pathMatch: 'full' },
];

/**
 * Root module of the Angular application.
 * This module defines declarations for components and imports necessary modules for functionality.
 * It also configures the routing for the application.
 */
@NgModule({
  declarations: [
    AppComponent,
    UserRegistrationComponent,
    UserLoginComponent,
    MovieCardComponent,
    WelcomePageComponent,
    UserProfileComponent,
    NavigationComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatButtonModule,
    FormsModule,
    MatDialogRef,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatNativeDateModule,
    AppRoutingModule,
    CommonModule,
    RouterModule.forRoot(routes),
  ],
  providers: [
    // Optional services can be added here
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}