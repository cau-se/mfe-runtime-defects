import { LazyElementDirective } from '@angular-extensions/elements';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-micro-frontend-3-rendering',
  imports: [LazyElementDirective],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './micro-frontend-3-rendering.html',
  styleUrl: './micro-frontend-3-rendering.scss',
})
export class MicroFrontend3Rendering {
  frontendUrl = 'http://localhost:4303/main.js';
}
