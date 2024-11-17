import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './src/app/app.config';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),  // Provides the necessary service for SSR
  ]
};

// Merging the existing app configuration (which is specific to the client) with the server-side configuration
export const config = mergeApplicationConfig(appConfig, serverConfig);
