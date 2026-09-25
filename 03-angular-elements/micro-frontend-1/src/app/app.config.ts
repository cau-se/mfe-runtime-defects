import { ApplicationConfig, ErrorHandler, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { RuntimeErrorHandler } from '../runtime-error-handler';
import { provideRuntimeRouterLogging } from '../runtime-debug';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    {
      provide: ErrorHandler,
      useFactory: () => new RuntimeErrorHandler('MFE-1'),
    },
    provideRuntimeRouterLogging('MFE-1'),
  ],
};
