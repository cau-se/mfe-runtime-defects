import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';

import { App } from './app/app';
import { appConfig } from './app/app.config';

(async (): Promise<void> => {
  const app = await createApplication({
    providers: [
      ...appConfig.providers,
      provideHttpClient(withInterceptorsFromDi()),
    ],
  }).catch((err) => console.error(err));

  if (!app) return;

  const element = createCustomElement(App, {
    injector: app.injector,
  });

  customElements.define('micro-frontend-3', element);
})();
