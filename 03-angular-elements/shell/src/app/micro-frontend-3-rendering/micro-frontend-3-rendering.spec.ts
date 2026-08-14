import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MicroFrontend3Rendering } from './micro-frontend-3-rendering';

describe('MicroFrontend3Rendering', () => {
  let component: MicroFrontend3Rendering;
  let fixture: ComponentFixture<MicroFrontend3Rendering>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MicroFrontend3Rendering]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MicroFrontend3Rendering);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
