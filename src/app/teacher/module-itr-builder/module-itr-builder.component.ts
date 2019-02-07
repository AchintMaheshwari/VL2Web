
import { Component, OnInit, AfterContentInit, AfterViewInit, TemplateRef, Inject, OnDestroy } from '@angular/core';
import { TooltipModule, TabsModule, AccordionConfig, BsModalRef, BsModalService } from 'ngx-bootstrap';
import { LobbyService } from '../../services/lobby.service';
import { HttpParams } from '@angular/common/http';
import { LessonModel } from '../../models/lesson.model';
import { SharedlibraryService } from '../../services/sharedlibrary.service';
import { MatDialog } from '../../../../node_modules/@angular/material';
import { Router } from '../../../../node_modules/@angular/router';
import { CommonService } from '../../common/common.service';
import { ToastrService } from 'ngx-toastr';
import { SongsService } from '../../services/song.service';
import { ExerciseLibraryService } from '../../services/exercise-library.service';
import { RateTeacherDialogComponent } from '../../student/rate-teacher-dialog/rate-teacher-dialog.component';

declare var VidyoIOPlayer: any;
declare var VoiceLessons: any;
declare var VoiceLessonsExercisePlayer: any;
declare var LivePlayer: any;

@Component({
  selector: 'app-module-itr-builder',
  templateUrl: './module-itr-builder.component.html',
  styleUrls: ['./module-itr-builder.component.scss']
})

export class ModuleItrBuilderComponent implements OnInit {
  ngOnDestroy() {
    CommonService.parentNodeList = undefined;
    this.sharedLibrary.libraryNodes = undefined;
    VoiceLessons.destoryPlayer();
    VoiceLessonsExercisePlayer.stopMusic();
    CommonService.isEditLessonQueueLoaded = false;
    CommonService.isPlayerStarted = false;
    clearInterval(LivePlayer.checkFormControllerProperties);
  }
  token: string = null;
  role: string = null;
  modalRef: BsModalRef;
  isDropup = true;
  LessonId = null;
  LessonModel: LessonModel;
  isStudent: number;
  vocal: string = 'Sirens (Glissando)';
  onsetValue: string = 'Track & Release';
  vowel: string = "Ending Vowels";
  presetVal: string="Coordination & Tuning ITRs";
  eVowel: string = "Ending Vowels";
  nVowel: string = "Neutral Vowels";
  cVowel: string = "Curbing Vowels";
  cPreset: string = 'Coordination & Tuning ITRs';
  sPreset: string = 'Strength Building ITRs';
  aPreset: string = 'Acoustic Mode ITRs' ;
  siren: string = 'Sirens (Glissando)';
  intermediate: string = 'Intermediate Vocalize';
  advanced: string = 'Advanced Vocalize';
  gendr: string = 'Gender';
  spd: string = 'Speed';
  vocalizeList: any = [
    { value: 'Sirens (Glissando)' },
    { value: 'Intermediate Vocalize' },
    { value: 'Advanced Vocalize' },
  ]

  onsetList: any = [
    { value: 'Pulse & Release' },
    { value: 'Quack & Release' },
    { value: 'Wind & Release' },
  ]

  vowelList: any = [
    { value: 'Ending Vowels' },
    { value: 'Neutral Vowels' },
    { value: 'Curbing Vowels' },
  ]

  presetList: any = [
    { value: 'Coordination & Tuning ITRs' },
    { value: 'Strength Building ITRs' },
    { value: 'Acoustic Mode ITRs' },
  ]

  cPresetList: any = [
    { value: 'Training: ITR Coordination & Tuning: #1' },
    { value: 'Training: ITR Coordination & Tuning: #2' },
    { value: 'Training: ITR Coordination & Tuning: #3' },
    { value: 'Training: ITR Coordination & Tuning: #4' },
    { value: 'Training: ITR Coordination & Tuning: #5' }
  ]

  sPresetList: any = [
    { value: 'Training: ITR Strength Building #1' },
    { value: 'Training: ITR Strength Building #2' },
    { value: 'Training: ITR Strength Building #3' },
    { value: 'Training: ITR Strength Building #4' },
    { value: 'Training: ITR Strength Building #5' }
  ]

