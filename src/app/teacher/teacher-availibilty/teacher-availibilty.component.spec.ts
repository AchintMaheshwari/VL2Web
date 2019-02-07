import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherAvailibiltyComponent } from './teacher-availibilty.component';

describe('TeacherAvailibiltyComponent', () => {
  let component: TeacherAvailibiltyComponent;
  let fixture: ComponentFixture<TeacherAvailibiltyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeacherAvailibiltyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherAvailibiltyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
