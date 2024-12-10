import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';

// Define the server-side specific configuration for Angular app
const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering()],
};

// Merge the application configuration (appConfig) with the server-side configuration (serverConfig)
// to create the final application config object
export const config = mergeApplicationConfig(appConfig, serverConfig);
