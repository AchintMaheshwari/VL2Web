import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleLessonComponent } from './schedule-lesson.component';

describe('ScheduleLessonComponent', () => {
  let component: ScheduleLessonComponent;
  let fixture: ComponentFixture<ScheduleLessonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScheduleLessonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleLessonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
