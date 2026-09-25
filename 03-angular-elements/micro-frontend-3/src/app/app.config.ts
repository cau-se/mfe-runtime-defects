import { ApplicationConfig, ErrorHandler, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';

import { RuntimeErrorHandler } from '../runtime-error-handler';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    {
      provide: ErrorHandler,
      useFactory: () => new RuntimeErrorHandler('MFE-3'),
    },
  ],
};
