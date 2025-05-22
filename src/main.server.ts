// Import the necessary function to bootstrap an Angular application in a browser or server environment
import { bootstrapApplication } from '@angular/platform-browser';

// Import the root component of the Angular application (AppComponent)
import { AppComponent } from './app/app.component';

// Import the configuration for the server-side rendering (SSR) setup (if applicable)
import { config } from './app/app.config.server';

/**
 * Bootstrap function to initialize the Angular application.
 *
 * This function uses the `bootstrapApplication` method to launch the application
 * with the specified root component (`AppComponent`) and configuration (`config`).
 *
 * @returns A Promise that resolves when the application is successfully bootstrapped.
 */
const bootstrap = () => bootstrapApplication(AppComponent, config);

/**
 * Export the bootstrap function for use in other parts of the application.
 * This allows the application to be initialized from various entry points
 * such as server-side environments.
 */
export default bootstrap;