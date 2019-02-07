import { Component, OnInit } from '@angular/core';
import { GuidedvideoService } from '../../services/guidedvideo.service';
import { HttpParams } from '@angular/common/http';
import { CommonService } from '../../common/common.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import { MatDialog } from '@angular/material';
import { AssignExistingLessonComponent } from '../../assign-existing-lesson/assign-existing-lesson.component';
import { LoaderService } from '../../services/loader.service';

export interface GuidedVideo {
  rowIndex: string;
  VideoUrl(arg0: string, VideoUrl: any, arg2: string, arg3: null): any;
  IsClaim: boolean;
  Video: string;
  Name: string;
  CountryName: string;
  City: string;
  Created: string;
}

declare var VoicelessonsGuidedVideoPlayer: any;
declare var VoicelessonsVideoPlayer: any;
@Component({
  selector: 'app-guidedvideo',
  templateUrl: './guidedvideo.component.html',
  styleUrls: ['./guidedvideo.component.scss']
})

export class GuidedvideoComponent implements OnInit {

  guidedVideoList: any;
  filteredItems: any;//GuidedVideo[];
  pages: number = 10;
  pageSize: number = 10;
  pageNumber: number = 0;
  currentIndex: number = 1;
  items: GuidedVideo[];
  pagesIndex: Array<number>;
  pageStart: number = 1;
  inputName: string = '';


  guidedVideoGridList: any = [];
  guidedVideoGridRows: number = 0;
  filteredItemsGrid: any;// GuidedVideo[];
  pagesGrid: number = 10;
  pageSizeGrid: number = 3;
  pageNumberGrid: number = 0;
  currentIndexGrid: number = 1;
  itemsGrid: GuidedVideo[];
  pagesIndexGrid: Array<number>;
  pageStartGrid: number = 1;
  inputNameGrid: string = '';

  currentIndexBeforeClaimList: number = 1;
  currentIndexBeforeClaimGrid: number = 1;
  isListView = true;
  isGridView = false;
  selectedOrder: string;
  selectedClaim: string;
  selectedDateOrder: string;

  claimArray: any = [];
  teacherId: any;

  selectedClaimStatus: string = "";
  isClaimSelected: boolean = false;

  constructor(public guidedvideoService: GuidedvideoService, private route: Router, private toastr: ToastrService,
    public dialog: MatDialog, private loaderService: LoaderService) {
    var userData = CommonService.getUser();
    this.teacherId = userData.Teacher[0].TeacherId;
    this.getGuidedVideoList();
  }

  ngOnInit() {
  }

  getGuidedVideoList() {
    this.selectedOrder = 'A-Z';
    this.selectedClaim = 'All';
    this.selectedDateOrder = 'Oldest to Newest';
    this.guidedVideoGridList = [];
    this.guidedvideoService.getGuidedVideoList().subscribe((response: any) => {
      let rowIndex = 0;
      response.forEach(element => {
        element.Created = moment(element.Created).format('M/DD/YYYY h:mm A');
        element.rowIndex = rowIndex++;
      });
      this.guidedvideoService.guidedVideoList = response;
      this.guidedvideoService.guidedVideoList = this.guidedvideoService.guidedVideoList.sort((x, y) => x.Name > y.Name ? 1 : -1);
      this.guidedvideoService.guidedVideoList = this.guidedvideoService.guidedVideoList.sort((a, b) => new Date(a.Created).getTime() - new Date(b.Created).getTime());

      this.filteredItems = this.guidedvideoService.guidedVideoList;
      this.guidedVideoList = this.guidedvideoService.guidedVideoList;
      this.guidedVideoGridRows = parseInt("" + this.guidedVideoList.length / 3);
      var listcounter = 0;
      var data = {};
      for (let index = 0; index < this.guidedVideoGridRows; index++) {
        data = {
          "VideoSubmissionId1": parseInt(this.guidedVideoList[listcounter].VideoSubmissionId),
          "Name1": this.guidedVideoList[listcounter].Name,
          "IsClaim1": this.guidedVideoList[listcounter].IsClaim,
          "TeacherVideoClaimsMapId1": this.guidedVideoList[listcounter].TeacherVideoClaimsMapId,
          "LessonId1": this.guidedVideoList[listcounter].LessonId,
          "ClaimStatus1": this.guidedVideoList[listcounter].ClaimStatus,
          "Created1": this.guidedVideoList[listcounter].Created,
          "RowIndex1": this.guidedVideoList[listcounter].rowIndex,
          "VideoUrl1": this.guidedVideoList[listcounter].VideoUrl,
          "UserId1": this.guidedVideoList[listcounter].UserId,
          "VideoSubmissionId2": parseInt(this.guidedVideoList[listcounter + 1].VideoSubmissionId),
          "Name2": this.guidedVideoList[listcounter + 1].Name,
          "IsClaim2": this.guidedVideoList[listcounter + 1].IsClaim,
          "TeacherVideoClaimsMapId2": this.guidedVideoList[listcounter + 1].TeacherVideoClaimsMapId,
          "LessonId2": this.guidedVideoList[listcounter + 1].LessonId,
          "ClaimStatus2": this.guidedVideoList[listcounter + 1].ClaimStatus,
          "Created2": this.guidedVideoList[listcounter + 1].Created,
          "RowIndex2": this.guidedVideoList[listcounter + 1].rowIndex,
          "VideoUrl2": this.guidedVideoList[listcounter + 1].VideoUrl,
          "UserId2": this.guidedVideoList[listcounter + 1].UserId,
          "VideoSubmissionId3": parseInt(this.guidedVideoList[listcounter + 2].VideoSubmissionId),
          "Name3": this.guidedVideoList[listcounter + 2].Name,
          "IsClaim3": this.guidedVideoList[listcounter + 2].IsClaim,
          "TeacherVideoClaimsMapId3": this.guidedVideoList[listcounter + 2].TeacherVideoClaimsMapId,
          "LessonId3": this.guidedVideoList[listcounter + 2].LessonId,
          "ClaimStatus3": this.guidedVideoList[listcounter + 2].ClaimStatus,
          "Created3": this.guidedVideoList[listcounter + 2].Created,
          "RowIndex3": this.guidedVideoList[listcounter + 2].rowIndex,
          "VideoUrl3": this.guidedVideoList[listcounter + 2].VideoUrl,
          "UserId3": this.guidedVideoList[listcounter + 2].UserId
        }
        this.guidedVideoGridList.push(data);

        for (let i = 0; i < 3; i++) {
          listcounter++;
        }
      }

      this.filteredItemsGrid = this.guidedVideoGridList;

      if (this.guidedvideoService.guidedVideoList % 3 != 0) {

        var remainingRecords = this.guidedvideoService.guidedVideoList.length - (this.guidedVideoGridRows * 3);

        if (remainingRecords == 1) {
          data = {
            "VideoSubmissionId1": parseInt(this.guidedVideoList[listcounter].VideoSubmissionId),
            "Name1": this.guidedVideoList[listcounter].Name,
            "IsClaim1": this.guidedVideoList[listcounter].IsClaim,
            "TeacherVideoClaimsMapId1": this.guidedVideoList[listcounter].TeacherVideoClaimsMapId,
            "LessonId1": this.guidedVideoList[listcounter].LessonId,
            "ClaimStatus1": this.guidedVideoList[listcounter].ClaimStatus,
            "Created1": this.guidedVideoList[listcounter].Created,
            "RowIndex1": this.guidedVideoList[listcounter].rowIndex,
            "VideoUrl1": this.guidedVideoList[listcounter].VideoUrl,
            "UserId1": this.guidedVideoList[listcounter].UserId
          }
        }
        else if (remainingRecords == 2) {
          data = {
            "VideoSubmissionId1": parseInt(this.guidedVideoList[listcounter].VideoSubmissionId),
            "Name1": this.guidedVideoList[listcounter].Name,
            "IsClaim1": this.guidedVideoList[listcounter].IsClaim,
            "TeacherVideoClaimsMapId1": this.guidedVideoList[listcounter].TeacherVideoClaimsMapId,
            "LessonId1": this.guidedVideoList[listcounter].LessonId,
            "ClaimStatus1": this.guidedVideoList[listcounter].ClaimStatus,
            "Created1": this.guidedVideoList[listcounter].Created,
            "RowIndex1": this.guidedVideoList[listcounter].rowIndex,
            "VideoUrl1": this.guidedVideoList[listcounter].VideoUrl,
            "UserId1": this.guidedVideoList[listcounter].UserId,
            "VideoSubmissionId2": parseInt(this.guidedVideoList[listcounter + 1].VideoSubmissionId),
            "Name2": this.guidedVideoList[listcounter + 1].Name,
            "IsClaim2": this.guidedVideoList[listcounter + 1].IsClaim,
            "TeacherVideoClaimsMapId2": this.guidedVideoList[listcounter + 1].TeacherVideoClaimsMapId,
            "LessonId2": this.guidedVideoList[listcounter + 1].LessonId,
            "ClaimStatus2": this.guidedVideoList[listcounter + 1].ClaimStatus,
            "Created2": this.guidedVideoList[listcounter + 1].Created,
            "RowIndex2": this.guidedVideoList[listcounter + 1].rowIndex,
            "VideoUrl2": this.guidedVideoList[listcounter + 1].VideoUrl,
            "UserId2": this.guidedVideoList[listcounter + 1].UserId
          }
        }
        this.guidedVideoGridList.push(data);
        this.guidedVideoGridRows++;
      }


      this.initList();
      this.initGrid();
    })
  }

  initList() {
    this.currentIndex = 1;
    this.pageStart = 1;
    this.pages = 10;

    this.pageNumber = parseInt("" + (this.filteredItems.length / this.pageSize));
    if (this.filteredItems.length % this.pageSize != 0) {
      this.pageNumber++;
    }

    if (this.pageNumber < this.pages) {
      this.pages = this.pageNumber;
    }

    this.refreshItems();
  }

  initGrid() {
    this.currentIndexGrid = 1;
    this.pageStartGrid = 1;
    this.pagesGrid = 3;

    this.pageNumberGrid = parseInt("" + (this.filteredItemsGrid.length / this.pageSizeGrid));
    if (this.filteredItemsGrid.length % this.pageSizeGrid != 0) {
      this.pageNumberGrid++;
    }

    if (this.pageNumberGrid < this.pagesGrid) {
      this.pagesGrid = this.pageNumberGrid;
    }

    this.pagesGrid = parseInt("" + (this.filteredItems.length / 9));
    if (this.guidedvideoService.guidedVideoList % 9 != 0) {
      //var remainingRecords = this.filteredItems.length - (this.pagesGrid * 9);
      this.pagesGrid = this.pagesGrid + 1;
    }
    this.refreshItemsGrid();
  }

  FilterByName() {
    if (this.isListView == true) {
      this.filterListView();
    }
    else {
      this.filterGridView();
    }

  }

  filterListView() {
    this.filteredItems = [];
    if (this.inputName != "") {
      this.guidedVideoList.forEach(element => {
        if (element.Name.toUpperCase().includes(this.inputName.toUpperCase()) || element.Country.toUpperCase().includes(this.inputName.toUpperCase())
          || element.PostalCode.toUpperCase().includes(this.inputName.toUpperCase())) {
          this.filteredItems.push(element);
        }
      });
    } else {
      this.filteredItems = this.guidedvideoService.guidedVideoList;
    }

    if (this.selectedClaim == 'Claimed') {
      this.selectedClaimStatus = 'All';
      this.getClaimedFilterGuidedList(1, this.filteredItems);
    } else if (this.selectedClaim == 'Unclaimed') {
      this.getClaimedFilterGuidedList(0, this.filteredItems);
    } else {
      this.getClaimedFilterGuidedList(2, this.filteredItems);
    }

    this.initList();
  }

