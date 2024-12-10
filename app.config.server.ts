import { mergeApplicationConfig, ApplicationConfig } from '@angular/core'; // mergeApplicationConfig is used to combine app configs, ApplicationConfig is the type for configuration
import { provideServerRendering } from '@angular/platform-server'; // To provide server-side rendering (SSR) services
import { appConfig } from './src/app/app.config'; // Importing the existing client-side application configuration

// Define the server-side configuration for the application
const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(), // Provides the necessary service for SSR (Server-Side Rendering), enabling Angular to render the app on the server
  ],
};

// Merge the client-side configuration (appConfig) with the server-side configuration (serverConfig)
// This allows Angular to apply the same app configuration for both the client and the server, ensuring consistency
export const config = mergeApplicationConfig(appConfig, serverConfig);
