import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherProfileEditComponent } from './teacher-profile-edit.component';

describe('TeacherProfileEditComponent', () => {
  let component: TeacherProfileEditComponent;
  let fixture: ComponentFixture<TeacherProfileEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeacherProfileEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherProfileEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