  filterGridView() {
    var filteredGrid = [];
    if (this.inputName != "") {
      this.guidedVideoList.forEach(element => {
        if (element.Name.toUpperCase().includes(this.inputName.toUpperCase()) || element.Country.toUpperCase().includes(this.inputName.toUpperCase())
          || element.PostalCode.toUpperCase().includes(this.inputName.toUpperCase())) {
          filteredGrid.push(element);
        }
      });
    } else {
      filteredGrid = this.guidedvideoService.guidedVideoList;
    }

    this.guidedVideoGridRows = parseInt("" + filteredGrid.length / 3);

    var listcounter = 0;
    var data = {};
    this.guidedVideoGridList = [];
    for (let index = 0; index < this.guidedVideoGridRows; index++) {
      data = {
        "VideoSubmissionId1": parseInt(filteredGrid[listcounter].VideoSubmissionId),
        "Name1": filteredGrid[listcounter].Name,
        "IsClaim1": filteredGrid[listcounter].IsClaim,
        "TeacherVideoClaimsMapId1": filteredGrid[listcounter].TeacherVideoClaimsMapId,
        "LessonId1": filteredGrid[listcounter].LessonId,
        "ClaimStatus1": filteredGrid[listcounter].ClaimStatus,
        "Created1": filteredGrid[listcounter].Created,
        "RowIndex1": filteredGrid[listcounter].rowIndex,
        "VideoUrl1": filteredGrid[listcounter].VideoUrl,
        "UserId1": filteredGrid[listcounter].UserId,
        "VideoSubmissionId2": parseInt(filteredGrid[listcounter + 1].VideoSubmissionId),
        "Name2": filteredGrid[listcounter + 1].Name,
        "IsClaim2": filteredGrid[listcounter + 1].IsClaim,
        "TeacherVideoClaimsMapId2": filteredGrid[listcounter + 1].TeacherVideoClaimsMapId,
        "LessonId2": filteredGrid[listcounter + 1].LessonId,
        "ClaimStatus2": filteredGrid[listcounter + 1].ClaimStatus,
        "Created2": filteredGrid[listcounter + 1].Created,
        "RowIndex2": filteredGrid[listcounter + 1].rowIndex,
        "VideoUrl2": filteredGrid[listcounter + 1].VideoUrl,
        "UserId2": filteredGrid[listcounter + 1].UserId,
        "VideoSubmissionId3": parseInt(filteredGrid[listcounter + 2].VideoSubmissionId),
        "Name3": filteredGrid[listcounter + 2].Name,
        "IsClaim3": filteredGrid[listcounter + 2].IsClaim,
        "TeacherVideoClaimsMapId3": filteredGrid[listcounter + 2].TeacherVideoClaimsMapId,
        "LessonId3": filteredGrid[listcounter + 2].LessonId,
        "ClaimStatus3": filteredGrid[listcounter + 2].ClaimStatus,
        "Created3": filteredGrid[listcounter + 2].Created,
        "RowIndex3": filteredGrid[listcounter + 2].rowIndex,
        "VideoUrl3": filteredGrid[listcounter + 2].VideoUrl,
        "UserId3": filteredGrid[listcounter + 2].UserId,
      }
      this.guidedVideoGridList.push(data);

      for (let i = 0; i < 3; i++) {
        listcounter++;
      }
    }

    this.filteredItemsGrid = this.guidedVideoGridList;

    if (filteredGrid.length % 3 != 0) {

      var remainingRecords = filteredGrid.length - (this.guidedVideoGridRows * 3);

      if (remainingRecords == 1) {
        data = {
          "VideoSubmissionId1": parseInt(filteredGrid[listcounter].VideoSubmissionId),
          "Name1": filteredGrid[listcounter].Name,
          "IsClaim1": filteredGrid[listcounter].IsClaim,
          "TeacherVideoClaimsMapId1": filteredGrid[listcounter].TeacherVideoClaimsMapId,
          "LessonId1": filteredGrid[listcounter].LessonId,
          "ClaimStatus1": filteredGrid[listcounter].ClaimStatus,
          "Created1": filteredGrid[listcounter].Created,
          "RowIndex1": filteredGrid[listcounter].rowIndex,
          "VideoUrl1": filteredGrid[listcounter].VideoUrl,
          "UserId1": filteredGrid[listcounter].UserId
        }
      }
      else if (remainingRecords == 2) {
        data = {
          "VideoSubmissionId1": parseInt(filteredGrid[listcounter].VideoSubmissionId),
          "Name1": filteredGrid[listcounter].Name,
          "IsClaim1": filteredGrid[listcounter].IsClaim,
          "TeacherVideoClaimsMapId1": filteredGrid[listcounter].TeacherVideoClaimsMapId,
          "LessonId1": filteredGrid[listcounter].LessonId,
          "ClaimStatus1": filteredGrid[listcounter].ClaimStatus,
          "Created1": filteredGrid[listcounter].Created,
          "RowIndex1": filteredGrid[listcounter].rowIndex,
          "VideoUrl1": filteredGrid[listcounter].VideoUrl,
          "UserId1": filteredGrid[listcounter].UserId,
          "VideoSubmissionId2": parseInt(filteredGrid[listcounter + 1].VideoSubmissionId),
          "Name2": filteredGrid[listcounter + 1].Name,
          "IsClaim2": filteredGrid[listcounter + 1].IsClaim,
          "TeacherVideoClaimsMapId2": filteredGrid[listcounter + 1].TeacherVideoClaimsMapId,
          "LessonId2": filteredGrid[listcounter + 1].LessonId,
          "ClaimStatus2": filteredGrid[listcounter + 1].ClaimStatus,
          "Created2": filteredGrid[listcounter + 1].Created,
          "RowIndex2": filteredGrid[listcounter + 1].rowIndex,
          "VideoUrl2": filteredGrid[listcounter + 1].VideoUrl,
          "UserId2": filteredGrid[listcounter + 1].UserId
        }
      }
      this.guidedVideoGridList.push(data);
      this.guidedVideoGridRows++;
    }

    if (this.selectedClaim == 'Claimed') {
      this.selectedClaimStatus = 'All';
      this.getClaimedFilterGuidedList(1, filteredGrid);
    } else if (this.selectedClaim == 'Unclaimed') {
      this.getClaimedFilterGuidedList(0, filteredGrid);
    } else {
      this.getClaimedFilterGuidedList(2, filteredGrid);
    }
    this.initGrid();
  }

  fillArray(): any {
    var obj = new Array();
    for (var index = this.pageStart; index < this.pageStart + this.pages; index++) {
      obj.push(index);
    }
    return obj;
  }

  refreshItems() {
    this.items = this.filteredItems.slice((this.currentIndex - 1) * this.pageSize, (this.currentIndex) * this.pageSize);
    this.pagesIndex = this.fillArray();
    CommonService.guidedVideoLsit = this.items;
    setTimeout(function () {
      CommonService.guidedVideoLsit.forEach(element => {
        if (element.VideoUrl != undefined)        
          VoicelessonsGuidedVideoPlayer.init('#videoDiv_' + element.rowIndex, element.VideoUrl, '', null);
          //VoicelessonsGuidedVideoPlayer.init('#videoDiv_' + element.rowIndex, element.VideoUrl, '', null);          
      });
    }, 500)
  }

  prevPage() {
    if (this.currentIndex > 1) {
      this.currentIndex--;
    }
    if (this.currentIndex < this.pageStart) {
      this.pageStart = this.currentIndex;
    }
    this.refreshItems();
  }

  nextPage() {
    if (this.currentIndex < this.pageNumber) {
      this.currentIndex++;
    }
    if (this.currentIndex >= (this.pageStart + this.pages)) {
      this.pageStart = this.currentIndex - this.pages + 1;
    }

    this.refreshItems();
  }

  setPage(index: number) {
    this.currentIndex = index;
    this.refreshItems();
  }

  refreshItemsGrid() {
    this.itemsGrid = this.filteredItemsGrid.slice((this.currentIndexGrid - 1) * this.pageSizeGrid, (this.currentIndexGrid) * this.pageSizeGrid);
    this.pagesIndexGrid = this.fillArrayGrid();
    CommonService.guidedVideoGridList = this.itemsGrid;
    CommonService.guidedVideoGridList=this.filteredItemsGrid;

    /*  setTimeout(function () {
       CommonService.guidedVideoGridList.forEach(element => {
         if (element.VideoUrl != undefined)
           VoicelessonsGuidedVideoPlayer.init('#gridVideoDiv_' + element.RowIndex, element.VideoUrl, '', null);
       });
     }, 500) */


     setTimeout(function () {
    this.guidedVideoGridRows = parseInt("" + CommonService.guidedVideoGridList.length / 3);
    var listcounter = 0;
    var data = {};
    this.guidedVideoGridList = [];
    for (let index = 0; index <  CommonService.guidedVideoGridList.length; index++) {
      if (CommonService.guidedVideoGridList[index].VideoUrl1 != undefined) {
        VoicelessonsGuidedVideoPlayer.init('#gridVideoDiv_' + CommonService.guidedVideoGridList[index].RowIndex1, CommonService.guidedVideoGridList[index].VideoUrl1, '', null);
      }
      if (CommonService.guidedVideoGridList[index].VideoUrl2 != undefined) {
        VoicelessonsGuidedVideoPlayer.init('#gridVideoDiv_' + CommonService.guidedVideoGridList[index].RowIndex2, CommonService.guidedVideoGridList[index].VideoUrl2, '', null);
      }
      if (CommonService.guidedVideoGridList[index].VideoUrl3 != undefined) {
        VoicelessonsGuidedVideoPlayer.init('#gridVideoDiv_' + CommonService.guidedVideoGridList[index].RowIndex3, CommonService.guidedVideoGridList[index].VideoUrl3, '', null);
      }
      //listcounter++;
    }
  }, 500);
    /* if (this.filteredItemsGrid.length % 3 != 0) {

      var remainingRecords = this.filteredItemsGrid.length - (this.guidedVideoGridRows * 3);

      if (remainingRecords == 1) {
        if (this.filteredItemsGrid[listcounter].VideoUrl1 != undefined){
          VoicelessonsGuidedVideoPlayer.init('#gridVideoDiv_' + this.filteredItemsGrid[listcounter].RowIndex1, this.filteredItemsGrid[listcounter].VideoUrl1, '', null);
          }
      }
      else if (remainingRecords == 2) {
        if (this.filteredItemsGrid[listcounter].VideoUrl1 != undefined){
          VoicelessonsGuidedVideoPlayer.init('#gridVideoDiv_' + this.filteredItemsGrid[listcounter].RowIndex1, this.filteredItemsGrid[listcounter].VideoUrl1, '', null);
          }
          if (this.filteredItemsGrid[listcounter + 1].VideoUrl2 != undefined){
            VoicelessonsGuidedVideoPlayer.init('#gridVideoDiv_' + this.filteredItemsGrid[listcounter + 1].RowIndex2, this.filteredItemsGrid[listcounter + 1].VideoUrl2, '', null);
            }
      }
    } */
  }

