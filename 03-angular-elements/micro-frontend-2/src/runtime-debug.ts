import { VERSION } from '@angular/core';

// ---------------------------------------------------------------------------
// Shared runtime instrumentation for shell and micro-frontends.
//
// Captures, with a common timestamp:
//   - window 'error' and 'unhandledrejection' (incl. "Script error." cases)
//   - popstate
//   - history.pushState / history.replaceState
//
// Every capture is also appended to the in-memory timeline
// (window.__runtimeEvents) so the full sequence can be exported after the
// experiment.
// ---------------------------------------------------------------------------

export interface RuntimeEvent {
  timestamp: string;
  application: string;
  angularVersion: string;
  event: string;
  url: string;
  historyState: unknown;
  historyLength: number;
  details?: unknown;
}

declare global {
  interface Window {
    __runtimeEvents?: RuntimeEvent[];
  }
}

const runtimeEvents: RuntimeEvent[] = [];
window.__runtimeEvents = runtimeEvents;

export function recordRuntimeEvent(
  application: string,
  event: string,
  details?: unknown,
): void {
  runtimeEvents.push({
    timestamp: new Date().toISOString(),
    application,
    angularVersion: VERSION.full,
    event,
    url: window.location.href,
    historyState: structuredClone(window.history.state),
    historyLength: window.history.length,
    details,
  });
}

export function installRuntimeDebug(name: string): void {
  console.log(`[RUNTIME:${name}] installed`);

  // 1. Global JavaScript errors
  window.addEventListener('error', (event) => {
    console.group(`[RUNTIME:${name}] window.error`);
    console.log('message:', event.message);
    console.log('filename:', event.filename);
    console.log('line:', event.lineno);
    console.log('column:', event.colno);
    console.log('error:', event.error);
    console.log('cause:', event.error?.cause);
    console.log('url:', window.location.href);
    console.log('history.state:', structuredClone(window.history.state));
    console.log('history.length:', window.history.length);
    console.groupEnd();

    recordRuntimeEvent(name, 'window.error', {
      message: event.message,
      filename: event.filename,
      line: event.lineno,
      column: event.colno,
      hasErrorObject: event.error !== null,
    });
  });

  // 2. Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.group(`[RUNTIME:${name}] unhandledrejection`);
    console.log('reason:', event.reason);
    console.log('url:', window.location.href);
    console.log('history.state:', structuredClone(window.history.state));
    console.groupEnd();

    recordRuntimeEvent(name, 'unhandledrejection', {
      reason: event.reason,
    });
  });

  // 3. popstate (browser back/forward)
  window.addEventListener('popstate', (event) => {
    console.group(`[RUNTIME:${name}] popstate`);
    console.log('event.state:', structuredClone(event.state));
    console.log('history.state:', structuredClone(window.history.state));
    console.log('url:', window.location.href);
    console.trace();
    console.groupEnd();

    recordRuntimeEvent(name, 'popstate', {
      eventState: structuredClone(event.state),
    });
  });

  // 4. history.pushState
  const originalPushState = history.pushState;
  history.pushState = function (
    state: unknown,
    unused: string,
    url?: string | URL | null,
  ) {
    console.group(`[RUNTIME:${name}] history.pushState`);
    console.log('state:', structuredClone(state));
    console.log('url:', url);
    console.log('current URL:', window.location.href);
    console.trace();
    console.groupEnd();

    recordRuntimeEvent(name, 'history.pushState', {
      state: structuredClone(state),
      url,
    });

    return originalPushState.call(this, state, unused, url);
  };

  // 5. history.replaceState
  const originalReplaceState = history.replaceState;
  history.replaceState = function (
    state: unknown,
    unused: string,
    url?: string | URL | null,
  ) {
    console.group(`[RUNTIME:${name}] history.replaceState`);
    console.log('state:', structuredClone(state));
    console.log('url:', url);
    console.log('current URL:', window.location.href);
    console.trace();
    console.groupEnd();

    recordRuntimeEvent(name, 'history.replaceState', {
      state: structuredClone(state),
      url,
    });

    return originalReplaceState.call(this, state, unused, url);
  };
}

// ---------------------------------------------------------------------------
// Angular Router event logging (NavigationStart / End / Error),
// recorded into the same timeline. Add to appConfig.providers:
//   provideRuntimeRouterLogging('SHELL')
// ---------------------------------------------------------------------------
import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import {
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from '@angular/router';

export function provideRuntimeRouterLogging(name: string): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideAppInitializer(() => {
      const router = inject(Router);
      router.events.subscribe((event) => {
        if (
          !(
            event instanceof NavigationStart ||
            event instanceof NavigationEnd ||
            event instanceof NavigationError
          )
        ) {
          return;
        }

        const label =
          event instanceof NavigationStart
            ? 'navigation-start'
            : event instanceof NavigationEnd
              ? 'navigation-end'
              : 'navigation-error';

        const url =
          event instanceof NavigationStart
            ? event.url
            : event instanceof NavigationEnd
              ? event.urlAfterRedirects
              : window.location.href;

        console.group(`[RUNTIME:${name}] router ${label}`);
        console.log('url:', url);
        console.log('current URL:', window.location.href);
        console.log('history.state:', structuredClone(window.history.state));
        console.groupEnd();

        recordRuntimeEvent(name, `router.${label}`, {
          url,
          from: event instanceof NavigationEnd ? event.url : undefined,
          error: event instanceof NavigationError ? event.error : undefined,
        });
      });
    }),
  ]);
}
