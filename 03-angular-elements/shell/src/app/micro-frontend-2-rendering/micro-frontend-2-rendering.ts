import { LazyElementDirective } from '@angular-extensions/elements';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-micro-frontend-2-rendering',
  imports: [LazyElementDirective],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './micro-frontend-2-rendering.html',
  styleUrl: './micro-frontend-2-rendering.scss',
})
export class MicroFrontend2Rendering {
  frontendUrl = 'http://localhost:4302/main.js';
}
