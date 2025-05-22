/**
 * @module Defines the core configuration for the Angular application.
 * Includes providers for change detection, client hydration, animations, and HTTP client functionality.
 */

import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';

/**
 * Core configuration object for the Angular application.
 * This configuration specifies providers that enhance performance, interactivity, animations, and HTTP functionality.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    /**
     * Provides optimized change detection using event coalescing.
     * Event coalescing ensures multiple events are processed together, reducing unnecessary change detection cycles.
     */
    provideZoneChangeDetection({ eventCoalescing: true }),

    /**
     * Enables client-side hydration.
     * Hydration is crucial for making server-side rendered applications interactive on the client side.
     */
    provideClientHydration(),

    /**
     * Enables animations for the Angular application.
     * This is particularly required for Angular Material components to support smooth transitions and effects.
     */
    provideAnimations(),

    /**
     * Provides Angular's HTTP client module.
     * This allows the application to perform API calls for data fetching and other HTTP-based interactions.
     */
    provideHttpClient(),
  ],
};