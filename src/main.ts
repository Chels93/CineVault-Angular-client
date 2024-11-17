import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router'; // Import provideRouter
import { routes } from './app/app-routing.module'; // Import your routes

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withFetch()),
    provideAnimations(),
    provideRouter(routes)  // Provide the router with your routing configuration
  ]
}).catch(err => console.error(err));
