import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseLibraryComponent } from './exercise-library.component';

describe('ExerciseLibraryComponent', () => {
  let component: ExerciseLibraryComponent;
  let fixture: ComponentFixture<ExerciseLibraryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExerciseLibraryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExerciseLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
