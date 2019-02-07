import { Component, OnInit, NgZone } from '@angular/core';
import { ExerciseLibraryService } from '../../services/exercise-library.service';
import { ConfirmDeleteExcerciseComponent } from '../confirm-delete-excercise/confirm-delete-excercise.component';
import { MatDialog } from '@angular/material';
import { Router } from '../../../../node_modules/@angular/router';
import { CommonService } from '../../common/common.service';
import { LessonsService } from '../../services/lessons.service';
import { HttpParams } from '@angular/common/http';
import { ToastrService } from '../../../../node_modules/ngx-toastr';
import { SharedlibraryService } from '../../services/sharedlibrary.service';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-exercise-library',
  templateUrl: './exercise-library.component.html',
  styleUrls: ['./exercise-library.component.scss']
})
export class ExerciseLibraryComponent implements OnInit {
  [x: string]: any;
  panelOpenState: boolean = false;
  filterExercise: any;
  KeyList: any;
  filterSelection: any = [];
  userId: number;
  currentUser: number;
  userType: string;
  constructor(public exerciseLibraryService: ExerciseLibraryService, public dialog: MatDialog, private router: Router,
    public lessonService: LessonsService, private toastr: ToastrService, private sharedService: SharedlibraryService,
    private loaderService: LoaderService) {
    this.exerciseLibraryService.IsAddedFromLibrary = false;
    this.userType = localStorage.getItem("UserType");
  }

  ngOnInit() {
    this.lessonService.vocalList.forEach(element => {
      element.checked = false;
    });

    this.lessonService.skillList.forEach(element => {
      element.checked = false;
    });

    this.lessonService.keyList.forEach(element => {
      element.checked = false;
    });
    this.getExerciseLibraryList();
    this.getKeysCountInExercise();
    this.userId = CommonService.getUser().UserId;
    this.currentUser == CommonService.getUser().Teacher[0].TeacherId;
  }

  getExerciseLibraryList() {
    this.loaderService.processloader = true;
    this.exerciseLibraryService.getExerciseLibraryList().subscribe((response: any) => {
      this.loaderService.processloader = false;
      this.exerciseLibraryService.exerciseList = response;
      this.exerciseLibraryService.unfilteredExerciseList = response;
    })
  }

  getKeysCountInExercise() {
    this.exerciseLibraryService.getKeysCountInExercise().subscribe((response: any) => {
      this.KeyList = response;
    })
  }

  getCheckKey(KeyID, checkValue) {
    if (checkValue == true) {
      this.filterSelection.push({ 'Action': 'Key', 'Id': KeyID })
    }
    else {
      for (var i = 0; i < this.filterSelection.length; i++) {
        if (this.filterSelection[i].Id === KeyID && this.filterSelection[i].Action == 'Key') {
          this.filterSelection.splice(i, 1);
        }
      }
    }
    this.searchExercise();
  }


  getCheckSkill(skillId, checkValue) {
    if (checkValue == true) {
      this.filterSelection.push({ 'Action': 'Skill', 'Id': skillId })
    }
    else {
      for (var i = 0; i < this.filterSelection.length; i++) {
        if (this.filterSelection[i].Id === skillId && this.filterSelection[i].Action == 'Skill') {
          this.filterSelection.splice(i, 1);
        }
      }
    }
    this.searchExercise();
  }

  getCheckVocal(vocalId, checkValue) {
    if (checkValue == true) {
      this.filterSelection.push({ 'Action': 'Vocal', 'Id': vocalId.toString() })
    }
    else {
      for (var i = 0; i < this.filterSelection.length; i++) {
        if (this.filterSelection[i].Id === vocalId.toString() && this.filterSelection[i].Action == 'Vocal') {
          this.filterSelection.splice(i, 1);
        }
      }
    }
    this.searchExercise();
  }

  opendeleteDialog(exerciseDelId, exerciseName): void {
    this.exerciseLibraryService.currentexerciseId = exerciseDelId;
    this.exerciseLibraryService.currentExerciseName = exerciseName
    this.dialog.open(ConfirmDeleteExcerciseComponent, {});
  }

  upsertExercise(exerciseId: number, tags: string) {
    this.exerciseLibraryService.exerciseId = exerciseId;
    this.exerciseLibraryService.exerciseTags = tags;
    this.exerciseLibraryService.IsAddedFromLibrary = true;
    CommonService.isEditLessonQueueLoaded = false;
    CommonService.parentNodeList = undefined;
    if (this.userType === "Teacher") {
      if (localStorage.getItem('EditLesson') === null || localStorage.getItem('EditLesson') === "" ||
        localStorage.getItem('EditLesson') === undefined) {
        this.sharedService.initialiseLessonModel();
      }
      else {
        this.sharedService.LessonModel = JSON.parse(localStorage.getItem('EditLesson'));
      }
      this.router.navigate(['/teacher/lesson-planner/add-exercise']);
    }
    else if (this.userType === "Student") {
      this.router.navigate(['/student/playlist/add-exercise']);
    }
  }

