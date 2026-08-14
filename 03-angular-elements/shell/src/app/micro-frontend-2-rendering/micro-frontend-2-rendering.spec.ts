import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MicroFrontend2Rendering } from './micro-frontend-2-rendering';

describe('MicroFrontend2Rendering', () => {
  let component: MicroFrontend2Rendering;
  let fixture: ComponentFixture<MicroFrontend2Rendering>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MicroFrontend2Rendering]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MicroFrontend2Rendering);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
