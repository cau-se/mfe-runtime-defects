import { ApplicationConfig, ErrorHandler, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { RuntimeErrorHandler } from '../runtime-error-handler';
import { provideRuntimeRouterLogging } from '../runtime-debug';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    {
      provide: ErrorHandler,
      useFactory: () => new RuntimeErrorHandler('MFE-2'),
    },
    provideRuntimeRouterLogging('MFE-2'),
  ],
};