  fillArrayGrid(): any {
    var obj = new Array();
    for (var index = this.pageStartGrid; index < this.pageStartGrid + this.pagesGrid; index++) {
      obj.push(index);
    }
    return obj;
  }

  prevPageGrid() {
    if (this.currentIndexGrid > 1) {
      this.currentIndexGrid--;
    }
    if (this.currentIndexGrid < this.pageStartGrid) {
      this.pageStartGrid = this.currentIndexGrid;
    }
    this.refreshItemsGrid();
  }

  nextPageGrid() {
    if (this.currentIndexGrid < this.pageNumberGrid) {
      this.currentIndexGrid++;
    }
    if (this.currentIndexGrid >= (this.pageStartGrid + this.pagesGrid)) {
      this.pageStartGrid = this.currentIndexGrid - this.pagesGrid + 1;
    }

    this.refreshItemsGrid();
  }

  setPageGrid(index: number) {
    this.currentIndexGrid = index;
    this.refreshItemsGrid();
  }

  setListView() {
    this.isListView = true;
    this.isGridView = false;
    if (this.inputName != "") {
      this.FilterByName();
    }
  }

  setGridView() {
    this.isListView = false;
    this.isGridView = true;
    if (this.inputName != "") {
      this.FilterByName();
    }
  }

  sortByName() {
    if (this.selectedOrder == 'A-Z') {
      this.SortDescending()
    } else {
      this.SortAscending();
    }
  }

  SortAscending() {
    this.selectedOrder = 'A-Z';
    debugger;
    this.filteredItems = this.guidedvideoService.guidedVideoList.sort((x, y) => x.Name > y.Name ? 1 : -1);
    this.guidedVideoList = this.guidedvideoService.guidedVideoList.sort((x, y) => x.Name > y.Name ? 1 : -1);

    this.guidedVideoGridRows = parseInt("" + this.guidedVideoList.length / 3);
    this.guidedVideoGridList = [];
    var listcounter = 0;
    var data = {};
    for (let index = 0; index < this.guidedVideoGridRows; index++) {
      data = {
        "VideoSubmissionId1": parseInt(this.guidedVideoList[listcounter].VideoSubmissionId),
        "Name1": this.guidedVideoList[listcounter].Name,
        "IsClaim1": this.guidedVideoList[listcounter].IsClaim,
        "TeacherVideoClaimsMapId1": this.guidedVideoList[listcounter].TeacherVideoClaimsMapId,
        "LessonId1": this.guidedVideoList[listcounter].LessonId,
        "ClaimStatus1": this.guidedVideoList[listcounter].ClaimStatus,
        "Created1": this.guidedVideoList[listcounter].Created,
        "RowIndex1": this.guidedVideoList[listcounter].rowIndex,
        "VideoUrl1": this.guidedVideoList[listcounter].VideoUrl,
        "UserId1": this.guidedVideoList[listcounter].UserId,
        "VideoSubmissionId2": parseInt(this.guidedVideoList[listcounter + 1].VideoSubmissionId),
        "Name2": this.guidedVideoList[listcounter + 1].Name,
        "IsClaim2": this.guidedVideoList[listcounter + 1].IsClaim,
        "TeacherVideoClaimsMapId2": this.guidedVideoList[listcounter + 1].TeacherVideoClaimsMapId,
        "LessonId2": this.guidedVideoList[listcounter + 1].LessonId,
        "ClaimStatus2": this.guidedVideoList[listcounter + 1].ClaimStatus,
        "Created2": this.guidedVideoList[listcounter + 1].Created,
        "RowIndex2": this.guidedVideoList[listcounter + 1].rowIndex,
        "VideoUrl2": this.guidedVideoList[listcounter + 1].VideoUrl,
        "UserId2": this.guidedVideoList[listcounter + 1].UserId,
        "VideoSubmissionId3": parseInt(this.guidedVideoList[listcounter + 2].VideoSubmissionId),
        "Name3": this.guidedVideoList[listcounter + 2].Name,
        "IsClaim3": this.guidedVideoList[listcounter + 2].IsClaim,
        "TeacherVideoClaimsMapId3": this.guidedVideoList[listcounter + 2].TeacherVideoClaimsMapId,
        "LessonId3": this.guidedVideoList[listcounter + 2].LessonId,
        "ClaimStatus3": this.guidedVideoList[listcounter + 2].ClaimStatus,
        "Created3": this.guidedVideoList[listcounter + 2].Created,
        "RowIndex3": this.guidedVideoList[listcounter + 2].rowIndex,
        "VideoUrl3": this.guidedVideoList[listcounter + 2].VideoUrl,
        "UserId3": this.guidedVideoList[listcounter + 2].UserId,
      }
      this.guidedVideoGridList.push(data);

      for (let i = 0; i < 3; i++) {
        listcounter++;
      }
    }

    this.filteredItemsGrid = this.guidedVideoGridList;

    if (this.guidedVideoGridList.length % 3 != 0) {

      var remainingRecords = this.guidedvideoService.guidedVideoList.length - (this.guidedVideoGridRows * 3);

      if (remainingRecords == 1) {
        data = {
          "VideoSubmissionId1": parseInt(this.guidedVideoList[listcounter].VideoSubmissionId),
          "Name1": this.guidedVideoList[listcounter].Name,
          "IsClaim1": this.guidedVideoList[listcounter].IsClaim,
          "TeacherVideoClaimsMapId1": this.guidedVideoList[listcounter].TeacherVideoClaimsMapId,
          "LessonId1": this.guidedVideoList[listcounter].LessonId,
          "ClaimStatus1": this.guidedVideoList[listcounter].ClaimStatus,
          "Created1": this.guidedVideoList[listcounter].Created,
          "RowIndex1": this.guidedVideoList[listcounter].rowIndex,
          "VideoUrl1": this.guidedVideoList[listcounter].VideoUrl,
          "UserId1": this.guidedVideoList[listcounter].UserId
        }
      }
      else if (remainingRecords == 2) {
        data = {
          "VideoSubmissionId1": parseInt(this.guidedVideoList[listcounter].VideoSubmissionId),
          "Name1": this.guidedVideoList[listcounter].Name,
          "IsClaim1": this.guidedVideoList[listcounter].IsClaim,
          "TeacherVideoClaimsMapId1": this.guidedVideoList[listcounter].TeacherVideoClaimsMapId,
          "LessonId1": this.guidedVideoList[listcounter].LessonId,
          "ClaimStatus1": this.guidedVideoList[listcounter].ClaimStatus,
          "Created1": this.guidedVideoList[listcounter].Created,
          "RowIndex1": this.guidedVideoList[listcounter].rowIndex,
          "VideoUrl1": this.guidedVideoList[listcounter].VideoUrl,
          "UserId1": this.guidedVideoList[listcounter].UserId,
          "VideoSubmissionId2": parseInt(this.guidedVideoList[listcounter + 1].VideoSubmissionId),
          "Name2": this.guidedVideoList[listcounter + 1].Name,
          "IsClaim2": this.guidedVideoList[listcounter + 1].IsClaim,
          "TeacherVideoClaimsMapId2": this.guidedVideoList[listcounter + 1].TeacherVideoClaimsMapId,
          "LessonId2": this.guidedVideoList[listcounter + 1].LessonId,
          "ClaimStatus2": this.guidedVideoList[listcounter + 1].ClaimStatus,
          "Created2": this.guidedVideoList[listcounter + 1].Created,
          "RowIndex2": this.guidedVideoList[listcounter + 1].rowIndex,
          "VideoUrl2": this.guidedVideoList[listcounter + 1].VideoUrl,
          "UserId2": this.guidedVideoList[listcounter + 1].UserId
        }
      }
      this.guidedVideoGridList.push(data);
      this.guidedVideoGridRows++;
    }


    this.initList();
    this.initGrid();
    if (this.inputName != "") {
      this.FilterByName();
    }

    if (this.inputName == "") {
      if (this.selectedClaim == 'Claimed') {
        this.getClaimedGuidedList(1);
        this.isClaimSelected = true;
      } else if (this.selectedClaim == 'Unclaimed') {
        this.getClaimedGuidedList(0);
        this.isClaimSelected = false;
      } else {
        this.getClaimedGuidedList(2);
        this.isClaimSelected = false;
      }
    }
  }

