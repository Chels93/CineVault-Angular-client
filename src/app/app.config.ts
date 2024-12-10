import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';

// Define application's core configuration
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), // Enable efficient change detection with event coalescing for better performance
    provideClientHydration(), // Enables client-side hydration, crucial for app to become interactive
    provideAnimations(), // Enable Angular Material animations, required for smooth transitions and animations in Material components
    provideHttpClient(), // Enable Angular's HTTP Client module, allowing app to make API calls
  ],
};
