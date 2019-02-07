import { Component, OnInit, NgZone, Input, Output, OnDestroy } from '@angular/core';
import { SongsService } from '../../../services/song.service';
import { Router } from '../../../../../node_modules/@angular/router';
import { LessonsService } from '../../../services/lessons.service';
import { CommonService } from '../../../common/common.service';
import { MatDialog } from '@angular/material';
import { ConfirmDeleteSongComponent } from '../../confirm-delete-song/confirm-delete-song.component';
import { HttpParams } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { SharedlibraryService } from '../../../services/sharedlibrary.service';
import { LoaderService } from '../../../services/loader.service';

declare var MIDI: any;
@Component({
  selector: 'app-song-library',
  templateUrl: './song-library.component.html',
  styleUrls: ['./song-library.component.scss']
})
export class SongLibraryComponent implements OnInit, OnDestroy {

  userType: string;
  ngOnDestroy(): void {
    this.songPlayer = $('.mediPlayer');
    this.songPlayer.clearSongList();
  }

  panelOpenState: boolean = false;
  filterSong: any;
  filterSelection: any = [];
  KeyList: any;
  userId: number
  songPlayer: any;
  constructor(public songService: SongsService, private router: Router, public lessonService: LessonsService,
    public dialog: MatDialog, private sharedService: SharedlibraryService, private toastr: ToastrService,
    private loaderService: LoaderService, public commonService: CommonService) {
    this.songService.IsAddedFromLibrary = false;
    this.userType = localStorage.getItem("UserType");
    this.lessonService.genreList.forEach(element => {
      element.checked = false;
    });
    this.lessonService.skillList.forEach(element => {
      element.checked = false;
    });

    this.lessonService.keyList.forEach(element => {
      element.checked = false;
    });

    this.lessonService.worshipList.forEach(element => {
      element.checked = false;
    });
  }

  ngOnInit() {
    this.getSongLibraries();
    this.userId = CommonService.getUser().UserId;
  }

  initSongPlayer(selector) {
    if ($('.songPlayer_' + selector).find('svg').length == 0) {
      this.songPlayer = $('.songPlayer_' + selector);
      this.songPlayer.mediaPlayer();
    }
  }

  getSongLibraries() {
    this.loaderService.processloader = true;
    this.songService.getSongLibraryList().subscribe((response: any) => {
      this.loaderService.processloader = false;
      this.songService.unfilteredSongList = response;
      this.songService.songsList = response;
      this.getKeysCount();
    })
  }

  getKeysCount() {
    this.songService.getKeysCount().subscribe((response: any) => {
      this.KeyList = response;
    })
  }

  downloadFile(url: string) {
    if (url != "") {
      window.open(url);
      window.URL.revokeObjectURL(url);
    }
  }

  upsertSong(songId: number, tags: string) {
    this.songService.songId = songId;
    this.songService.songTags = tags;
    this.songService.IsAddedFromLibrary = true;
    CommonService.parentNodeList = undefined;
    CommonService.isEditLessonQueueLoaded = false;
    if (this.userType === "Teacher") {
      if (localStorage.getItem('EditLesson') === null || localStorage.getItem('EditLesson') === "" ||
        localStorage.getItem('EditLesson') === undefined) {
        this.sharedService.initialiseLessonModel();
      }
      else {
        this.sharedService.LessonModel = JSON.parse(localStorage.getItem('EditLesson'));
      }
      this.router.navigate(['/teacher/lesson-planner/add-song']);
    }
    else if (this.userType === "Student") {
      this.router.navigate(['/student/playlist/add-song']);
    }
  }

  roleFilterListing(role: any) {
    this.songService.songsList = this.songService.unfilteredSongList;
    if (role === 'Made by me') {
      this.songService.songsList = this.songService.songsList.filter(x => x.CreatedBy === this.userId);
    }
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
    this.searchSong();
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
    this.searchSong();
  }

