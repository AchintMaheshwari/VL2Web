import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LessonplannerComponent } from './lessonplanner.component';

describe('LessonplannerComponent', () => {
  let component: LessonplannerComponent;
  let fixture: ComponentFixture<LessonplannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LessonplannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LessonplannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
