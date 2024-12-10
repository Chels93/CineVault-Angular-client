// Import the necessary function to bootstrap an Angular application in a browser or server environment
import { bootstrapApplication } from '@angular/platform-browser';

// Import the root component of the Angular application (AppComponent)
import { AppComponent } from './app/app.component';

// Import the configuration for the server-side rendering (SSR) setup (if applicable)
import { config } from './app/app.config.server';

// Bootstrap function to initialize the application with the provided configuration
const bootstrap = () => bootstrapApplication(AppComponent, config);

// Export the bootstrap function to allow it to be called from other parts of the application (e.g., server-side)
export default bootstrap;
