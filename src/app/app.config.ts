import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),  // Helps with change detection performance
    provideClientHydration(),  // Enables client-side hydration
    provideAnimations(),  // Required for Angular Material animations
    provideHttpClient()  // Enables HTTP Client for API calls
  ]
};