  SortDescending() {
    this.selectedOrder = 'Z-A';
    this.filteredItems = this.guidedvideoService.guidedVideoList.sort((x, y) => x.Name < y.Name ? 1 : -1);
    this.guidedVideoList = this.guidedvideoService.guidedVideoList.sort((x, y) => x.Name < y.Name ? 1 : -1);

    this.guidedVideoGridRows = parseInt("" + this.guidedVideoList.length / 3);
    this.guidedVideoGridList = [];
    var listcounter = 0;
    var data = {};
    for (let index = 0; index < this.guidedVideoGridRows; index++) {
      data = {
        "VideoSubmissionId1": parseInt(this.guidedVideoList[listcounter].VideoSubmissionId),
        "Name1": this.guidedVideoList[listcounter].Name,
        "IsClaim1": this.guidedVideoList[listcounter].IsClaim,
        "TeacherVideoClaimsMapId1": this.guidedVideoList[listcounter].TeacherVideoClaimsMapId,
        "LessonId1": this.guidedVideoList[listcounter].LessonId,
        "ClaimStatus1": this.guidedVideoList[listcounter].ClaimStatus,
        "Created1": this.guidedVideoList[listcounter].Created,
        "RowIndex1": this.guidedVideoList[listcounter].rowIndex,
        "VideoUrl1": this.guidedVideoList[listcounter].VideoUrl,
        "UserId1": this.guidedVideoList[listcounter].UserId,
        "VideoSubmissionId2": parseInt(this.guidedVideoList[listcounter + 1].VideoSubmissionId),
        "Name2": this.guidedVideoList[listcounter + 1].Name,
        "IsClaim2": this.guidedVideoList[listcounter + 1].IsClaim,
        "TeacherVideoClaimsMapId2": this.guidedVideoList[listcounter + 1].TeacherVideoClaimsMapId,
        "LessonId2": this.guidedVideoList[listcounter + 1].LessonId,
        "ClaimStatus2": this.guidedVideoList[listcounter + 1].ClaimStatus,
        "Created2": this.guidedVideoList[listcounter + 1].Created,
        "RowIndex2": this.guidedVideoList[listcounter + 1].rowIndex,
        "VideoUrl2": this.guidedVideoList[listcounter + 1].VideoUrl,
        "UserId2": this.guidedVideoList[listcounter + 1].UserId,
        "VideoSubmissionId3": parseInt(this.guidedVideoList[listcounter + 2].VideoSubmissionId),
        "Name3": this.guidedVideoList[listcounter + 2].Name,
        "IsClaim3": this.guidedVideoList[listcounter + 2].IsClaim,
        "TeacherVideoClaimsMapId3": this.guidedVideoList[listcounter + 2].TeacherVideoClaimsMapId,
        "LessonId3": this.guidedVideoList[listcounter + 2].LessonId,
        "ClaimStatus3": this.guidedVideoList[listcounter + 2].ClaimStatus,
        "Created3": this.guidedVideoList[listcounter].Created,
        "RowIndex3": this.guidedVideoList[listcounter + 2].rowIndex,
        "VideoUrl3": this.guidedVideoList[listcounter + 2].VideoUrl,
        "UserId3": this.guidedVideoList[listcounter + 2].UserId
      }
      this.guidedVideoGridList.push(data);

      for (let i = 0; i < 3; i++) {
        listcounter++;
      }
    }

    this.filteredItemsGrid = this.guidedVideoGridList;

    if (this.guidedVideoGridList.length % 3 != 0) {

      var remainingRecords = this.guidedvideoService.guidedVideoList.length - (this.guidedVideoGridRows * 3);

      if (remainingRecords == 1) {
        data = {
          "VideoSubmissionId1": parseInt(this.guidedVideoList[listcounter].VideoSubmissionId),
          "Name1": this.guidedVideoList[listcounter].Name,
          "IsClaim1": this.guidedVideoList[listcounter].IsClaim,
          "TeacherVideoClaimsMapId1": this.guidedVideoList[listcounter].TeacherVideoClaimsMapId,
          "LessonId1": this.guidedVideoList[listcounter].LessonId,
          "ClaimStatus1": this.guidedVideoList[listcounter].ClaimStatus,
          "Created1": this.guidedVideoList[listcounter].Created,
          "RowIndex1": this.guidedVideoList[listcounter].rowIndex,
          "VideoUrl1": this.guidedVideoList[listcounter].VideoUrl,
          "UserId1": this.guidedVideoList[listcounter].UserId
        }
      }
      else if (remainingRecords == 2) {
        data = {
          "VideoSubmissionId1": parseInt(this.guidedVideoList[listcounter].VideoSubmissionId),
          "Name1": this.guidedVideoList[listcounter].Name,
          "IsClaim1": this.guidedVideoList[listcounter].IsClaim,
          "TeacherVideoClaimsMapId1": this.guidedVideoList[listcounter].TeacherVideoClaimsMapId,
          "LessonId1": this.guidedVideoList[listcounter].LessonId,
          "ClaimStatus1": this.guidedVideoList[listcounter].ClaimStatus,
          "Created1": this.guidedVideoList[listcounter].Created,
          "RowIndex1": this.guidedVideoList[listcounter].rowIndex,
          "VideoUrl1": this.guidedVideoList[listcounter].VideoUrl,
          "UserId1": this.guidedVideoList[listcounter].UserId,
          "VideoSubmissionId2": parseInt(this.guidedVideoList[listcounter + 1].VideoSubmissionId),
          "Name2": this.guidedVideoList[listcounter + 1].Name,
          "IsClaim2": this.guidedVideoList[listcounter + 1].IsClaim,
          "TeacherVideoClaimsMapId2": this.guidedVideoList[listcounter + 1].TeacherVideoClaimsMapId,
          "LessonId2": this.guidedVideoList[listcounter + 1].LessonId,
          "ClaimStatus2": this.guidedVideoList[listcounter + 1].ClaimStatus,
          "Created2": this.guidedVideoList[listcounter + 1].Created,
          "RowIndex2": this.guidedVideoList[listcounter + 1].rowIndex,
          "VideoUrl2": this.guidedVideoList[listcounter + 1].VideoUrl,
          "UserId2": this.guidedVideoList[listcounter + 1].UserId
        }
      }
      this.guidedVideoGridList.push(data);
      this.guidedVideoGridRows++;
    }
    this.initList();
    this.initGrid();
    if (this.inputName != "") {
      this.FilterByName();
    }

    if (this.inputName == "") {
      if (this.selectedClaim == 'Claimed') {
        this.getClaimedGuidedList(1);
        this.isClaimSelected = true;
      } else if (this.selectedClaim == 'Unclaimed') {
        this.getClaimedGuidedList(0);
        this.isClaimSelected = false;
      } else {
        this.getClaimedGuidedList(2);
        this.isClaimSelected = false;
      }
    }
  }

  getClaimedGuidedList(claim) {
    var claimdata;
    if (claim == 1) {
      this.selectedClaim = 'Claimed';
      if (this.selectedClaimStatus == undefined || this.selectedClaimStatus == "") {
        this.selectedClaimStatus = 'All';
      }
      this.isClaimSelected = true;
      claimdata = this.guidedvideoService.guidedVideoList.filter(x => x.IsClaim == true);
      if (this.selectedClaimStatus == 'All') {
        claimdata = this.guidedvideoService.guidedVideoList.filter(x => x.IsClaim == true);
      }
      else if (this.selectedClaimStatus == 'New') {
        claimdata = this.guidedvideoService.guidedVideoList.filter(x => x.IsClaim == true && x.ClaimStatus == 1 && x.LessonId == null);
      }
      else if (this.selectedClaimStatus == 'Viewed') {
        claimdata = this.guidedvideoService.guidedVideoList.filter(x => x.IsClaim == true && x.ClaimStatus == 1 && x.LessonId != null);
      }
      else if (this.selectedClaimStatus == 'Completed') {
        claimdata = this.guidedvideoService.guidedVideoList.filter(x => x.IsClaim == true && x.ClaimStatus == 2);
      }
    }
    else if (claim == 0) {
      this.selectedClaim = 'Unclaimed';
      this.isClaimSelected = false;
      this.selectedClaimStatus = '';
      claimdata = this.guidedvideoService.guidedVideoList.filter(x => x.IsClaim == false);
    } else {
      this.selectedClaim = 'All';
      this.isClaimSelected = false;
      this.selectedClaimStatus = '';
      claimdata = this.guidedvideoService.guidedVideoList;
    }
    // }

    this.filteredItems = [];
    if (this.inputName != "") {
      claimdata.forEach(element => {
        if (element.Name.toUpperCase().includes(this.inputName.toUpperCase()) || element.Country.toUpperCase().includes(this.inputName.toUpperCase())
          || element.PostalCode.toUpperCase().includes(this.inputName.toUpperCase())) {
          this.filteredItems.push(element);
        }
      });
    } else {
      this.filteredItems = claimdata;
    }

    this.guidedVideoGridRows = parseInt("" + this.filteredItems.length / 3);
    this.guidedVideoGridList = [];
    var listcounter = 0;
    var data = {};
    for (let index = 0; index < this.guidedVideoGridRows; index++) {
      data = {
        "VideoSubmissionId1": parseInt(this.filteredItems[listcounter].VideoSubmissionId),
        "Name1": this.filteredItems[listcounter].Name,
        "IsClaim1": this.filteredItems[listcounter].IsClaim,
        "TeacherVideoClaimsMapId1": this.filteredItems[listcounter].TeacherVideoClaimsMapId,
        "LessonId1": this.filteredItems[listcounter].LessonId,
        "ClaimStatus1": this.filteredItems[listcounter].ClaimStatus,
        "Created1": this.filteredItems[listcounter].Created,
        "RowIndex1": this.filteredItems[listcounter].rowIndex,
        "VideoUrl1": this.filteredItems[listcounter].VideoUrl,
        "UserId1": this.filteredItems[listcounter].UserId,
        "VideoSubmissionId2": parseInt(this.filteredItems[listcounter + 1].VideoSubmissionId),
        "Name2": this.filteredItems[listcounter + 1].Name,
        "IsClaim2": this.filteredItems[listcounter + 1].IsClaim,
        "TeacherVideoClaimsMapId2": this.filteredItems[listcounter + 1].TeacherVideoClaimsMapId,
        "LessonId2": this.filteredItems[listcounter + 1].LessonId,
        "ClaimStatus2": this.filteredItems[listcounter + 1].ClaimStatus,
        "Created2": this.filteredItems[listcounter + 1].Created,
        "RowIndex2": this.filteredItems[listcounter + 1].rowIndex,
        "VideoUrl2": this.filteredItems[listcounter + 1].VideoUrl,
        "UserId2": this.filteredItems[listcounter + 1].UserId,
        "VideoSubmissionId3": parseInt(this.filteredItems[listcounter + 2].VideoSubmissionId),
        "Name3": this.filteredItems[listcounter + 2].Name,
        "IsClaim3": this.filteredItems[listcounter + 2].IsClaim,
        "TeacherVideoClaimsMapId3": this.filteredItems[listcounter + 2].TeacherVideoClaimsMapId,
        "LessonId3": this.filteredItems[listcounter + 2].LessonId,
        "ClaimStatus3": this.filteredItems[listcounter + 2].ClaimStatus,
        "Created3": this.filteredItems[listcounter + 2].Created,
        "RowIndex3": this.filteredItems[listcounter + 2].rowIndex,
        "VideoUrl3": this.filteredItems[listcounter + 2].VideoUrl,
        "UserId3": this.filteredItems[listcounter + 2].UserId
      }
      this.guidedVideoGridList.push(data);

      for (let i = 0; i < 3; i++) {
        listcounter++;
      }
    }

    this.filteredItemsGrid = this.guidedVideoGridList;

    if (this.filteredItems % 3 != 0) {

      var remainingRecords = this.filteredItems.length - (this.guidedVideoGridRows * 3);

      if (remainingRecords == 1) {
        data = {
          "VideoSubmissionId1": parseInt(this.filteredItems[listcounter].VideoSubmissionId),
          "Name1": this.filteredItems[listcounter].Name,
          "IsClaim1": this.filteredItems[listcounter].IsClaim,
          "TeacherVideoClaimsMapId1": this.filteredItems[listcounter].TeacherVideoClaimsMapId,
          "LessonId1": this.filteredItems[listcounter].LessonId,
          "ClaimStatus1": this.filteredItems[listcounter].ClaimStatus,
          "Created1": this.filteredItems[listcounter].Created,
          "RowIndex1": this.filteredItems[listcounter].rowIndex,
          "VideoUrl1": this.filteredItems[listcounter].VideoUrl,
          "UserId1": this.filteredItems[listcounter].UserId
        }
        this.guidedVideoGridList.push(data);
        this.guidedVideoGridRows++;
      }
      else if (remainingRecords == 2) {
        data = {
          "VideoSubmissionId1": parseInt(this.filteredItems[listcounter].VideoSubmissionId),
          "Name1": this.filteredItems[listcounter].Name,
          "IsClaim1": this.filteredItems[listcounter].IsClaim,
          "TeacherVideoClaimsMapId1": this.filteredItems[listcounter].TeacherVideoClaimsMapId,
          "LessonId1": this.filteredItems[listcounter].LessonId,
          "ClaimStatus1": this.filteredItems[listcounter].ClaimStatus,
          "Created1": this.filteredItems[listcounter].Created,
          "RowIndex1": this.filteredItems[listcounter].rowIndex,
          "VideoUrl1": this.filteredItems[listcounter].VideoUrl,
          "UserId1": this.filteredItems[listcounter].UserId,
          "VideoSubmissionId2": parseInt(this.filteredItems[listcounter + 1].VideoSubmissionId),
          "Name2": this.filteredItems[listcounter + 1].Name,
          "IsClaim2": this.filteredItems[listcounter + 1].IsClaim,
          "TeacherVideoClaimsMapId2": this.filteredItems[listcounter + 1].TeacherVideoClaimsMapId,
          "LessonId2": this.filteredItems[listcounter + 1].LessonId,
          "ClaimStatus2": this.filteredItems[listcounter + 1].ClaimStatus,
          "Created2": this.filteredItems[listcounter + 1].Created,
          "RowIndex2": this.filteredItems[listcounter + 1].rowIndex,
          "VideoUrl2": this.filteredItems[listcounter + 1].VideoUrl,
          "UserId2": this.filteredItems[listcounter + 1].UserId
        }
        this.guidedVideoGridList.push(data);
        this.guidedVideoGridRows++;
      }
    }

    this.initList();
    this.initGrid();
  }

