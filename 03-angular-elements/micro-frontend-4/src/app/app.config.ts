import { ApplicationConfig, ErrorHandler, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { RuntimeErrorHandler } from '../runtime-error-handler';
import { provideRuntimeRouterLogging } from '../runtime-debug';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    {
      provide: ErrorHandler,
      useFactory: () => new RuntimeErrorHandler('MFE-4'),
    },
    provideRuntimeRouterLogging('MFE-4'),
  ],
};