  getCheckGenre(genreId, checkValue) {
    if (checkValue == true) {
      this.filterSelection.push({ 'Action': 'Genre', 'Id': genreId.toString() })
    }
    else {
      for (var i = 0; i < this.filterSelection.length; i++) {
        if (this.filterSelection[i].Id === genreId.toString() && this.filterSelection[i].Action == 'Genre') {
          this.filterSelection.splice(i, 1);
        }
      }
    }
    this.searchSong();
  }

  getCheckWorship(worshipId, checkValue) {
    if (checkValue == true) {
      this.filterSelection.push({ 'Action': 'Worship', 'Id': worshipId })
    }
    else {
      for (var i = 0; i < this.filterSelection.length; i++) {
        if (this.filterSelection[i].Id === worshipId && this.filterSelection[i].Action == 'Worship') {
          this.filterSelection.splice(i, 1);
        }
      }
    }
    this.searchSong();
  }

  searchSong() {
    this.songService.songsList = this.songService.unfilteredSongList;
    let filterValuesWorships = [];
    let filterValuesKeys = [];
    let filterValuesGenres = [];
    let filterValuesSkills = [];
    this.filterSelection.forEach(element => {
      if (element.Action === "Worship") {
        filterValuesWorships.push(element.Id);
      }
      else if (element.Action === "Genre") {
        filterValuesGenres.push(element.Id);
      }
      else if (element.Action === "Skill") {
        filterValuesSkills.push(element.Id);
      }
      else if (element.Action === "Key") {
        filterValuesKeys.push(element.Id);
      }
    });
    if (this.filterSelection.length === 0) {
      this.songService.songsList = this.songService.songsList;
    }
    else {
      this.songService.songsList = this.songService.songsList.filter(x =>
        (filterValuesGenres.length === 0 ? x.Genre || x.Genre === "" : this.isGenrePresent(x.Genre, filterValuesGenres)) &&
        (filterValuesKeys.length === 0 ? x.Key || x.Key === null : filterValuesKeys.indexOf(x.Key) != -1) &&
        (filterValuesWorships.length === 0 ? x.Worship : filterValuesWorships.indexOf(parseInt(x.Worship)) != -1) &&
        (filterValuesSkills.length === 0 ? x.SkillLevel : filterValuesSkills.indexOf(parseInt(x.SkillLevel)) != -1)
      );
    }
  }

  isGenrePresent(item: any, filterValuesGenres: any) {
    let isGenrePresent = false;
    item.split(',').forEach(elm => {
      if (filterValuesGenres.indexOf(elm) != -1) {
        isGenrePresent = isGenrePresent || true;
      }
      else {
        isGenrePresent = isGenrePresent || false;
      }
    })
    return isGenrePresent;
  }

  openSongDeleteDialog(songId, songName): void {
    this.songService.currentSongId = songId;
    this.songService.currentSongName = songName;
    this.dialog.open(ConfirmDeleteSongComponent, {});
  }

  cloneSong(ObjSong) {
    this.songService.get('/planner/GetSongCloneName', new HttpParams().set("SongId", ObjSong.SongId)).subscribe((resultData: any) => {
      this.songService.copySongName = resultData;
      this.songService.cloneSongId = ObjSong.SongId;
      this.songService.songTags = ObjSong.Tags;
      this.songService.songData = ObjSong;
      this.createSongCopy();
    });
  }

  createSongCopy(): any {
    if (this.songService.cloneSongId > 0) {
      this.songService.songData.SongId = 0;
      this.songService.songData.ParentSongId = this.songService.cloneSongId;
      this.songService.songData.Label = this.songService.copySongName;
      this.songService.songData.CreatedByUserId = this.userId;
      this.lessonService.post('/song/UpsertSong', this.songService.songData, new HttpParams()).subscribe((response: any) => {
        this.toastr.success('Song Cloned Succesfully!!');
        this.songService.songId = 0;
        this.getSongLibraries();
      });
    }
  }

  linkCopiedMessage() {
    this.toastr.success('Successfully Cloned!!! Enjoy the musical journey!!!');
  }
}