  getClaimedFilterGuidedList(claim, filterList) {
    if (claim == 1) {
      this.selectedClaim = 'Claimed';
      this.isClaimSelected = true;
      this.filteredItems = filterList.filter(x => x.IsClaim == true);
      if (this.selectedClaimStatus == 'All') {
        this.filteredItems = filterList.filter(x => x.IsClaim == true);
      }
      else if (this.selectedClaimStatus == 'New') {
        this.filteredItems = filterList.filter(x => x.IsClaim == true && x.ClaimStatus == 1 && x.LessonId == null);
      }
      else if (this.selectedClaimStatus == 'Viewed') {
        this.filteredItems = filterList.filter(x => x.IsClaim == true && x.ClaimStatus == 1 && x.LessonId != null);
      }
      else if (this.selectedClaimStatus == 'Completed') {
        this.filteredItems = filterList.filter(x => x.IsClaim == true && x.ClaimStatus == 2);
      }
    }
    else if (claim == 0) {
      this.selectedClaim = 'Unclaimed';
      this.isClaimSelected = false;
      this.filteredItems = filterList.filter(x => x.IsClaim == false);
    } else {
      this.selectedClaim = 'All';
      this.isClaimSelected = false;
      this.filteredItems = filterList;
    }
    // this.guidedVideoList = this.filteredItems;

    this.guidedVideoGridRows = parseInt("" + this.filteredItems.length / 3);
    this.guidedVideoGridList = [];
    var listcounter = 0;
    var data = {};
    for (let index = 0; index < this.guidedVideoGridRows; index++) {
      data = {
        "VideoSubmissionId1": parseInt(this.filteredItems[listcounter].VideoSubmissionId),
        "Name1": this.filteredItems[listcounter].Name,
        "IsClaim1": this.filteredItems[listcounter].IsClaim,
        "TeacherVideoClaimsMapId1": this.filteredItems[listcounter].TeacherVideoClaimsMapId,
        "LessonId1": this.filteredItems[listcounter].LessonId,
        "ClaimStatus1": this.filteredItems[listcounter].ClaimStatus,
        "Created1": this.filteredItems[listcounter].Created,
        "RowIndex1": this.filteredItems[listcounter].rowIndex,
        "VideoUrl1": this.filteredItems[listcounter].VideoUrl,
        "UserId1": this.filteredItems[listcounter].UserId,
        "VideoSubmissionId2": parseInt(this.filteredItems[listcounter + 1].VideoSubmissionId),
        "Name2": this.filteredItems[listcounter + 1].Name,
        "IsClaim2": this.filteredItems[listcounter + 1].IsClaim,
        "TeacherVideoClaimsMapId2": this.filteredItems[listcounter + 1].TeacherVideoClaimsMapId,
        "LessonId2": this.filteredItems[listcounter + 1].LessonId,
        "ClaimStatus2": this.filteredItems[listcounter + 1].ClaimStatus,
        "Created2": this.filteredItems[listcounter + 1].Created,
        "RowIndex2": this.filteredItems[listcounter + 1].rowIndex,
        "VideoUrl2": this.filteredItems[listcounter + 1].VideoUrl,
        "UserId2": this.filteredItems[listcounter + 1].UserId,
        "VideoSubmissionId3": parseInt(this.filteredItems[listcounter + 2].VideoSubmissionId),
        "Name3": this.filteredItems[listcounter + 2].Name,
        "IsClaim3": this.filteredItems[listcounter + 2].IsClaim,
        "TeacherVideoClaimsMapId3": this.filteredItems[listcounter + 2].TeacherVideoClaimsMapId,
        "LessonId3": this.filteredItems[listcounter + 2].LessonId,
        "ClaimStatus3": this.filteredItems[listcounter + 2].ClaimStatus,
        "Created3": this.filteredItems[listcounter + 2].Created,
        "RowIndex3": this.filteredItems[listcounter + 2].rowIndex,
        "VideoUrl3": this.filteredItems[listcounter + 2].VideoUrl,
        "UserId3": this.filteredItems[listcounter + 2].UserId,
      }

      this.guidedVideoGridList.push(data);

      for (let i = 0; i < 3; i++) {
        listcounter++;
      }
    }

    this.filteredItemsGrid = this.guidedVideoGridList;

    if (this.guidedVideoList % 3 != 0) {

      var remainingRecords = this.filteredItems.length - (this.guidedVideoGridRows * 3);

      if (remainingRecords == 1) {
        data = {
          "VideoSubmissionId1": parseInt(this.filteredItems[listcounter].VideoSubmissionId),
          "Name1": this.filteredItems[listcounter].Name,
          "IsClaim1": this.filteredItems[listcounter].IsClaim,
          "TeacherVideoClaimsMapId1": this.filteredItems[listcounter].TeacherVideoClaimsMapId,
          "LessonId1": this.filteredItems[listcounter].LessonId,
          "ClaimStatus1": this.filteredItems[listcounter].ClaimStatus,
          "Created1": this.filteredItems[listcounter].Created,
          "RowIndex1": this.filteredItems[listcounter].rowIndex,
          "VideoUrl1": this.filteredItems[listcounter].VideoUrl,
          "UserId1": this.filteredItems[listcounter].UserId,
        }
        this.guidedVideoGridList.push(data);
        this.guidedVideoGridRows++;
      }
      else if (remainingRecords == 2) {
        data = {
          "VideoSubmissionId1": parseInt(this.filteredItems[listcounter].VideoSubmissionId),
          "Name1": this.filteredItems[listcounter].Name,
          "IsClaim1": this.filteredItems[listcounter].IsClaim,
          "TeacherVideoClaimsMapId1": this.filteredItems[listcounter].TeacherVideoClaimsMapId,
          "LessonId1": this.filteredItems[listcounter].LessonId,
          "ClaimStatus1": this.filteredItems[listcounter].ClaimStatus,
          "Created1": this.filteredItems[listcounter].Created,
          "RowIndex1": this.filteredItems[listcounter].rowIndex,
          "VideoUrl1": this.filteredItems[listcounter].VideoUrl,
          "UserId1": this.filteredItems[listcounter].UserId,
          "VideoSubmissionId2": parseInt(this.filteredItems[listcounter + 1].VideoSubmissionId),
          "Name2": this.filteredItems[listcounter + 1].Name,
          "IsClaim2": this.filteredItems[listcounter + 1].IsClaim,
          "TeacherVideoClaimsMapId2": this.filteredItems[listcounter + 1].TeacherVideoClaimsMapId,
          "LessonId2": this.filteredItems[listcounter + 1].LessonId,
          "ClaimStatus2": this.filteredItems[listcounter + 1].ClaimStatus,
          "Created2": this.filteredItems[listcounter + 1].Created,
          "RowIndex2": this.filteredItems[listcounter + 1].rowIndex,
          "VideoUrl2": this.filteredItems[listcounter + 1].VideoUrl,
          "UserId2": this.filteredItems[listcounter + 1].UserId,
        }
        this.guidedVideoGridList.push(data);
        this.guidedVideoGridRows++;
      }
    }

    this.initList();
    this.initGrid();
  }

  setClaim(VideoSubmissionId, IsClaim, TeacherVideoClaimsMapId) {
    if (IsClaim == true) {
      this.guidedvideoService.get("/guidedVideo/CheckClaimCount", new HttpParams().set('teacherId', this.teacherId).set('videoSubmissionId', VideoSubmissionId)).subscribe((response: any) => {
        data = response.result.split(',');
        var TotalVideosClaimsbyTeacher = data[0];
        var TotalUnrealeasedVideosClaimsbyOtherTeacher = data[1];
        var TotalVideoClaim = data[2];
        var TotalVideoClaimbyOtherTeacher = data[3];

        if (parseInt(TotalVideosClaimsbyTeacher) == parseInt(TotalVideoClaim)) {
          this.toastr.warning('You Already Claimed ' + TotalVideoClaim + ' Students Guided Videos!!!');
          this.guidedvideoService.guidedVideoList.forEach(element => {
            if (element.VideoSubmissionId == VideoSubmissionId)
              element.IsClaim = false;
          });

          this.guidedVideoGridList.forEach(element => {
            if (element.VideoSubmissionId1 == VideoSubmissionId) {
              element.IsClaim1 = false;
            }
            else if (element.VideoSubmissionId2 == VideoSubmissionId) {
              element.IsClaim2 = false;
            }
            else if (element.VideoSubmissionId3 == VideoSubmissionId) {
              element.IsClaim3 = false;
            }
          });
        } else if (parseInt(TotalUnrealeasedVideosClaimsbyOtherTeacher) == parseInt(TotalVideoClaimbyOtherTeacher)) {
          this.toastr.warning('Student Guided Video Already Claimed by 3 Teachers!!!');

          this.guidedvideoService.guidedVideoList.forEach(element => {
            if (element.VideoSubmissionId == VideoSubmissionId)
              element.IsClaim = false;
          });

          this.guidedVideoGridList.forEach(element => {
            if (element.VideoSubmissionId1 == VideoSubmissionId) {
              element.IsClaim1 = false;
            }
            else if (element.VideoSubmissionId2 == VideoSubmissionId) {
              element.IsClaim2 = false;
            }
            else if (element.VideoSubmissionId3 == VideoSubmissionId) {
              element.IsClaim3 = false;
            }
          });


        }
        else {
          if (this.claimArray.length + parseInt(TotalVideosClaimsbyTeacher) < (parseInt(TotalVideoClaim))) {
            var data = { "VideoSubmissionId": VideoSubmissionId }
            this.claimArray.push(data);
          } else {
            this.toastr.warning('You Already Select Maximum Claimed Student Guided Video!!!');

            this.guidedvideoService.guidedVideoList.forEach(element => {
              if (element.VideoSubmissionId == VideoSubmissionId)
                element.IsClaim = false;
            });

            this.guidedVideoGridList.forEach(element => {
              if (element.VideoSubmissionId1 == VideoSubmissionId) {
                element.IsClaim1 = false;
              }
              else if (element.VideoSubmissionId2 == VideoSubmissionId) {
                element.IsClaim2 = false;
              }
              else if (element.VideoSubmissionId3 == VideoSubmissionId) {
                element.IsClaim3 = false;
              }
            });

          }
        }
      });
    } else {
      this.claimArray = this.claimArray.filter(x => x.VideoSubmissionId != VideoSubmissionId);
      this.unclaimedGuidedVideoStudent(VideoSubmissionId, TeacherVideoClaimsMapId);
    }
  }