  aPresetList: any = [
    { value: 'Training: ITR Acoustic Mode: Edging' },
    { value: 'Training: ITR Acoustic Mode: Neutral' },
    { value: 'Training: ITR Acoustic Mode: Curbing' }
  ]

  sirenList: any = [
    { value: 'Major 2nd' },
    { value: 'Minor 3rd' },
    { value: 'Major 3rd' },
    { value: 'Melodic 4th' },
    { value: 'Melodic 5th' },
    { value: 'Melodic 6th' },
    { value: 'Octave' },
  ]

  genderList: any = [
    { value: 'Male' },
    { value: 'Female' }
  ]

  speedList: any = [
    { value: 'Slow' },
    { value: 'Fast' }
  ]

  intermediateList: any = [
    { value: 'Track & Track' },
    { value: 'Track & Release' },
    { value: 'Release & Sustain' },
    { value: 'Diaphragm & Vibrato Development' },
    { value: 'Onsets & Sirens Introduction' },
    { value: 'Onsets & Melodic 5th Sirens' },
    { value: 'Onsets & Octave Sirens' },
    { value: 'Bridging & Connecting #1' },
    { value: 'Articulation #1' },
    { value: 'Bridging & Connecting #2A' },
    { value: 'Bridging & Connecting #2B – Sustain' },
    { value: 'Bridging & Connecting #2C – 2nd Onset' },
    { value: 'Bridging & Connecting #3 – Minor Key' },
    { value: 'Articulation #2' },
    { value: 'Bridging & Connecting with Calibrations #1' },
    { value: 'Bridging & Connecting with Calibrations #2' },
    { value: 'Octave Sweeps #1' },
    { value: 'Octave Sweeps #2 – Sustain' },
    { value: 'The Nine Note Run' }
  ]

  advancedList: any = [
    { value: 'The Hero' },
    { value: 'Twang Contractions & Calibrations #1' },
    { value: 'Twang Contractions & Calibrations #2' },
    { value: 'The Tormentor' },
    { value: 'The Tower of Power' },
    { value: 'Close Encounters of the 3rd Kind' },
    { value: 'Cry Onsets & Extreme Scream Pitch Training' },
    { value: 'TVS Solfege' },
    { value: 'Endurance Strengthening' },
    { value: 'Pentatonic One' },
    { value: 'Pentatonic Run' },
    { value: 'Pentatonic Call & Response' },
    { value: 'Pentatonic The Staley' },
    { value: 'Pentatonic Swinger' },
    { value: 'Pentatonic Teaser' },
    { value: 'Groove The Rock Ballad' },
    { value: 'Groove Anthem of Reverie' },
    { value: 'Groove Piano Man' },
    { value: 'Groove The Not So Obvious Note' },
    { value: 'Groove Han’s Bendy Jazz Voicing' }
  ]

  eVowelList: any = [
    { value: '/ee/' },
    { value: '/ih/' },
    { value: '/eh/' },
    { value: '/a/' }
  ]

  nVowelList: any = [
    { value: '/ah/' },
    { value: '/aw/' }
  ]

  cVowelList: any = [
    { value: '/uh/' },
    { value: '/oh/' },
    { value: '/ou/' },
    { value: '/oo/' },
  ]

  constructor(private modalService: BsModalService, public lobbyService: LobbyService, private toastr: ToastrService,
    public sharedLibrary: SharedlibraryService, public dialog: MatDialog, private router: Router, private songService: SongsService,
    private exerciseService: ExerciseLibraryService) {
    this.sharedLibrary.saveItemSource = "video";
    function getAccordionConfig(): AccordionConfig {
      return Object.assign(new AccordionConfig(), { closeOthers: true });
    }
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(
      template,
      Object.assign({}, { class: 'rateYourTeacher' })
    );
  }

  ngOnInit() {
    var userData = CommonService.getUser();
    this.isStudent = userData.IsStudent;
    this.unloadLibraryListComponent();
    localStorage.setItem("UserName", 'Achint');
    this.role = localStorage.getItem("UserType");
    this.lobbyService.get("/vidyo/CreateToken", new HttpParams()).subscribe((resultData: any) => {
      this.token = resultData;
      localStorage.setItem("Token", resultData);
      VidyoIOPlayer.init(this.token);
    });
  }

