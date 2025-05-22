// Importing necessary functions and components to bootstrap the Angular app
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

// Import necessary Angular modules for routing, HTTP client, and animations
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { routes } from './app/app-routing.module';

// Bootstrapping the Angular application with additional services
bootstrapApplication(AppComponent, {
  providers: [
    // Provides the HttpClient module with the Fetch API, enabling HTTP functionality
    provideHttpClient(withFetch()),

    // Provides support for Angular animations
    provideAnimations(),

    // Provides the Angular Router with the routes configuration
    provideRouter(routes), // Here, 'routes' contains your application's routing configuration
  ],
}).catch((err) => console.error(err)); // Catch any errors during the bootstrap process and log them