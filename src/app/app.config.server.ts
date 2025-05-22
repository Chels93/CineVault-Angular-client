import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';

/**
 * The server-side specific configuration for the Angular application.
 * Includes providers necessary for server-side rendering.
 */
const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering()],
};

/**
 * Merges the main application configuration (`appConfig`) with the server-specific configuration (`serverConfig`).
 * This creates the final configuration object used to bootstrap the application on the server.
 */
export const config = mergeApplicationConfig(appConfig, serverConfig);