  loadLibraryListComponent() {
    this.sharedLibrary.isSong = this.sharedLibrary.isExercise = this.sharedLibrary.isVideo = this.sharedLibrary.isStep2 = this.sharedLibrary.isStep3 = false;
    this.sharedLibrary.isLibrary = true;
  }

  unloadLibraryListComponent() {
    this.sharedLibrary.isLibrary = this.sharedLibrary.isSong = this.sharedLibrary.isExercise = this.sharedLibrary.isStep2 = this.sharedLibrary.isStep3 = false;
    this.sharedLibrary.isVideo = true;
  }

  onVocalizeChange(item: string) {
    this.vocal = item;
  }

  onSirenChange(item: string) {
    this.siren = item;
  }

  onIntermediateChange(item: string) {
    this.intermediate = item;
  }

  onAdvancedChange(item: string) {
    this.advanced = item;
  }

  onGenderChange(item: string) {
    this.gendr = item;
  }

  onSpeedChange(item: string) {
    this.spd = item;
  }

  onOnsetChange(item: string) {
    this.onsetValue = item;
  }

  onVowelChange(item: string) {
    this.vowel = item;
  }

  onEVowelChange(item: string) {
    this.eVowel = item;
  }

  onNVowelChange(item: string) {
    this.nVowel = item;
  }

  onCVowelChange(item: string) {
    this.cVowel = item;
  }

  onPresetChange(item: string) {
    this.presetVal = item;
  }

  onCPresetChange(item: string) {
    this.cPreset = item;
  }

  onSPresetChange(item: string) {
    this.sPreset = item;
  }

  onAPresetChange(item: string) {
    this.aPreset = item;
  }

