import { bootstrapApplication, createApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { createCustomElement } from '@angular/elements';

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

  customElements.define('micro-frontend-2', element);
})();
