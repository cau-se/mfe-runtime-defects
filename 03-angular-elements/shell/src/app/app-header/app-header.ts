import { Component, VERSION } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavLink {
  label: string;
  version: string;
  route: string;
}

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './app-header.html',
  styleUrl: './app-header.scss',
})
export class AppHeader {
  readonly angularVersion = VERSION.full;

  // Angular versions scanned from each micro-frontend project
  // (node_modules/@angular/core in 03-angular-elements/micro-frontend-N).
  readonly links: NavLink[] = [
    { label: 'MF1', version: '20.3.18', route: '/micro-frontend-1' },
    { label: 'MF2', version: '21.2.6', route: '/micro-frontend-2' },
    { label: 'MF3', version: '20.3.19', route: '/micro-frontend-3' },
    { label: 'MF4', version: '22.2.0', route: '/micro-frontend-4' },
  ];
}