  unclaimedGuidedVideoStudent(VideoSubmissionId, TeacherVideoClaimsMapId) {
    if (TeacherVideoClaimsMapId == 0) {
      this.guidedvideoService.guidedVideoList.forEach(element => {
        if (element.VideoSubmissionId == VideoSubmissionId)
          element.IsClaim = false;
      });

      this.guidedVideoGridList.forEach(element => {
        if (element.VideoSubmissionId1 == VideoSubmissionId) {
          element.IsClaim1 = false;
        }
        else if (element.VideoSubmissionId2 == VideoSubmissionId) {
          element.IsClaim2 = false;
        }
        else if (element.VideoSubmissionId3 == VideoSubmissionId) {
          element.IsClaim3 = false;
        }
      });
    } else {

      this.guidedvideoService.post("/guidedVideo/UnclaimedGuidedVideoStudent", null, new HttpParams().set('teacherId', this.teacherId).
        set('videoSubmissionId', VideoSubmissionId).set('teacherVideoClaimsMapId', TeacherVideoClaimsMapId)).subscribe((response: any) => {
          if (response.result == true) {
            this.toastr.success('Successfully UnClaim.');
            this.guidedvideoService.guidedVideoList.forEach(element => {
              if (element.VideoSubmissionId == VideoSubmissionId)
                element.IsClaim = false;
            });
          } else {
            this.toastr.warning('Lesson already assigned for this Student!!!');
            this.guidedvideoService.guidedVideoList.forEach(element => {
              if (element.VideoSubmissionId == VideoSubmissionId)
                element.IsClaim = true;
            });

            this.guidedVideoGridList.forEach(element => {
              if (element.VideoSubmissionId1 == VideoSubmissionId) {
                element.IsClaim1 = true;
              }
              else if (element.VideoSubmissionId2 == VideoSubmissionId) {
                element.IsClaim2 = true;
              }
              else if (element.VideoSubmissionId3 == VideoSubmissionId) {
                element.IsClaim3 = true;
              }
            });
          }
        });
    }
  }

  upsertClaimedbyTeacher() {
    if (this.claimArray.length == 0) {
      this.toastr.warning('Please select Student Guided Video!!!');
    } else {
      var counter = 0;
      this.claimArray.forEach(element => {
        this.guidedvideoService.post("/guidedVideo/ClaimGuidedVideo", null, new HttpParams().set('videoSubmissionId', element.VideoSubmissionId).set('teacherId', this.teacherId)).subscribe((response: any) => {
          counter = counter + 1;
          if (counter == this.claimArray.length) {
            this.toastr.success('Successfully Claim.');
            this.refreshList();
          }
        });
      });
    }
  }

  PlanGuidedLesson(videoSubmissionId, TeacherVideoClaimsMapId) {
    this.loaderService.processloader = true;
    let userData = CommonService.getUser();
    this.guidedvideoService.initialiseLessonModel();
    this.guidedvideoService.LessonModel.Tags = "";
    var GVUser = this.guidedvideoService.guidedVideoList.filter(x => x.VideoSubmissionId == videoSubmissionId)[0];
    if (GVUser.UserId != null) {
      this.guidedvideoService.LessonModel.Users = GVUser.UserId;
    }
    this.guidedvideoService.LessonModel.LessonName = 'Beginner Warmup Basics';
    this.guidedvideoService.post('/lesson/UpsertLesson', this.guidedvideoService.LessonModel, new HttpParams()).subscribe((response: any) => {
      this.guidedvideoService.LessonModel = response;
      localStorage.setItem("GVLesson", JSON.stringify(this.guidedvideoService.LessonModel));
      localStorage.setItem("VideoSubmissionId", videoSubmissionId);
      CommonService.isGVLessonQueueLoaded = false;
      this.guidedvideoService.post('/guidedVideo/UpsertGuidedVideoLessonId', null, new HttpParams()
        .set('teacherVideoClaimsMapId', TeacherVideoClaimsMapId)
        .set('lessonId', this.guidedvideoService.LessonModel.LessonId.toString())).subscribe((response: any) => {
          this.loaderService.processloader = false;
          this.route.navigate(['teacher/guidedvideo-lessonplanner']);
        });
    });
  }

  openDialogAssignExistingLesson(teacherVideoClaimsMapId,videoSubmissionId,userId): void {
    this.guidedvideoService.teacherVideoClaimsMapId = teacherVideoClaimsMapId;
    this.guidedvideoService.videoSubmissionId=videoSubmissionId;
    this.guidedvideoService.userId=userId;
    const dialogRef = this.dialog.open(AssignExistingLessonComponent, {
      maxHeight: '80vh'
    });
  }

  sortByDate() {
    if (this.selectedDateOrder == 'Oldest to Newest') {
      this.SortByDateAscending();
    } else {
      this.SortByDateDescending();
    }
  }

  SortByDateDescending() {
    this.selectedDateOrder = 'Oldest to Newest';
    if (this.selectedOrder == 'A-Z') {
      this.guidedVideoList = this.guidedVideoList.sort((x, y) => x.Name > y.Name ? 1 : -1);
    } else {
      this.guidedVideoList = this.guidedVideoList.sort((x, y) => x.Name < y.Name ? 1 : -1);
    }
    this.guidedVideoList = this.guidedVideoList.sort((a, b) => new Date(a.Created).getTime() - new Date(b.Created).getTime());
    this.filteredItems = this.guidedVideoList.sort((a, b) => new Date(a.Created).getTime() - new Date(b.Created).getTime());

    this.guidedVideoGridRows = parseInt("" + this.guidedVideoList.length / 3);
    this.guidedVideoGridList = [];
    var listcounter = 0;
    var data = {};
    for (let index = 0; index < this.guidedVideoGridRows; index++) {
      data = {
        "VideoSubmissionId1": parseInt(this.guidedVideoList[listcounter].VideoSubmissionId),
        "Name1": this.guidedVideoList[listcounter].Name,
        "IsClaim1": this.guidedVideoList[listcounter].IsClaim,
        "TeacherVideoClaimsMapId1": this.guidedVideoList[listcounter].TeacherVideoClaimsMapId,
        "LessonId1": this.guidedVideoList[listcounter].LessonId,
        "ClaimStatus1": this.guidedVideoList[listcounter].ClaimStatus,
        "Created1": this.guidedVideoList[listcounter].Created,
        "RowIndex1": this.guidedVideoList[listcounter].rowIndex,
        "VideoUrl1": this.guidedVideoList[listcounter].VideoUrl,
        "UserId1": this.guidedVideoList[listcounter].UserId,
        "VideoSubmissionId2": parseInt(this.guidedVideoList[listcounter + 1].VideoSubmissionId),
        "Name2": this.guidedVideoList[listcounter + 1].Name,
        "IsClaim2": this.guidedVideoList[listcounter + 1].IsClaim,
        "TeacherVideoClaimsMapId2": this.guidedVideoList[listcounter + 1].TeacherVideoClaimsMapId,
        "LessonId2": this.guidedVideoList[listcounter + 1].LessonId,
        "ClaimStatus2": this.guidedVideoList[listcounter + 1].ClaimStatus,
        "Created2": this.guidedVideoList[listcounter + 1].Created,
        "RowIndex2": this.guidedVideoList[listcounter + 1].rowIndex,
        "VideoUrl2": this.guidedVideoList[listcounter + 1].VideoUrl,
        "UserId2": this.guidedVideoList[listcounter + 1].UserId,
        "VideoSubmissionId3": parseInt(this.guidedVideoList[listcounter + 2].VideoSubmissionId),
        "Name3": this.guidedVideoList[listcounter + 2].Name,
        "IsClaim3": this.guidedVideoList[listcounter + 2].IsClaim,
        "TeacherVideoClaimsMapId3": this.guidedVideoList[listcounter + 2].TeacherVideoClaimsMapId,
        "LessonId3": this.guidedVideoList[listcounter + 2].LessonId,
        "ClaimStatus3": this.guidedVideoList[listcounter + 2].ClaimStatus,
        "Created3": this.guidedVideoList[listcounter + 2].Created,
        "RowIndex3": this.guidedVideoList[listcounter + 2].rowIndex,
        "VideoUrl3": this.guidedVideoList[listcounter + 2].VideoUrl,
        "UserId3": this.guidedVideoList[listcounter + 2].UserId,
      }
      this.guidedVideoGridList.push(data);

      for (let i = 0; i < 3; i++) {
        listcounter++;
      }
    }

    this.filteredItemsGrid = this.guidedVideoGridList;

    if (this.guidedVideoGridList.length % 3 != 0) {

      var remainingRecords = this.guidedvideoService.guidedVideoList.length - (this.guidedVideoGridRows * 3);

      if (remainingRecords == 1) {
        data = {
          "VideoSubmissionId1": parseInt(this.guidedVideoList[listcounter].VideoSubmissionId),
          "Name1": this.guidedVideoList[listcounter].Name,
          "IsClaim1": this.guidedVideoList[listcounter].IsClaim,
          "TeacherVideoClaimsMapId1": this.guidedVideoList[listcounter].TeacherVideoClaimsMapId,
          "LessonId1": this.guidedVideoList[listcounter].LessonId,
          "ClaimStatus1": this.guidedVideoList[listcounter].ClaimStatus,
          "Created1": this.guidedVideoList[listcounter].Created,
          "RowIndex1": this.guidedVideoList[listcounter].rowIndex,
          "VideoUrl1": this.guidedVideoList[listcounter].VideoUrl,
          "UserId1": this.guidedVideoList[listcounter].UserId,
        }
      }
      else if (remainingRecords == 2) {
        data = {
          "VideoSubmissionId1": parseInt(this.guidedVideoList[listcounter].VideoSubmissionId),
          "Name1": this.guidedVideoList[listcounter].Name,
          "IsClaim1": this.guidedVideoList[listcounter].IsClaim,
          "TeacherVideoClaimsMapId1": this.guidedVideoList[listcounter].TeacherVideoClaimsMapId,
          "LessonId1": this.guidedVideoList[listcounter].LessonId,
          "ClaimStatus1": this.guidedVideoList[listcounter].ClaimStatus,
          "Created1": this.guidedVideoList[listcounter].Created,
          "RowIndex1": this.guidedVideoList[listcounter].rowIndex,
          "VideoUrl1": this.guidedVideoList[listcounter].VideoUrl,
          "UserId1": this.guidedVideoList[listcounter].UserId,
          "VideoSubmissionId2": parseInt(this.guidedVideoList[listcounter + 1].VideoSubmissionId),
          "Name2": this.guidedVideoList[listcounter + 1].Name,
          "IsClaim2": this.guidedVideoList[listcounter + 1].IsClaim,
          "TeacherVideoClaimsMapId2": this.guidedVideoList[listcounter + 1].TeacherVideoClaimsMapId,
          "LessonId2": this.guidedVideoList[listcounter + 1].LessonId,
          "ClaimStatus2": this.guidedVideoList[listcounter + 1].ClaimStatus,
          "Created2": this.guidedVideoList[listcounter + 1].Created,
          "RowIndex2": this.guidedVideoList[listcounter + 1].rowIndex,
          "VideoUrl2": this.guidedVideoList[listcounter + 1].VideoUrl,
          "UserId2": this.guidedVideoList[listcounter + 1].UserId,
        }
      }
      this.guidedVideoGridList.push(data);
      this.guidedVideoGridRows++;
    }


    this.initList();
    this.initGrid();
    if (this.inputName != "") {
      this.FilterByName();
    }

    if (this.inputName == "") {
      if (this.selectedClaim == 'Claimed') {
        this.isClaimSelected = true;
        this.getClaimedGuidedList(1);
      } else if (this.selectedClaim == 'Unclaimed') {
        this.getClaimedGuidedList(0);
        this.isClaimSelected = false;
      } else {
        this.getClaimedGuidedList(2);
        this.isClaimSelected = false;
      }
    }
  }

