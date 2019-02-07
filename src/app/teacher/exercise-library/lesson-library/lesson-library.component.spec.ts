import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LessonLibraryComponent } from './lesson-library.component';

describe('LessonLibraryComponent', () => {
  let component: LessonLibraryComponent;
  let fixture: ComponentFixture<LessonLibraryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LessonLibraryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LessonLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
