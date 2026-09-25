import { LazyElementDirective } from '@angular-extensions/elements';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-micro-frontend-4-rendering',
  imports: [LazyElementDirective],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './micro-frontend-4-rendering.html',
  styleUrl: './micro-frontend-4-rendering.scss',
})
export class MicroFrontend4Rendering {
  frontendUrl = 'http://localhost:4304/main.js';
}
