import { bootstrapApplication } from '@angular/platform-browser';
import { installRuntimeDebug } from './runtime-debug';
import { appConfig } from './app/app.config';
import { App } from './app/app';

installRuntimeDebug('SHELL');

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