  roleFilterListing(role: any) {
    this.exerciseLibraryService.exerciseList = this.exerciseLibraryService.unfilteredExerciseList;
    if (role === 'Made by me') {
      this.exerciseLibraryService.exerciseList = this.exerciseLibraryService.exerciseList.filter(x => x.CreatedBy === this.userId);
    }
  }

  searchExercise() {
    this.exerciseLibraryService.exerciseList = this.exerciseLibraryService.unfilteredExerciseList;
    let filterValuesKeys = [];
    let filterValuesSkills = [];
    let filterValuesVocals = [];
    this.filterSelection.forEach(element => {
      if (element.Action === "Vocal") {
        filterValuesVocals.push(element.Id);
      }
      else if (element.Action === "Skill") {
        filterValuesSkills.push(element.Id);
      }
      else if (element.Action === "Key") {
        filterValuesKeys.push(element.Id);
      }
    });
    if (this.filterSelection.length === 0) {
      this.exerciseLibraryService.exerciseList = this.exerciseLibraryService.exerciseList;
    }
    else {
      this.exerciseLibraryService.exerciseList = this.exerciseLibraryService.exerciseList.filter(x =>
        (filterValuesVocals.length === 0 ? x.VocalType || x.VocalType === "" : this.isVocalPresent(x.VocalType, filterValuesVocals)) &&
        (filterValuesKeys.length === 0 ? x.KeyName || x.KeyName === null : this.isKeyPresent(x.KeyName, filterValuesKeys)) &&
        (filterValuesSkills.length === 0 ? x.SkillLevel : filterValuesSkills.indexOf(parseInt(x.SkillLevel)) != -1)
      );
    }
  }

  isVocalPresent(item: any, filterValuesVocals: any) {
    let isVocalPresent = false;
    if (item != null) {
      item.split(',').forEach(elm => {
        if (filterValuesVocals.indexOf(elm) != -1) {
          isVocalPresent = isVocalPresent || true;
        }
        else {
          isVocalPresent = isVocalPresent || false;
        }
      })
    }
    return isVocalPresent;
  }

  isKeyPresent(item: any, filterValuesKeys: any) {
    let isKeyPresent = false;
    if (item != null) {
      item.split(',').forEach(elm => {
        var value = elm;
        if (filterValuesKeys.indexOf(elm.replace(/\s/g, "")) != -1) {
          isKeyPresent = isKeyPresent || true;
        }
        else {
          isKeyPresent = isKeyPresent || false;
        }
      })
    }
    return isKeyPresent;
  }

  cloneExercise(ObjExercise) {
    this.exerciseLibraryService.get('/planner/GetCopyExerciseName', new HttpParams().set("ExerciseId", ObjExercise.ExerciseId)).subscribe((resultData: any) => {
      this.exerciseLibraryService.copyExerciseName = resultData;
      this.exerciseLibraryService.exerciseId = ObjExercise.ExerciseId;
      this.exerciseLibraryService.exerciseTags = ObjExercise.Tags;
      this.createExerciseCopy();
    });
  }

  createExerciseCopy() {
    if (this.exerciseLibraryService.exerciseId > 0) {
      this.lessonService.getExerciseDataById(this.exerciseLibraryService.exerciseId).subscribe((response: any) => {
        var exerciseModel = response;
        exerciseModel.Tags = this.exerciseLibraryService.exerciseTags;
        exerciseModel.IsDeleted = false;
        exerciseModel.ExerciseId = 0;
        exerciseModel.ParentExerciseId = this.exerciseLibraryService.exerciseId;
        exerciseModel.ExerciseName = this.exerciseLibraryService.copyExerciseName;
        exerciseModel.CreatedByUserId = this.userId;
        this.lessonService.post('/planner/CreateDuplicateExercise', exerciseModel, new HttpParams()).subscribe((response: any) => {
          this.toastr.success('Exercise Cloned Succesfully!!');
          this.exerciseLibraryService.exerciseId = 0;
          this.exerciseLibraryService.exerciseTags = null;
          this.getExerciseLibraryList();
        });
      });
    }
  }

  linkCopiedMessage() {
    this.toastr.success('Successfully Cloned!!! Enjoy the musical journey!!!');
  }
}









