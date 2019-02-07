import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoBrowserComponent } from './no-browser.component';

describe('NoBrowserComponent', () => {
  let component: NoBrowserComponent;
  let fixture: ComponentFixture<NoBrowserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoBrowserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoBrowserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
