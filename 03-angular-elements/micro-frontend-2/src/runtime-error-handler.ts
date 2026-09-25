import { ErrorHandler } from '@angular/core';

import { recordRuntimeEvent } from './runtime-debug';

export class RuntimeErrorHandler implements ErrorHandler {
  private readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  handleError(error: unknown): void {
    const err = error as { message?: string; stack?: string; cause?: unknown };

    console.group(`[RUNTIME:${this.name}] angular.errorHandler`);
    console.error('error:', error);
    console.log('message:', err?.message);
    console.log('stack:', err?.stack);
    console.log('cause:', err?.cause);
    console.log('url:', window.location.href);
    console.log('history.state:', structuredClone(window.history.state));
    console.log('history.length:', window.history.length);
    console.trace();
    console.groupEnd();

    recordRuntimeEvent(this.name, 'angular.errorHandler', {
      message: err?.message,
      stack: err?.stack,
      cause: err?.cause,
    });

    // Keep Angular's normal error reporting
    console.error(error);
  }
}
