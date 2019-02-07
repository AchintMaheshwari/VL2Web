import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectDatesComponent } from './select-dates.component';

describe('SelectDatesComponent', () => {
  let component: SelectDatesComponent;
  let fixture: ComponentFixture<SelectDatesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectDatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectDatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
