import { Component, OnInit } from '@angular/core';
import { SongsService } from '../../../services/song.service';
import { Node } from '../../tree-view/node';
import { SharedlibraryService } from '../../../services/sharedlibrary.service';
import { CommonService } from '../../../common/common.service';
import { LoaderService } from '../../../services/loader.service';

@Component({
  selector: 'app-librarylist',
  templateUrl: './librarylist.component.html',
  styleUrls: ['./librarylist.component.scss']
})
export class LibrarylistComponent implements OnInit {

  nodes: Array<Node> = [];
  songsDatalist: any;
  targetList: Array<Node> = [];
  isDropup = true;
  songsDataEmpty: any;
  libraryList: any;
  searchText: any;

  //-----NoteFlight----------
  noteFilightList: any[] = [];
  noteFilightScoreId: string;
  noteFlightURL: string;
  selectedNoteFlight: string;

  //---Lyrics---------------------
  lyricsList: any[] = [];
  selectedLyrics: string;
  lyricshtml: string;

  //-------Translation-------------------
  translationhtml: string;

  //--------Video-----------------
  videoList: any[] = [];
  selectedVideoUrl: string;
  trustedDashboardUrl = null;

  filterSelection: any = [];
  checkedSong: boolean = false;
  checkedExercise: boolean = false;
  checkedVideo: boolean = false;
  checkedLesson: boolean = false;
  checkedMine: boolean = false;
  checkedLibrary: boolean = false;

  public scrollbarOptions = { axis: 'yx', theme: 'minimal-dark' };

  constructor(public songService: SongsService, private sharedLibrary: SharedlibraryService, private loaderService: LoaderService) {
    var userData = CommonService.getUser();
    if (userData.Teacher != null) {
      this.loaderService.processloader = true;
      this.songService.getLessonPlannerLibraryList().subscribe(result => {
        this.loaderService.processloader = false;
        this.songService.libraryList = result;
        var nodeList = this.convertToNodes(result);
        this.sharedLibrary.songList = result;
        this.songsDatalist = this.clone(nodeList);
        this.nodes.push(new Node(CommonService.getGuid(), CommonService.getGuid(), 'Drag Here!...', null, null, null, null, null, null, null, null, null, null, null, null, null, null, [], null, null));
        this.noteFlightURL = "";
      });
    }
  }

  ngOnInit() {
  }

  convertToNodes(songNodes: any): Array<Node> {
    var nodeList = new Array<Node>();
    songNodes.forEach(element => {
      nodeList.push(new Node(element.SongId, CommonService.getGuid(), element.Label, element.Artist, element.VideoUrl, element.AudioFile, element.JumpPoints, element.FilterType, element.CreatedByUserId, false, element.NoteflightScoreID, element.Lyrics, element.TransLations, element.LessonQueue, element.Midi, element.IsTeacherPlayed, element.IsStudentPlayed, [], element.TeacherItemName, element.StudentItemName));
    });
    return nodeList;
  }

  clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
  }

  onChange(val, checkedVal) {
    if (checkedVal == false) {
      this.filterSelection.push({ 'Action': val })
    }
    else {
      for (var i = 0; i < this.filterSelection.length; i++) {
        if (this.filterSelection[i].Action === val) {
          this.filterSelection.splice(i, 1);
        }
      }
    }

    this.searchLibrary();
  }

  searchLibrary() {
    var result;
    let filterValues = [];
    let filterByMine = [];
    let filterByLibrary = [];
    let userId = CommonService.getUser().UserId;
    this.filterSelection.forEach(element => {
      if (element.Action != "Mine" && element.Action != 'Library') {
        filterValues.push(element.Action);
      } else if (element.Action == "Mine" && element.Action != 'Library') {
        filterByMine.push(userId);
      }
      else if (element.Action != "Mine" && element.Action == 'Library') {
        filterByLibrary.push(CommonService.systemUserId);
      }
    })

    if (this.filterSelection.length === 0) {
      result = this.songService.libraryList;
    } else {
      if (filterByMine.length === 0 && filterByLibrary.length === 0) {
        result = this.songService.libraryList.filter(x =>
          (filterValues.length === 0 ? x.FilterType : filterValues.indexOf(x.FilterType) != -1));
      }
      else if (filterByMine.length > 0 && filterByLibrary.length === 0) {
        result = this.songService.libraryList.filter(x =>
          (filterValues.length === 0 ? x.FilterType : filterValues.indexOf(x.FilterType) != -1) &&
          (filterByMine.indexOf(x.CreatedByUserId) != -1));
      }
      else if (filterByMine.length === 0 && filterByLibrary.length > 0) {
        result = this.songService.libraryList.filter(x =>
          (filterValues.length === 0 ? x.FilterType : filterValues.indexOf(x.FilterType) != -1) &&
          (filterByLibrary.indexOf(x.CreatedByUserId) != -1));
      }
      else if (filterByMine.length > 0 && filterByLibrary.length > 0) {
        result = this.songService.libraryList.filter(x =>
          (filterValues.length === 0 ? x.FilterType : filterValues.indexOf(x.FilterType) != -1) &&
          (filterByMine.indexOf(x.CreatedByUserId) != -1 || filterByLibrary.indexOf(x.CreatedByUserId) != -1));
      }
    }
    var nodeList = this.convertToNodes(result);
    this.songsDatalist = this.clone(nodeList);
  }
}