  SortByDateAscending() {
    this.selectedDateOrder = 'Newest to Oldest';
    if (this.selectedOrder == 'A-Z') {
      this.guidedVideoList = this.guidedVideoList.sort((x, y) => x.Name > y.Name ? 1 : -1);
    } else {
      this.guidedVideoList = this.guidedVideoList.sort((x, y) => x.Name < y.Name ? 1 : -1);
    }
    this.guidedVideoList = this.guidedVideoList.sort((a, b) => new Date(b.Created).getTime() - new Date(a.Created).getTime());
    this.filteredItems = this.guidedVideoList.sort((a, b) => new Date(b.Created).getTime() - new Date(a.Created).getTime());

    this.guidedVideoGridRows = parseInt("" + this.guidedVideoList.length / 3);
    this.guidedVideoGridList = [];
    var listcounter = 0;
    var data = {};
    for (let index = 0; index < this.guidedVideoGridRows; index++) {
      data = {
        "VideoSubmissionId1": parseInt(this.guidedVideoList[listcounter].VideoSubmissionId),
        "Name1": this.guidedVideoList[listcounter].Name,
        "IsClaim1": this.guidedVideoList[listcounter].IsClaim,
        "TeacherVideoClaimsMapId1": this.guidedVideoList[listcounter].TeacherVideoClaimsMapId,
        "LessonId1": this.guidedVideoList[listcounter].LessonId,
        "ClaimStatus1": this.guidedVideoList[listcounter].ClaimStatus,
        "Created1": this.guidedVideoList[listcounter].Created,
        "RowIndex1": this.guidedVideoList[listcounter].rowIndex,
        "VideoUrl1": this.guidedVideoList[listcounter].VideoUrl,
        "UserId1": this.guidedVideoList[listcounter].UserId,
        "VideoSubmissionId2": parseInt(this.guidedVideoList[listcounter + 1].VideoSubmissionId),
        "Name2": this.guidedVideoList[listcounter + 1].Name,
        "IsClaim2": this.guidedVideoList[listcounter + 1].IsClaim,
        "TeacherVideoClaimsMapId2": this.guidedVideoList[listcounter + 1].TeacherVideoClaimsMapId,
        "LessonId2": this.guidedVideoList[listcounter + 1].LessonId,
        "ClaimStatus2": this.guidedVideoList[listcounter + 1].ClaimStatus,
        "Created2": this.guidedVideoList[listcounter + 1].Created,
        "RowIndex2": this.guidedVideoList[listcounter + 1].rowIndex,
        "VideoUrl2": this.guidedVideoList[listcounter + 1].VideoUrl,
        "UserId2": this.guidedVideoList[listcounter + 1].UserId,
        "VideoSubmissionId3": parseInt(this.guidedVideoList[listcounter + 2].VideoSubmissionId),
        "Name3": this.guidedVideoList[listcounter + 2].Name,
        "IsClaim3": this.guidedVideoList[listcounter + 2].IsClaim,
        "TeacherVideoClaimsMapId3": this.guidedVideoList[listcounter + 2].TeacherVideoClaimsMapId,
        "LessonId3": this.guidedVideoList[listcounter + 2].LessonId,
        "ClaimStatus3": this.guidedVideoList[listcounter + 2].ClaimStatus,
        "Created3": this.guidedVideoList[listcounter + 2].Created,
        "RowIndex3": this.guidedVideoList[listcounter + 2].rowIndex,
        "VideoUrl3": this.guidedVideoList[listcounter + 2].VideoUrl,
        "UserId3": this.guidedVideoList[listcounter + 2].UserId,
      }
      this.guidedVideoGridList.push(data);

      for (let i = 0; i < 3; i++) {
        listcounter++;
      }
    }

    this.filteredItemsGrid = this.guidedVideoGridList;

    if (this.guidedVideoGridList.length % 3 != 0) {

      var remainingRecords = this.guidedvideoService.guidedVideoList.length - (this.guidedVideoGridRows * 3);

      if (remainingRecords == 1) {
        data = {
          "VideoSubmissionId1": parseInt(this.guidedVideoList[listcounter].VideoSubmissionId),
          "Name1": this.guidedVideoList[listcounter].Name,
          "IsClaim1": this.guidedVideoList[listcounter].IsClaim,
          "TeacherVideoClaimsMapId1": this.guidedVideoList[listcounter].TeacherVideoClaimsMapId,
          "LessonId1": this.guidedVideoList[listcounter].LessonId,
          "ClaimStatus1": this.guidedVideoList[listcounter].ClaimStatus,
          "Created1": this.guidedVideoList[listcounter].Created,
          "RowIndex1": this.guidedVideoList[listcounter].rowIndex,
          "VideoUrl1": this.guidedVideoList[listcounter].VideoUrl,
          "UserId1": this.guidedVideoList[listcounter].UserId,
        }
      }
      else if (remainingRecords == 2) {
        data = {
          "VideoSubmissionId1": parseInt(this.guidedVideoList[listcounter].VideoSubmissionId),
          "Name1": this.guidedVideoList[listcounter].Name,
          "IsClaim1": this.guidedVideoList[listcounter].IsClaim,
          "TeacherVideoClaimsMapId1": this.guidedVideoList[listcounter].TeacherVideoClaimsMapId,
          "LessonId1": this.guidedVideoList[listcounter].LessonId,
          "ClaimStatus1": this.guidedVideoList[listcounter].ClaimStatus,
          "Created1": this.guidedVideoList[listcounter].Created,
          "RowIndex1": this.guidedVideoList[listcounter].rowIndex,
          "VideoUrl1": this.guidedVideoList[listcounter].VideoUrl,
          "UserId1": this.guidedVideoList[listcounter].UserId,
          "VideoSubmissionId2": parseInt(this.guidedVideoList[listcounter + 1].VideoSubmissionId),
          "Name2": this.guidedVideoList[listcounter + 1].Name,
          "IsClaim2": this.guidedVideoList[listcounter + 1].IsClaim,
          "TeacherVideoClaimsMapId2": this.guidedVideoList[listcounter + 1].TeacherVideoClaimsMapId,
          "LessonId2": this.guidedVideoList[listcounter + 1].LessonId,
          "ClaimStatus2": this.guidedVideoList[listcounter + 1].ClaimStatus,
          "Created2": this.guidedVideoList[listcounter + 1].Created,
          "RowIndex2": this.guidedVideoList[listcounter + 1].rowIndex,
          "VideoUrl2": this.guidedVideoList[listcounter + 1].VideoUrl,
          "UserId2": this.guidedVideoList[listcounter + 1].UserId,
        }
      }
      this.guidedVideoGridList.push(data);
      this.guidedVideoGridRows++;
    }


    this.initList();
    this.initGrid();
    if (this.inputName != "") {
      this.FilterByName();
    }

    if (this.inputName == "") {
      if (this.selectedClaim == 'Claimed') {
        this.isClaimSelected = true;
        this.getClaimedGuidedList(1);
      } else if (this.selectedClaim == 'Unclaimed') {
        this.isClaimSelected = false;
        this.getClaimedGuidedList(0);
      } else {
        this.isClaimSelected = false;
        this.getClaimedGuidedList(2);
      }
    }
  }

  refreshList() {
    this.currentIndexBeforeClaimList = this.currentIndex;
    this.currentIndexBeforeClaimGrid = this.currentIndexGrid;
    this.guidedvideoService.getGuidedVideoList().subscribe((response: any) => {
      response.forEach(element => {
        element.Created = moment(element.Created).format('M/DD/YYYY h:mm A');
      });

      this.guidedvideoService.guidedVideoList = response;
      debugger;
      this.guidedVideoList = this.guidedvideoService.guidedVideoList;

      if (this.selectedOrder == 'A-Z') {
        this.guidedVideoList = this.guidedVideoList.sort((x, y) => x.Name > y.Name ? 1 : -1);
      } else {
        this.guidedVideoList = this.guidedVideoList.sort((x, y) => x.Name < y.Name ? 1 : -1);
      }

      if (this.selectedDateOrder == 'Oldest to Newest') {
        this.guidedVideoList = this.guidedVideoList.sort((a, b) => new Date(a.Created).getTime() - new Date(b.Created).getTime());
      } else {
        this.guidedVideoList = this.guidedVideoList.sort((a, b) => new Date(b.Created).getTime() - new Date(a.Created).getTime());
      }

      this.filteredItems = this.guidedVideoList;

      this.guidedVideoGridRows = parseInt("" + this.guidedVideoList.length / 3);
      this.guidedVideoGridList = [];
      var listcounter = 0;
      var data = {};
      for (let index = 0; index < this.guidedVideoGridRows; index++) {
        data = {
          "VideoSubmissionId1": parseInt(this.guidedVideoList[listcounter].VideoSubmissionId),
          "Name1": this.guidedVideoList[listcounter].Name,
          "IsClaim1": this.guidedVideoList[listcounter].IsClaim,
          "TeacherVideoClaimsMapId1": this.guidedVideoList[listcounter].TeacherVideoClaimsMapId,
          "LessonId1": this.guidedVideoList[listcounter].LessonId,
          "ClaimStatus1": this.guidedVideoList[listcounter].ClaimStatus,
          "Created1": this.guidedVideoList[listcounter].Created,
          "RowIndex1": this.guidedVideoList[listcounter].rowIndex,
          "VideoUrl1": this.guidedVideoList[listcounter].VideoUrl,
          "UserId1": this.guidedVideoList[listcounter].UserId,
          "VideoSubmissionId2": parseInt(this.guidedVideoList[listcounter + 1].VideoSubmissionId),
          "Name2": this.guidedVideoList[listcounter + 1].Name,
          "IsClaim2": this.guidedVideoList[listcounter + 1].IsClaim,
          "TeacherVideoClaimsMapId2": this.guidedVideoList[listcounter + 1].TeacherVideoClaimsMapId,
          "LessonId2": this.guidedVideoList[listcounter + 1].LessonId,
          "ClaimStatus2": this.guidedVideoList[listcounter + 1].ClaimStatus,
          "Created2": this.guidedVideoList[listcounter + 1].Created,
          "RowIndex2": this.guidedVideoList[listcounter + 1].rowIndex,
          "VideoUrl2": this.guidedVideoList[listcounter + 1].VideoUrl,
          "UserId2": this.guidedVideoList[listcounter + 1].UserId,
          "VideoSubmissionId3": parseInt(this.guidedVideoList[listcounter + 2].VideoSubmissionId),
          "Name3": this.guidedVideoList[listcounter + 2].Name,
          "IsClaim3": this.guidedVideoList[listcounter + 2].IsClaim,
          "TeacherVideoClaimsMapId3": this.guidedVideoList[listcounter + 2].TeacherVideoClaimsMapId,
          "LessonId3": this.guidedVideoList[listcounter + 2].LessonId,
          "ClaimStatus3": this.guidedVideoList[listcounter + 2].ClaimStatus,
          "Created3": this.guidedVideoList[listcounter + 2].Created,
          "RowIndex3": this.guidedVideoList[listcounter + 2].rowIndex,
          "VideoUrl3": this.guidedVideoList[listcounter + 2].VideoUrl,
          "UserId3": this.guidedVideoList[listcounter + 2].UserId,
        }
        this.guidedVideoGridList.push(data);

        for (let i = 0; i < 3; i++) {
          listcounter++;
        }
      }

      this.filteredItemsGrid = this.guidedVideoGridList;

      if (this.guidedVideoGridList.length % 3 != 0) {

        var remainingRecords = this.guidedvideoService.guidedVideoList.length - (this.guidedVideoGridRows * 3);

        if (remainingRecords == 1) {
          data = {
            "VideoSubmissionId1": parseInt(this.guidedVideoList[listcounter].VideoSubmissionId),
            "Name1": this.guidedVideoList[listcounter].Name,
            "IsClaim1": this.guidedVideoList[listcounter].IsClaim,
            "TeacherVideoClaimsMapId1": this.guidedVideoList[listcounter].TeacherVideoClaimsMapId,
            "LessonId1": this.guidedVideoList[listcounter].LessonId,
            "ClaimStatus1": this.guidedVideoList[listcounter].ClaimStatus,
            "Created1": this.guidedVideoList[listcounter].Created,
            "RowIndex1": this.guidedVideoList[listcounter].rowIndex,
            "VideoUrl1": this.guidedVideoList[listcounter].VideoUrl,
            "UserId1": this.guidedVideoList[listcounter].UserId,
          }
        }
        else if (remainingRecords == 2) {
          data = {
            "VideoSubmissionId1": parseInt(this.guidedVideoList[listcounter].VideoSubmissionId),
            "Name1": this.guidedVideoList[listcounter].Name,
            "IsClaim1": this.guidedVideoList[listcounter].IsClaim,
            "TeacherVideoClaimsMapId1": this.guidedVideoList[listcounter].TeacherVideoClaimsMapId,
            "LessonId1": this.guidedVideoList[listcounter].LessonId,
            "ClaimStatus1": this.guidedVideoList[listcounter].ClaimStatus,
            "Created1": this.guidedVideoList[listcounter].Created,
            "RowIndex1": this.guidedVideoList[listcounter].rowIndex,
            "VideoUrl1": this.guidedVideoList[listcounter].VideoUrl,
            "UserId1": this.guidedVideoList[listcounter].UserId,
            "VideoSubmissionId2": parseInt(this.guidedVideoList[listcounter + 1].VideoSubmissionId),
            "Name2": this.guidedVideoList[listcounter + 1].Name,
            "IsClaim2": this.guidedVideoList[listcounter + 1].IsClaim,
            "TeacherVideoClaimsMapId2": this.guidedVideoList[listcounter + 1].TeacherVideoClaimsMapId,
            "LessonId2": this.guidedVideoList[listcounter + 1].LessonId,
            "ClaimStatus2": this.guidedVideoList[listcounter + 1].ClaimStatus,
            "Created2": this.guidedVideoList[listcounter + 1].Created,
            "RowIndex2": this.guidedVideoList[listcounter + 1].rowIndex,
            "VideoUrl2": this.guidedVideoList[listcounter + 1].VideoUrl,
            "UserId2": this.guidedVideoList[listcounter + 1].UserId,
          }
        }
        this.guidedVideoGridList.push(data);
        this.guidedVideoGridRows++;
      }

      //this.initList();
      //this.initGrid();
      if (this.inputName != "") {
        this.FilterByName();
      }

      if (this.inputName == "") {
        if (this.selectedClaim == 'Claimed') {
          this.isClaimSelected = true;
          this.getClaimedGuidedList(1);
        } else if (this.selectedClaim == 'Unclaimed') {
          this.isClaimSelected = false;
          this.getClaimedGuidedList(0);
        } else {
          this.isClaimSelected = false;
          this.getClaimedGuidedList(2);
        }
      }

      if (this.isListView == true) {
        this.currentIndex = this.currentIndexBeforeClaimList;
        this.refreshItems();
      } else {
        this.currentIndex = this.currentIndexBeforeClaimGrid;
        this.refreshItemsGrid();
      }
    });
  }