  endLesson() {
    if (this.isStudent == 0) {
      if (localStorage.getItem('EditLesson') != null && localStorage.getItem('EditLesson') != "") {
        this.sharedLibrary.LessonModel = JSON.parse(localStorage.getItem('EditLesson'));
        if (this.sharedLibrary.LessonModel.Student != undefined) {
          if (this.sharedLibrary.LessonModel.Student.length > 0) {
            this.sharedLibrary.LessonModel.Student.forEach(element => {
              if (this.sharedLibrary.LessonModel.Users == null)
                this.sharedLibrary.LessonModel.Users = element.UserId + ',';
              else
                this.sharedLibrary.LessonModel.Users = this.sharedLibrary.LessonModel.Users + element.UserId + ',';
            });
          }
          else {
            this.sharedLibrary.LessonModel.Users = "";
          }
        }
        else {
          this.sharedLibrary.LessonModel.Users = "";
        }
        if (this.sharedLibrary.libraryNodes != undefined) {
          var nodeLength = this.sharedLibrary.libraryNodes.length;
          for (let index = 0; index < nodeLength; index++) {
            if (this.sharedLibrary.libraryNodes[0].LabelName == 'Drag Here!...') {
              this.sharedLibrary.libraryNodes.splice(index, 1);
              break;
            }
          }
          if (this.sharedLibrary.libraryNodes.length > 0) {
            this.sharedLibrary.LessonModel.LessonQueue = JSON.stringify(this.sharedLibrary.libraryNodes);
          } else {
            this.sharedLibrary.LessonModel.LessonQueue = "";
          }
        } else {
          this.sharedLibrary.LessonModel.LessonQueue = "";
        }
        if (this.sharedLibrary.LessonModel.Tags == null) {
          this.sharedLibrary.LessonModel.Tags = "";
        }
        //this.sharedLibrary.LessonModel.Ended = CommonService.convertToUTCDate(Date.now.toString());
        this.sharedLibrary.LessonModel.Ended = CommonService.convertToUTCDate(new Date().toString());
        this.sharedLibrary.post('/lesson/UpsertLesson', this.sharedLibrary.LessonModel, new HttpParams()).subscribe((response: any) => {
          LivePlayer.SendEndLesson(true);
          this.toastr.success("Lesson ended successfully.");
          localStorage.removeItem("EditLesson");
          localStorage.removeItem("LessonGuid");
          this.sharedLibrary.LessonModel = null;
          CommonService.isEditLessonQueueLoaded = false;
          if (localStorage.getItem('userRole') == 'Teacher')
            this.router.navigate(['teacher/dashboard'])
          else
            this.router.navigate(['student/dashboard'])
        });
      } else {
        if (this.sharedLibrary.libraryNodes != undefined) {
          var nodeLength = this.sharedLibrary.libraryNodes.length;
          for (let index = 0; index < nodeLength; index++) {
            if (this.sharedLibrary.libraryNodes[0].LabelName == 'Drag Here!...') {
              this.sharedLibrary.libraryNodes.splice(index, 1);
              break;
            }
          }
          if (this.sharedLibrary.libraryNodes.length > 0) {
            this.sharedLibrary.LessonModel.LessonQueue = JSON.stringify(this.sharedLibrary.libraryNodes);
          } else {
            this.sharedLibrary.LessonModel.LessonQueue = "";
          }
        } else {
          this.sharedLibrary.LessonModel.LessonQueue = "";
        }

        if (CommonService.treeViewObject == null) {
          this.sharedLibrary.LessonModel.LessonHistory = '';
        }
        else {
          this.sharedLibrary.LessonModel.LessonHistory = JSON.stringify(CommonService.treeViewObject.libraryHistory);
        }
        if (this.sharedLibrary.LessonModel.Tags == null) {
          this.sharedLibrary.LessonModel.Tags = "";
        }
        //this.sharedLibrary.LessonModel.Ended = CommonService.convertToUTCDate(Date.now.toString());
        this.sharedLibrary.LessonModel.Ended = CommonService.convertToUTCDate(new Date().toString());
        this.sharedLibrary.post('/lesson/UpsertLesson', this.sharedLibrary.LessonModel, new HttpParams()).subscribe((response: any) => {
          this.toastr.success("Lesson ended successfully.");
          localStorage.removeItem("EditLesson");
          localStorage.removeItem("LessonGuid");
          this.sharedLibrary.LessonModel = null;
          if (localStorage.getItem('userRole') == 'Teacher')
            this.router.navigate(['teacher/dashboard'])
          else
            this.router.navigate(['student/dashboard'])
        });
      }
    }
    else {
      if (localStorage.getItem('EditLesson') != null && localStorage.getItem('EditLesson') != "") {
        this.sharedLibrary.LessonModel = JSON.parse(localStorage.getItem('EditLesson'));
        this.openRateTeacherDialog();
      }
    }
  }

  addSong() {
    this.sharedLibrary.isLibrary = this.sharedLibrary.isExercise = this.sharedLibrary.isVideo = this.sharedLibrary.isStep2 = this.sharedLibrary.isStep3 = false;
    this.sharedLibrary.isSong = true;
    this.songService.songId = 0;
    this.songService.songTags = "";
    this.songService.IsAddedFromLibrary = false;
    if (localStorage.getItem('EditLesson') != null && localStorage.getItem('EditLesson') != "") {
      this.sharedLibrary.LessonModel = JSON.parse(localStorage.getItem('EditLesson'));
      CommonService.isEditLessonQueueLoaded = false;
    }
  }

  addExercise() {
    this.sharedLibrary.isLibrary = this.sharedLibrary.isSong = this.sharedLibrary.isVideo = this.sharedLibrary.isStep2 = this.sharedLibrary.isStep3 = false;
    this.sharedLibrary.isExercise = true;
    this.exerciseService.exerciseId = 0;
    this.exerciseService.exerciseTags = "";
    this.exerciseService.IsAddedFromLibrary = false;
    if (localStorage.getItem('EditLesson') != null && localStorage.getItem('EditLesson') != "") {
      this.sharedLibrary.LessonModel = JSON.parse(localStorage.getItem('EditLesson'));
      CommonService.isEditLessonQueueLoaded = false;
    }
  }

  openRateTeacherDialog(): void {
    const dialogRef = this.dialog.open(RateTeacherDialogComponent, {
      maxHeight: '80vh'
    });
  }
}
