import { Routes } from '@angular/router';
import { Home } from './home/home';
import { MicroFrontend1Rendering } from './micro-frontend-1-rendering/micro-frontend-1-rendering';
import { MicroFrontend2Rendering } from './micro-frontend-2-rendering/micro-frontend-2-rendering';
import { MicroFrontend3Rendering } from './micro-frontend-3-rendering/micro-frontend-3-rendering';
import { MicroFrontend4Rendering } from './micro-frontend-4-rendering/micro-frontend-4-rendering';

export const routes: Routes = [
  {
    path: 'micro-frontend-1',
    component: MicroFrontend1Rendering,
  },
  {
    path: 'micro-frontend-2',
    component: MicroFrontend2Rendering,
  },
  {
    path: 'micro-frontend-3',
    component: MicroFrontend3Rendering,
  },
  {
    path: 'micro-frontend-4',
    component: MicroFrontend4Rendering,
  },
  {
    path: 'home',
    component: Home,
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