  SortByClaim(claimStatus) {
    this.selectedClaimStatus = claimStatus;
    var claimdata;
    if (claimStatus == 'All') {
      claimdata = this.guidedvideoService.guidedVideoList.filter(x => x.IsClaim == true);
    }
    else if (claimStatus == 'New') {
      claimdata = this.guidedvideoService.guidedVideoList.filter(x => x.IsClaim == true && x.ClaimStatus == 1 && x.LessonId == 0);
    }
    else if (claimStatus == 'Viewed') {
      claimdata = this.guidedvideoService.guidedVideoList.filter(x => x.IsClaim == true && x.ClaimStatus == 1 && x.LessonId != 0);
    }
    else if (claimStatus == 'Completed') {
      claimdata = this.guidedvideoService.guidedVideoList.filter(x => x.IsClaim == true && x.ClaimStatus == 2);
    }


    if (this.selectedOrder == 'A-Z') {
      claimdata = claimdata.sort((x, y) => x.Name > y.Name ? 1 : -1);
    } else {
      claimdata = claimdata.sort((x, y) => x.Name < y.Name ? 1 : -1);
    }

    if (this.selectedDateOrder == 'Oldest to Newest') {
      claimdata = claimdata.sort((a, b) => new Date(a.Created).getTime() - new Date(b.Created).getTime());
    } else {
      claimdata = claimdata.sort((a, b) => new Date(b.Created).getTime() - new Date(a.Created).getTime());
    }

    this.filteredItems = [];

    if (this.inputName != "") {
      claimdata.forEach(element => {
        if (element.Name.toUpperCase().includes(this.inputName.toUpperCase()) || element.Country.toUpperCase().includes(this.inputName.toUpperCase())
          || element.PostalCode.toUpperCase().includes(this.inputName.toUpperCase())) {
          this.filteredItems.push(element);
        }
      });
    } else {
      this.filteredItems = claimdata;
    }

    this.guidedVideoGridRows = parseInt("" + this.filteredItems.length / 3);
    this.guidedVideoGridList = [];
    var listcounter = 0;
    var data = {};
    for (let index = 0; index < this.guidedVideoGridRows; index++) {
      data = {
        "VideoSubmissionId1": parseInt(this.filteredItems[listcounter].VideoSubmissionId),
        "Name1": this.filteredItems[listcounter].Name,
        "IsClaim1": this.filteredItems[listcounter].IsClaim,
        "TeacherVideoClaimsMapId1": this.filteredItems[listcounter].TeacherVideoClaimsMapId,
        "LessonId1": this.filteredItems[listcounter].LessonId,
        "ClaimStatus1": this.filteredItems[listcounter].ClaimStatus,
        "Created1": this.filteredItems[listcounter].Created,
        "RowIndex1": this.filteredItems[listcounter].rowIndex,
        "VideoUrl1": this.filteredItems[listcounter].VideoUrl,
        "UserId1": this.filteredItems[listcounter].UserId,
        "VideoSubmissionId2": parseInt(this.filteredItems[listcounter + 1].VideoSubmissionId),
        "Name2": this.filteredItems[listcounter + 1].Name,
        "IsClaim2": this.filteredItems[listcounter + 1].IsClaim,
        "TeacherVideoClaimsMapId2": this.filteredItems[listcounter + 1].TeacherVideoClaimsMapId,
        "LessonId2": this.filteredItems[listcounter + 1].LessonId,
        "ClaimStatus2": this.filteredItems[listcounter + 1].ClaimStatus,
        "Created2": this.filteredItems[listcounter + 1].Created,
        "RowIndex2": this.filteredItems[listcounter + 1].rowIndex,
        "VideoUrl2": this.filteredItems[listcounter + 1].VideoUrl,
        "UserId2": this.filteredItems[listcounter + 1].UserId,
        "VideoSubmissionId3": parseInt(this.filteredItems[listcounter + 2].VideoSubmissionId),
        "Name3": this.filteredItems[listcounter + 2].Name,
        "IsClaim3": this.filteredItems[listcounter + 2].IsClaim,
        "TeacherVideoClaimsMapId3": this.filteredItems[listcounter + 2].TeacherVideoClaimsMapId,
        "LessonId3": this.filteredItems[listcounter + 2].LessonId,
        "ClaimStatus3": this.filteredItems[listcounter + 2].ClaimStatus,
        "Created3": this.filteredItems[listcounter + 2].Created,
        "RowIndex3": this.filteredItems[listcounter + 2].rowIndex,
        "VideoUrl3": this.filteredItems[listcounter + 2].VideoUrl,
        "UserId3": this.filteredItems[listcounter + 2].UserId,
      }
      this.guidedVideoGridList.push(data);

      for (let i = 0; i < 3; i++) {
        listcounter++;
      }
    }

    this.filteredItemsGrid = this.guidedVideoGridList;

    if (this.filteredItems % 3 != 0) {

      var remainingRecords = this.filteredItems.length - (this.guidedVideoGridRows * 3);

      if (remainingRecords == 1) {
        data = {
          "VideoSubmissionId1": parseInt(this.filteredItems[listcounter].VideoSubmissionId),
          "Name1": this.filteredItems[listcounter].Name,
          "IsClaim1": this.filteredItems[listcounter].IsClaim,
          "TeacherVideoClaimsMapId1": this.filteredItems[listcounter].TeacherVideoClaimsMapId,
          "LessonId1": this.filteredItems[listcounter].LessonId,
          "ClaimStatus1": this.filteredItems[listcounter].ClaimStatus,
          "Created1": this.filteredItems[listcounter].Created,
          "RowIndex": this.filteredItems[listcounter].rowIndex,
          "VideoUrl": this.filteredItems[listcounter].VideoUrl,
          "UserId1": this.filteredItems[listcounter].UserId,
        }
        this.guidedVideoGridList.push(data);
        this.guidedVideoGridRows++;
      }
      else if (remainingRecords == 2) {
        data = {
          "VideoSubmissionId1": parseInt(this.filteredItems[listcounter].VideoSubmissionId),
          "Name1": this.filteredItems[listcounter].Name,
          "IsClaim1": this.filteredItems[listcounter].IsClaim,
          "TeacherVideoClaimsMapId1": this.filteredItems[listcounter].TeacherVideoClaimsMapId,
          "LessonId1": this.filteredItems[listcounter].LessonId,
          "ClaimStatus1": this.filteredItems[listcounter].ClaimStatus,
          "Created1": this.filteredItems[listcounter].Created,
          "RowIndex1": this.filteredItems[listcounter].rowIndex,
          "VideoUrl1": this.filteredItems[listcounter].VideoUrl,
          "UserId1": this.filteredItems[listcounter].UserId,
          "VideoSubmissionId2": parseInt(this.filteredItems[listcounter + 1].VideoSubmissionId),
          "Name2": this.filteredItems[listcounter + 1].Name,
          "IsClaim2": this.filteredItems[listcounter + 1].IsClaim,
          "TeacherVideoClaimsMapId2": this.filteredItems[listcounter + 1].TeacherVideoClaimsMapId,
          "LessonId2": this.filteredItems[listcounter + 1].LessonId,
          "ClaimStatus2": this.filteredItems[listcounter + 1].ClaimStatus,
          "Created2": this.filteredItems[listcounter + 1].Created,
          "RowIndex2": this.filteredItems[listcounter + 1].rowIndex,
          "VideoUrl2": this.filteredItems[listcounter + 1].VideoUrl,
          "UserId2": this.filteredItems[listcounter + 1].UserId,
        }
        this.guidedVideoGridList.push(data);
        this.guidedVideoGridRows++;
      }
    }

    this.initList();
    this.initGrid();

  }
}
