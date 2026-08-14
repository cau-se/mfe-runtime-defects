import { LazyElementDirective } from '@angular-extensions/elements';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-micro-frontend-1-rendering',
  imports: [LazyElementDirective],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './micro-frontend-1-rendering.html',
  styleUrl: './micro-frontend-1-rendering.scss',
})
export class MicroFrontend1Rendering {
  frontendUrl = 'http://localhost:4301/main.js';
}
