import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { App } from './app/app';
import { appConfig } from './app/app.config';
import { routes } from './app/app.routes';

(async (): Promise<void> => {
  const app = await createApplication({
    providers: [
      ...appConfig.providers,
      provideRouter(routes),
      provideHttpClient(withInterceptorsFromDi()),
    ],
  }).catch((err) => console.error(err));

  if (!app) return;

  const element = createCustomElement(App, {
    injector: app.injector,
  });

  customElements.define('micro-frontend-1', element);
})();
