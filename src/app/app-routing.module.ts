import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MovieCardComponent } from './movie-card/movie-card.component';
import { WelcomePageComponent } from './welcome-page/welcome-page.component';
import { UserProfileComponent } from './user-profile/user-profile.component'; // Correct import
import { UserLoginComponent } from './user-login/user-login.component';
import { NavigationComponent } from './navigation/navigation.component';

// Define routes
export const routes: Routes = [
  { path: 'welcome', component: WelcomePageComponent },
  { path: 'movies', component: MovieCardComponent },
  { path: 'profile', component: UserProfileComponent }, // Corrected route for profile
  { path: 'login', component: UserLoginComponent },
  { path: 'logout', component: UserLoginComponent },
  { path: '', redirectTo: '/welcome', pathMatch: 'full' }, // Corrected redirection
];

// NgModule configuration
@NgModule({
  imports: [RouterModule.forRoot(routes)], // Use RouterModule.forRoot(routes)
  exports: [RouterModule],
})
export class AppRoutingModule {}
