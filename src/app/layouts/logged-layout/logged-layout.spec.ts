import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoggedLayout } from './logged-layout';

describe('LoggedLayout', () => {
  let component: LoggedLayout;
  let fixture: ComponentFixture<LoggedLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoggedLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoggedLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
