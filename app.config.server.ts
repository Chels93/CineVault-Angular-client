import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './src/app/app.config';

/**
 * Bootstrap the Angular application.
 *
 * This function initializes the Angular app by providing necessary services
 * such as HTTP client, animations, and routing configuration.
 *
 * @returns A Promise that resolves when the application is successfully bootstrapped.
 */
const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering()],
};

/**
 * Merge the client-side configuration (appConfig) with the server-side configuration (serverConfig)
 * This allows Angular to apply the same app configuration for both the client and the server, ensuring consistency
 */
export const config = mergeApplicationConfig(appConfig, serverConfig);