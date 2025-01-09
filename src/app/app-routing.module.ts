import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MovieCardComponent } from './movie-card/movie-card.component';
import { WelcomePageComponent } from './welcome-page/welcome-page.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UserLoginComponent } from './user-login/user-login.component';
import { NavigationComponent } from './navigation/navigation.component';
import { UserRegistrationComponent } from './user-registration/user-registration.component';

/**
 * Defines the application's routes and their associated components.
 */
export const routes: Routes = [
  { path: 'register', component: UserRegistrationComponent },
  { path: 'welcome', component: WelcomePageComponent },
  { path: 'movies', component: MovieCardComponent },
  { path: 'profile', component: UserProfileComponent },
  { path: 'login', component: UserLoginComponent },
  { path: 'logout', component: UserLoginComponent },
  { path: '**', redirectTo: '/welcome', pathMatch: 'full' },
];

/**
 * Configures the root application routing module.
 */
@NgModule({
  imports: [RouterModule.forRoot(routes), CommonModule, MatDialogModule],
  exports: [RouterModule],
})
export class AppRoutingModule {}
