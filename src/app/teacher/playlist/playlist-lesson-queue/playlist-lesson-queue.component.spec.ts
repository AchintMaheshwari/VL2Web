import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistLessonQueueComponent } from './playlist-lesson-queue.component';

describe('PlaylistLessonQueueComponent', () => {
  let component: PlaylistLessonQueueComponent;
  let fixture: ComponentFixture<PlaylistLessonQueueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlaylistLessonQueueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaylistLessonQueueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
