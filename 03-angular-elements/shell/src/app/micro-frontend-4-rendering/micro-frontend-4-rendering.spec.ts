import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MicroFrontend4Rendering } from './micro-frontend-4-rendering';

describe('MicroFrontend4Rendering', () => {
  let component: MicroFrontend4Rendering;
  let fixture: ComponentFixture<MicroFrontend4Rendering>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MicroFrontend4Rendering]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MicroFrontend4Rendering);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
