import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { LoaderService } from '../../services/loader.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { CommonService } from '../../common/common.service';
import { QuestionnaireService } from '../../services/questionnaire.service';

@Component({
  selector: 'app-questionnaire',
  templateUrl: './questionnaire.component.html',
  styleUrls: ['./questionnaire.component.scss']
})
export class QuestionnaireComponent implements OnInit {
  quizData: any;
  studentStyles: any = [];
  otherStyleFlag: boolean = false;
  otherPractiseFlag: boolean = false;
  isFormSubmit: boolean = false;
  user: any;
  @ViewChild('quizForm') form: any;
  constructor(public questionService: QuestionnaireService, private loaderService: LoaderService, private toastr: ToastrService,
    private route: Router) {
    if (this.questionService.questionnaireId > 0) {
      this.toastr.warning('You have already submitted the quiz.')
      this.route.navigateByUrl('/student/dashboard');
    }
  }

  ngOnInit() {
    this.loaderService.processloader = false;
    this.toastr.info('Please complete the questionnaire to continue your musical journey.')
    this.user = CommonService.getUser();
    this.initialiseQuizData(this.user);
    if (this.questionService.questionnaireId > 0) {
    }
  }

  getQuizSubmittedData(user: any) {
    this.loaderService.processloader = true;
    this.questionService.getQuestionnaireSubmittedData(user).subscribe((result: any) => {
      this.loaderService.processloader = false;
      if (result != null) {
        this.quizData = result;
        this.quizData.TakenVoiceLessonsBefore = this.quizData.TakenVoiceLessonsBefore.toString();
        this.quizData['StudentId'] = user.IsStudent === 1 ? user.Student[0].StudentId : 0;
        this.studentStyles = this.quizData.Style != '' ? this.quizData.Style.split(',') : [];
        let index = this.questionService.studentPractiseOptions.findIndex(i => i.option === this.quizData.HowOftenPractice);
        if (index === -1) {
          this.otherPractiseFlag = true;
        }
        if (this.quizData.OtherStyle != '') {
          this.otherStyleFlag = true;
        }
      }
    })
  }

  private initialiseQuizData(user: any) {
    this.quizData = {
      QuestionnaireId: 0,
      UserId: user.UserId,
      StudentId: user.IsStudent === 1 ? user.Student[0].StudentId : 0,
      ExternalUserId: "",
      Source: 'VLAPP',
      RawJson: "",
      Age: "",
      Style: "",
      OtherStyle: "",
      StudentLevel: "",
      WhereCurrentlySing: "",
      TakenVoiceLessonsBefore: "",
      HowLongTakeLessons: "",
      GoalsForVoiceStudy: "",
      HowOftenPractice: "",
      WhatDoYouWant: "",
      Created: new Date(),
      VideoSubmissionId: null
    };
  }

  onStudentLevelSelection(level) {
    this.quizData.StudentLevel = level;
  }

  onStudentPractiseSelection(practise) {
    this.otherPractiseFlag = false;
    this.quizData.HowOftenPractice = practise;
  }

  onStudentStyleSelection(style) {
    this.quizData.Style = "";
    let index = this.studentStyles.indexOf(style);
    if (index > -1)
      this.studentStyles.splice(index, 1);
    else
      this.studentStyles.push(style);
    if (this.studentStyles.length > 0) {
      if (this.studentStyles.length === 1)
        this.quizData.Style = this.studentStyles[0];
      else {
        this.studentStyles.forEach(element => {
          if (this.quizData.Style === "")
            this.quizData.Style = element + ',';
          else
            this.quizData.Style = this.quizData.Style + element + ',';
        });
        this.quizData.style = this.quizData.Style.trim();
        this.quizData.style = this.quizData.style.substring(0, this.quizData.style.length - 1);
      }
    }
  }

  upsertStudentQuizData() {
    this.isFormSubmit = true;
    if (this.form.valid && this.quizData.StudentLevel != '' && this.quizData.TakenVoiceLessonsBefore != '' &&
      ((this.quizData.TakenVoiceLessonsBefore === 'true' && this.quizData.HowLongTakeLessons != '') ||
        this.quizData.TakenVoiceLessonsBefore === 'false')) {
      this.loaderService.processloader = true;
      this.questionService.post('/student/UpsertStudentQuizData', this.quizData, new HttpParams()).subscribe((result: any) => {
        this.loaderService.processloader = false;
        if (result == null)
          this.toastr.error("Student quiz data could not be saved. Please try again.")
        else {
          this.questionService.questionnaireId = result.QuestionnaireId;
          this.toastr.success("Student quiz data saved successfully.")
          this.getStudentProfileCompletionData();
        }
      })
    }
  }

  getStudentProfileCompletionData() {
    this.loaderService.processloader = true;
    this.questionService.get('/sProfile/GetStudentProfileCompletionStatus', new HttpParams().
      set('profileStatusId', this.user.StudentProfileStatusId)).subscribe((result: any) => {
        this.loaderService.processloader = false;
        if (!(result.VideoFlag) && this.user.IsVideoEvalRequired) {
          this.route.navigateByUrl('/student/guidedvideofeedback/add-video');
        }
        else {
          this.route.navigateByUrl('/student/dashboard');
        }
      });
  }

  onOtherStyleSelection() {
    if (this.otherStyleFlag) {
      this.quizData.OtherStyle = "";
    }
    this.otherStyleFlag = !this.otherStyleFlag;
  }

  onOtherPractiseSelection() {
    this.quizData.HowOftenPractice = "";
    this.otherPractiseFlag = !this.otherPractiseFlag;
  }
}
