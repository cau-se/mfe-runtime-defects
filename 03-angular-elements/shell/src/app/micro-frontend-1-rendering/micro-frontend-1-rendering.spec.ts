import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MicroFrontend1Rendering } from './micro-frontend-1-rendering';

describe('MicroFrontend1Rendering', () => {
  let component: MicroFrontend1Rendering;
  let fixture: ComponentFixture<MicroFrontend1Rendering>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MicroFrontend1Rendering]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MicroFrontend1Rendering);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
