import { Component, Input, OnDestroy, NgZone, OnInit, AfterViewChecked, trigger, state, style, transition, animate } from '@angular/core';
import { Node } from './node';
import { SharedlibraryService } from '../../services/sharedlibrary.service';
import { CommonService } from '../../common/common.service';
import { DragLessonDialogComponent } from '../drag-lesson-dialog/drag-lesson-dialog.component';
import { MatDialog } from '../../../../node_modules/@angular/material';
import { HttpParams } from '@angular/common/http';
import { CrudService } from '../../services/crud.service';
import { LobbyService } from '../../services/lobby.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';

declare var VoiceLessons: any;
declare var VoiceLessonsExercisePlayer: any;
declare var VoiceLessonsExercisePlayer: any;
declare var LivePlayer: any;
declare var VoicelessonsVideoPlayer: any;
declare var VoicelessonsGuidedVideoPlayer: any;
@Component({
    selector: 'tree-view',
    templateUrl: './tree-view.html',
    animations: [
        trigger('animateState', [
            state('active', style({
                //backgroundColor: '#741175'
                backgroundColor: '#1c1d1f'
            })),
            // state('inactive', style({
            //     backgroundColor: '#741175'
            // })),
            transition('* => *', animate(1500))
        ])
    ]
})

export class TreeView implements OnInit, OnDestroy, AfterViewChecked {
    songsData: any[];
    @Input() nodes: Array<Node>;
    expanded = true;
    zone: string;
    uniqueId: string;
    counter = 0;
    parentNode: Array<Node> = [];
    lessonQueue: string = null;
    currentSongNo: any;
    childNode: Array<Node>;
    isChildAdded = false;
    isPlayerStarted = false;
    currentItemGuid = '';
    isVideoConnectedPage = false;
    EditLesson: String = "";
    isItemDragged: boolean = false;
    window: any;
    isGuidedvideofeedbackPage: boolean = false;
    isStudentVideoConnectedPage: boolean = false;
    dragEnabled: boolean = true;
    userType: string = '';

    constructor(private sharedLibrary: SharedlibraryService, public dialog: MatDialog, private lobbyService: LobbyService,
        public toastr: ToastrService, private crudService: CrudService, private _ngZone: NgZone, private activatedRoute: ActivatedRoute) {

    }

    ngAfterViewChecked(): void {
        this.initTreeViewCallbackEvents();
    }

    ngOnInit(): void {
        this.userType = localStorage.getItem('UserType');
        this.isStudentVideoConnectedPage = window.location.hash.includes('student/videoConnected');
        this.dragEnabled = !window.location.hash.includes('student/videoConnected');
        if (window.location.hash.includes('student/guidedvideofeedback')) {
            this.isGuidedvideofeedbackPage = true;
            this.isVideoConnectedPage = false;
            return;
        }
        // ====== Put here all constructor code ====
        if (CommonService.isEditLessonQueueLoaded == false && localStorage.getItem('EditLesson') != null && localStorage.getItem('EditLesson') != "") {
            this.sharedLibrary.LessonModel = JSON.parse(localStorage.getItem('EditLesson'));
            if (this.sharedLibrary.LessonModel.LessonId != 0) {
                this.getEditLessonQueue();
                CommonService.isEditLessonQueueLoaded = true;
            } else {
                this.nodes = [];
                this.nodes.push(new Node(CommonService.getGuid(), CommonService.getGuid(), 'Drag Here!...', null, null, null, null, null, null, null, null, null, null, null, null, null, null, [], null, null));
                CommonService.parentNodeList = this.nodes;
                CommonService.isEditLessonQueueLoaded = true;
            }
        }
        else//------------------unschedule Lesson-------------------------------------------------------------
        {
            if (this.sharedLibrary.location === null) {
                var location = window.location.href;
                var lastslashindex = location.lastIndexOf('/');
                this.sharedLibrary.location = location.substring(lastslashindex + 1);
            }
            if (CommonService.isEditLessonQueueLoaded === false && (this.sharedLibrary.location.toLocaleLowerCase() === 'videoconnected' || this.sharedLibrary.location.toLocaleLowerCase() === 'mobile-player')) {
                this.getLessonByLessonGuid();
                CommonService.isEditLessonQueueLoaded = true;
            }
        }
        // ====== End here all constructor code ====

        if (localStorage.getItem('EditLesson') != null && localStorage.getItem('EditLesson') != "" &&
            localStorage.getItem('EditLesson') != undefined) {
            var location = window.location.href;
            var lastslashindex = location.lastIndexOf('/');
            this.sharedLibrary.location = location.substring(lastslashindex + 1);
        }
        else {
            this.sharedLibrary.initialiseLessonModel();
            var location = window.location.href;
            var lastslashindex = location.lastIndexOf('/');
            this.sharedLibrary.location = location.substring(lastslashindex + 1);
            if (this.sharedLibrary.location != null) {
                if (this.sharedLibrary.location.toLocaleLowerCase() == 'videoconnected' || this.sharedLibrary.location.toLocaleLowerCase() == 'mobile-player') {
                    //this.isVideoConnectedPage = true;
                    if (CommonService.parentNodeList == undefined) {
                        if (localStorage.getItem('userRole') == 'Teacher') {
                            this.getLessonQueue();
                        }
                        else if (localStorage.getItem('userRole') == 'Student') {
                            this.getLessonQueue();
                        }
                    }
                }
                else {
                    if (CommonService.parentNodeList == undefined) {
                        this.nodes = [];
                        this.nodes.push(new Node(CommonService.getGuid(), CommonService.getGuid(), 'Drag Here!...', null, null, null, null, null, null, null, null, null, null, null, null, null, null, [], null, null));
                        CommonService.parentNodeList = this.nodes;
                    }
                }
            }
        }
        if (this.sharedLibrary.location.toLocaleLowerCase() == 'videoconnected' || this.sharedLibrary.location.toLocaleLowerCase() == 'mobile-player')
            this.isVideoConnectedPage = true;
    }

    ngOnDestroy(): void {
        CommonService.isPlayerStarted = false;
        this.sharedLibrary.AdvanceSettingExerciseId = 0;
    }

    onDragEnter($event: any) {
        $($event.mouseEvent.target).parent('li').addClass('treeView-drag-over');
    }

    onDragLeave($event: any) {
        $($event.mouseEvent.target).parent('li').removeClass('treeView-drag-over');
    }

    getLessonByLessonGuid() {
        var LessonGuid = localStorage.getItem('LessonGuid');
        if (LessonGuid != null && LessonGuid != "") {
            this.crudService.get('/lesson/GetLessonDetailsByLessonGuid?lessonGuid=' + LessonGuid, null).subscribe((response: any) => {
                this.sharedLibrary.LessonModel = response;
                // this.sharedLibrary.LessonModel.LessonId = response.LessonId;
                this.addLiveLessonQueue(response.LessonQueue);
                localStorage.setItem('EditLesson', JSON.stringify(this.sharedLibrary.LessonModel));
            });
        }
    }

    openDialog(): void {
        const dialogRef = this.dialog.open(DragLessonDialogComponent, {});
        dialogRef.afterClosed().subscribe(result => { })
    }

    addTo($event: any, parentNode) {
        $('.treeView-drag-over').toArray().forEach(element => {
            $(element).removeClass('treeView-drag-over');
        });
        let itemGuid = CommonService.getGuid();
        this.isChildAdded = false;
        var nodeLength = this.nodes.length;
        if ($event.dragData.FilterType == 'Lesson') {
            this.sharedLibrary.event = $event;
            if (this.nodes[0].LabelName == 'Drag Here!...') {
                if ($event.dragData.LessonQueue != '') {
                    var json = JSON.parse($event.dragData.LessonQueue);
                    this.addLessonNodes(json, nodeLength, 'bottom', false);
                    this.updateLesson();
                }
            }
            else {
                this.openDragLessonPopUp($event);
            }
        }
        else {
            this.nodes.push(new Node($event.dragData.SongId, itemGuid, $event.dragData.LabelName, $event.dragData.Artist, $event.dragData.VideoUrl, $event.dragData.AudioFile, $event.dragData.JumpPoints, $event.dragData.FilterType, $event.dragData.CreatedByUserId, false, $event.dragData.NoteflightScoreID, $event.dragData.Lyrics, $event.dragData.TransLations, $event.dragData.LessonQueue, $event.dragData.Midi, $event.dragData.IsTeacherPlayed, $event.dragData.IsStudentPlayed, [], $event.dragData.TeacherItemName, $event.dragData.StudentItemName))
            for (let index = 0; index < nodeLength; index++) {
                if (this.nodes[0].LabelName == 'Drag Here!...') {
                    this.nodes.splice(index, 1);
                    break;
                }
            }
            if (this.sharedLibrary.libraryNodes == undefined || this.sharedLibrary.libraryNodes.length == 0) {
                this.sharedLibrary.libraryNodes = this.nodes;
                this.sharedLibrary.libraryHistoryNodes = this.nodes;
            }
            this.updateLesson();
            CommonService.parentNodeList = this.sharedLibrary.libraryNodes;
        }
        if (this.sharedLibrary.location != null) {
            if (localStorage.getItem('userRole') == 'Teacher' && (this.sharedLibrary.location.toLocaleLowerCase() == 'videoconnected' || this.sharedLibrary.location.toLocaleLowerCase() == 'mobile-player')) {
                LivePlayer.sendLessonQueueObject(this.sharedLibrary.libraryNodes);
            }
        }
        if ($event.dragData.FilterType != 'Lesson') {
            setTimeout(() => {
                $('#customScroll').mCustomScrollbar('scrollTo', $('#div_' + itemGuid)[0].offsetTop);
                $('#div_' + itemGuid).animate({
                    backgroundColor: "#ff159b"
                }, 2000);

                setTimeout(() => {
                    $('#div_' + itemGuid).animate({
                        backgroundColor: "#1c1d1f"
                    }, 2000);
                }, 2000);

            }, 10);
        }
    }

    dropToChild(itemGuid) {
        LivePlayer.sendLessonQueueObject(this.sharedLibrary.libraryNodes);
        setTimeout(() => {
            $('#customScroll').mCustomScrollbar('scrollTo', $('#div_' + itemGuid)[0].offsetTop);
            $('#div_' + itemGuid).animate({
                backgroundColor: "#ff159b"
            }, 2000);

            setTimeout(() => {
                $('#div_' + itemGuid).animate({
                    backgroundColor: "#1c1d1f"
                }, 2000);
            }, 2000);

        }, 10);
        this.updateLesson();
    }

    updateLesson() {
        if (this.activatedRoute.snapshot.routeConfig.path.includes('student/guidedvideofeedback'))
            return;
        this.updateLessonWithToasterToggle(true);
    }

    updateLessonWithToasterToggle(showToaster) {
        if (this.sharedLibrary.LessonModel.LessonId != 0) {
            for (let index = 0; index < this.sharedLibrary.libraryNodes.length; index++) {
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

            this.sharedLibrary.LessonModel.LessonHistory = JSON.stringify(this.sharedLibrary.libraryHistoryNodes);
            this.sharedLibrary.LessonModel.IsLessonQueueChange = true;
            if (this.sharedLibrary.LessonModel.Tags == null) {
                this.sharedLibrary.LessonModel.Tags = "";
            }
            this.sharedLibrary.post('/lesson/UpsertLesson', this.sharedLibrary.LessonModel, new HttpParams()).subscribe((response: any) => {
                this.sharedLibrary.LessonModel = response;
                localStorage.setItem('EditLesson', JSON.stringify(this.sharedLibrary.LessonModel));
                if (response.LessonQueue == "") {
                    this.addLiveLessonQueue(response.LessonQueue);
                }
                if (this.sharedLibrary.location != null) {
                    //if (this.sharedLibrary.location.toLocaleLowerCase() != 'videoconnected') {
                    if (showToaster) this.toastr.success("Lesson Queue updated successfully.");
                    //}
                    this.sharedLibrary.LessonModel.IsLessonQueueChange = false;
                }
            });
        }
        else {
            for (let index = 0; index < this.sharedLibrary.libraryNodes.length; index++) {
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
            this.sharedLibrary.LessonModel.LessonHistory = JSON.stringify(this.sharedLibrary.libraryHistoryNodes);
            if (showToaster) this.toastr.success("Lesson Queue updated successfully.");
            localStorage.setItem('EditLesson', JSON.stringify(this.sharedLibrary.LessonModel));
            // this.addLiveLessonQueue(this.sharedLibrary.LessonModel.LessonQueue);
        }
    }

    updateLessonHistory() {        
        if (this.sharedLibrary.LessonModel.LessonId != 0) {
            let lessonHistory = {
                'LessonId': this.sharedLibrary.LessonModel.LessonId,
                'LessonHistoryQueue': JSON.stringify(this.sharedLibrary.libraryHistoryNodes),
            }
            this.sharedLibrary.post('/lesson/UpdateLessonHistory', lessonHistory, new HttpParams()).subscribe((response: any) => {                
                this.toastr.success("Lesson Queue updated successfully.");
            });
        }
    }

    openDragLessonPopUp(event) {
        const dialogRef = this.dialog.open(DragLessonDialogComponent, {});
    }

    LessonAddPosition(position, isPopUp = false) {
        this.nodes = this.sharedLibrary.libraryNodes;
        var nodeLength = this.nodes.length;
        if (this.sharedLibrary.event.dragData.LessonQueue != '') {
            var json = JSON.parse(this.sharedLibrary.event.dragData.LessonQueue);
            this.addLessonNodes(json, nodeLength, position, isPopUp);
            this.updateLesson();
        }
        if (localStorage.getItem('userRole') == 'Teacher' && this.sharedLibrary.location.toLocaleLowerCase() == 'videoconnected') {
            LivePlayer.sendLessonQueueObject(this.sharedLibrary.libraryNodes);
        }
    }

    addLessonNodes(nodedata, nodeLength, position, isPopUp) {
        var nodelist: any;
        var counter = 0;
        nodelist = this.convertLessonToNodes(nodedata);
        if (position == 'bottom') {
            for (let index = 0; index < nodeLength; index++) {
                if (this.nodes[0].LabelName == 'Drag Here!...') {
                    this.nodes.splice(index, 1);
                    break;
                }
            }
        }
        else {
            if (nodeLength > 0) {
                while (nodeLength--) {
                    this.nodes.splice(nodeLength, 1);
                }
            }
        }
        for (var i = 0; i < nodelist.length; i++) {
            if (!this.isChildAdded) {
                //if (!isPopUp)       
                /* setTimeout(() => {
                    let itemGuid = CommonService.getGuid();
                    $('#customScroll').mCustomScrollbar('scrollTo', $('#div_' + itemGuid)[0].offsetTop);
                    $('#div_' + itemGuid).animate({
                        backgroundColor: "#ff159b"
                    }, 2000);

                    setTimeout(() => {
                        $('#div_' + itemGuid).animate({
                            backgroundColor: "#1c1d1f"
                        }, 2000);
                    }, 2000);
                }, 10); */
                this.nodes.push(new Node(nodelist[i].SongId, CommonService.getGuid(), nodelist[i].LabelName, nodelist[i].Artist, nodelist[i].VideoUrl, nodelist[i].AudioFile, nodelist[i].JumpPoints, nodelist[i].FilterType, nodelist[i].CreatedByUserId, false, nodelist[i].NoteflightScoreID, nodelist[0].Lyrics, nodelist[i].TransLations, nodelist[i].LessonQueue, nodelist[i].Midi, nodelist[i].IsTeacherPlayed, nodelist[i].IsStudentPlayed, nodelist[i].nodes, nodelist[i].TeacherItemName, nodelist[i].StudentItemName));
            }
            else {
                CommonService.currentParentNodeList.push(new Node(nodelist[i].SongId, CommonService.getGuid(), nodelist[i].LabelName, nodelist[i].Artist, nodelist[i].VideoUrl, nodelist[i].AudioFile, nodelist[i].JumpPoints, nodelist[i].FilterType, nodelist[i].CreatedByUserId, false, nodelist[i].NoteflightScoreID, nodelist[0].Lyrics, nodelist[i].TransLations, nodelist[i].LessonQueue, nodelist[i].Midi, nodelist[i].IsTeacherPlayed, nodelist[i].IsStudentPlayed, nodelist[i].nodes, nodelist[i].TeacherItemName, nodelist[i].StudentItemName));
            }
        }
        this.sharedLibrary.libraryNodes = this.nodes;
        this.sharedLibrary.libraryHistoryNodes = this.nodes;
        CommonService.currentParentNodeList = this.nodes;
        CommonService.parentNodeList = this.sharedLibrary.libraryNodes;
        //this.updateLesson();
        if (isPopUp)
            this.nodes = CommonService.currentParentNodeList;
    }

    lessonQueueCallback(lessonQueueJsonObject) {
        var arrayNodeList: any[] = lessonQueueJsonObject;
        var nodelist = this.lessonQueueFromJsonNodes(arrayNodeList);
        this.nodes = null;
        this.nodes = nodelist;
        CommonService.parentNodeList = nodelist;
    }

    sequencerCmdSEC3Callback(keyBoardExceriseData) {
        var exceriseData = '{"name":"Keys-Exercise","LivePlay":true,"data":';
        var JsonData = JSON.stringify(keyBoardExceriseData);
        exceriseData += JsonData + '}';
        var exceriseItem = new Node(CommonService.getGuid(), CommonService.getGuid(), 'Keys-Exercise', null, null, null, null, 'Exercise', null, false, null, null, null, null, exceriseData, null, null, [], null, null);
        this.nodes.push(exceriseItem);

        if (this.nodes.length == 2 && this.nodes[0].LabelName == 'Drag Here!...') {
            this.nodes.splice(0, 1);
        }
        LivePlayer.sendLessonQueueObject(this.sharedLibrary.libraryNodes);

         //MIKE ASK MURLI FOR HELP ON 
        //1) scroll to bottom
        //2) highlight the bar pink

        //need help making this work
        //this.keyboardPlaySong(exceriseItem);

        this.playCurrentSong(exceriseItem);

    }

    sequencerCmdSESCallback(data) {

        VoiceLessonsExercisePlayer.stopMusic(data);

        //debugger;

        var curGuid = localStorage.getItem('currentItemGuid');
        var curItem = this.findCurrentSongItem(curGuid);
        var MidiObj = JSON.parse(curItem.Midi);
        var subArray = MidiObj.sub;
        if (subArray == null) subArray = [];
        subArray.push({ subdata: JSON.stringify(data) });
        MidiObj.sub = subArray;
        curItem.Midi = JSON.stringify(MidiObj);
        this.updateLessonWithToasterToggle(false);

        console.log("$$$$$$ sequencerCmdSACCallback = ", data);
    }

    sequencerCmdSACCallback(data) {

        console.log("$$$$$$ sequencerCmdSACCallback = ",data);
        //debugger;

        /*
        var playList = [];
        var song = {
            'src': data.Midi,
            'jumpPoints': '',
            'tittle': 'Keys-Accompany',
            'label':'Keys-Accompany',
            'played': false,
            'noteFlightId': '',
            'lyrics': '',
            'translation': '',
        }
        playList.push(song);
        var fileType = 'mid';
        VoiceLessons.('#audioPlayer', playList, this.voiceLessonsMusicCallback, 0, fileType);

        $('#excrisePlayer').hide();
        $('#audioPlayer').show();
        */

        
        
        //var songData = '{"name":"Keys-Accompany","LivePlay":false,"data":';
        //var JsonData = JSON.stringify(data);
        //songData += JsonData + '"}';


        var songItem = new Node(CommonService.getGuid(), CommonService.getGuid(), 'Keys-Accompany', null, null, data.Midi, null, 'Song', null, false, null, null, null, null, null, null, null, [], null, null);
        this.nodes.push(songItem);

        if (this.nodes.length == 2 && this.nodes[0].LabelName == 'Drag Here!...') {
            this.nodes.splice(0, 1);
        }
        LivePlayer.sendLessonQueueObject(this.sharedLibrary.libraryNodes);

         //MIKE ASK MURLI FOR HELP ON 
        //1) scroll to bottom
        //2) highlight the bar pink

        //need help making this work
        //this.keyboardPlaySong(exceriseItem);

        this.playCurrentSong(songItem);

    }

    sequencerCmdSETCallback(data) {

        VoiceLessonsExercisePlayer.setTranspose(data);

        //debugger;

        var curGuid = localStorage.getItem('currentItemGuid');
        var curItem = this.findCurrentSongItem(curGuid);
        var MidiObj = JSON.parse(curItem.Midi);
        var subArray = MidiObj.sub;
        if (subArray == null) subArray = [];
        subArray.push({ subdata: JSON.stringify(data) });
        MidiObj.sub = subArray;
        curItem.Midi = JSON.stringify(MidiObj);
        this.updateLessonWithToasterToggle(false);

        console.log("$$$$$$ sequencerCmdSETCallback");
    }

    convertLessonToNodes(songNodes: any): Array<Node> {
        if (songNodes == undefined) return;
        var nodeList = new Array<Node>();
        var parentCounter = 0;
        //Code for Student Video Conneted
        if (window.location.hash.includes('student/videoConnected')) {
            songNodes.forEach(element => {
                nodeList.push(new Node(element.SongId, CommonService.getGuid(), element.LabelName, element.Artist, element.VideoUrl, element.AudioFile, element.JumpPoints, element.FilterType, element.CreatedByUserId, false, element.NoteflightScoreID, element.Lyrics, element.TransLations, element.LessonQueue, element.Midi, element.IsTeacherPlayed, element.IsStudentPlayed, [], element.TeacherItemName, element.StudentItemName));
                if (element.nodes.length != 0) {
                    var childCounter = 0;
                    element.nodes.forEach(childelement => {
                        nodeList.push(new Node(childelement.SongId, CommonService.getGuid(), childelement.LabelName,
                            childelement.Artist, childelement.VideoUrl, childelement.AudioFile, childelement.JumpPoints, childelement.FilterType,
                            childelement.CreatedByUserId, false, childelement.NoteflightScoreID, childelement.Lyrics, childelement.TransLations,
                            childelement.LessonQueue, childelement.Midi, childelement.IsTeacherPlayed, childelement.IsStudentPlayed, [],
                            childelement.TeacherItemName, childelement.StudentItemName));
                        childCounter = childCounter + 1;
                    });
                }
                parentCounter = parentCounter + 1;
            });
        }
        else {
            songNodes.forEach(element => {
                nodeList.push(new Node(element.SongId, CommonService.getGuid(), element.LabelName, element.Artist, element.VideoUrl, element.AudioFile, element.JumpPoints, element.FilterType, element.CreatedByUserId, false, element.NoteflightScoreID, element.Lyrics, element.TransLations, element.LessonQueue, element.Midi, element.IsTeacherPlayed, element.IsStudentPlayed, [], element.TeacherItemName, element.StudentItemName));
                if (element.nodes.length != 0) {
                    var childCounter = 0;
                    element.nodes.forEach(childelement => {
                        nodeList[parentCounter].nodes.push(new Node(childelement.SongId, CommonService.getGuid(), childelement.LabelName,
                            childelement.Artist, childelement.VideoUrl, childelement.AudioFile, childelement.JumpPoints, childelement.FilterType,
                            childelement.CreatedByUserId, false, childelement.NoteflightScoreID, childelement.Lyrics, childelement.TransLations,
                            childelement.LessonQueue, childelement.Midi, childelement.IsTeacherPlayed, childelement.IsStudentPlayed, [],
                            childelement.TeacherItemName, childelement.StudentItemName));
                        childCounter = childCounter + 1;
                    });
                }
                parentCounter = parentCounter + 1;
            });
        }
        return nodeList;
    }

    // Bind Lesson Queue 
    lessonQueueFromJsonNodes(songNodes: any): Array<Node> {
        if (songNodes == undefined) return;
        var nodeList = new Array<Node>();
        var parentCounter = 0;
        songNodes.forEach(element => {
            nodeList.push(new Node(element.SongId, element.Label, element.LabelName, element.Artist, element.VideoUrl, element.AudioFile, element.JumpPoints, element.FilterType, element.CreatedByUserId, false, element.NoteflightScoreID, element.Lyrics, element.TransLations, element.LessonQueue, element.Midi, element.IsTeacherPlayed, element.IsStudentPlayed, [], element.TeacherItemName, element.StudentItemName));
            if (element.nodes.length != 0) {
                var childCounter = 0;
                element.nodes.forEach(childelement => {
                    nodeList[parentCounter].nodes.push(new Node(childelement.SongId, childelement.Label, childelement.LabelName,
                        childelement.Artist, childelement.VideoUrl, childelement.AudioFile, childelement.JumpPoints,
                        childelement.FilterType, childelement.CreatedByUserId, false, childelement.NoteflightScoreID,
                        childelement.Lyrics, childelement.TransLations, childelement.LessonQueue, childelement.Midi,
                        childelement.IsTeacherPlayed, childelement.IsStudentPlayed, [], childelement.TeacherItemName,
                        childelement.StudentItemName));
                    childCounter = childCounter + 1;
                });
            }
            parentCounter = parentCounter + 1;
        });
        return nodeList;
    }

    addLiveLessonQueue(lessonQueue) {
        this.nodes = [];
        this.nodes.push(new Node(CommonService.getGuid(), CommonService.getGuid(), 'Drag Here!...', null, null, null, null, null, null, null, null, null, null, null, null, null, null, [], null, null));
        if (lessonQueue != "" && lessonQueue != null) {
            var json = JSON.parse(lessonQueue);
            this.addLessonNodes(json, 1, 'overwrite', false);
        }
    }
    // take all node.ts code here

    playSong(currentSongNo, NodeList) {
        let option = window.location.hash.includes('teacher/lesson-planner/library') == true ? 'PT' : CommonService.lessonQueuePlayMode;
        VoiceLessons.destoryPlayer();
        VoiceLessonsExercisePlayer.stopMusic();
        $('#videoPlayer').html('');

        if (window.location.hash.includes('student/guidedvideofeedback') || window.location.hash.includes('student/videoConnected')) {
            this.playCurrentSong(NodeList[currentSongNo]);
            return;
        }
        if (this.sharedLibrary.location != null) {
            if (this.sharedLibrary.location.toLocaleLowerCase() == 'videoconnected' || this.sharedLibrary.location.toLocaleLowerCase() == 'videoconnected'
                || this.sharedLibrary.location.toLocaleLowerCase() == 'library') {
                //if (!CommonService.isPlayerStarted)
                LivePlayer.sendLessonQueueObject(this.sharedLibrary.libraryNodes);
                if (option == 'PA') {
                    if (window.location.hash.includes('teacher/videoConnected'))
                        LivePlayer.sendLessonQueueItem(NodeList[currentSongNo].Label);
                    this.playCurrentSong(NodeList[currentSongNo]);
                }
                else if (option == 'PT') {
                    this.playCurrentSong(NodeList[currentSongNo]);
                }
                else if (option == 'PS') {
                    if (window.location.hash.includes('teacher/videoConnected'))
                        LivePlayer.sendLessonQueueItem(NodeList[currentSongNo].Label);
                }
                else if (option == 'SNP') {
                    if (window.location.hash.includes('teacher/videoConnected'))
                        LivePlayer.sendLessonQueueItem(NodeList[currentSongNo].Label + ',' + 'SNP');
                }
                this.currentSongNo = currentSongNo;
                CommonService.isPlayerStarted = true;
                if (localStorage.getItem('userRole') == 'Teacher' && option != 'TP') {
                    this.updateLessonQueueHistory(NodeList[currentSongNo].Label);
                    this.updateLesson();
                }
            }
            else if (localStorage.getItem('userRole') == 'Teacher' && option != 'TP') {
                this.playCurrentSong(NodeList[currentSongNo]);
            }
        }
    }

    trackMediaPlayed(music) {
        try {
            let playedItem = {
                "UserId": CommonService.getUser().UserId,
                "PlayerItemId": music.SongId,
                "ItemType": music.FilterType,
            }
            this.sharedLibrary.post('/lesson/trackMediaPlayed', playedItem, null).subscribe((result: any) => {
            });
        } catch{ }
    }

    playCurrentSong(music, option = null) {
        this.trackMediaPlayed(music);
        //color current playing Item
        if (window.location.hash.includes('/student/videoConnected')) {
            let itemFound = this.isItemExist(music);
            this.setBackgroudColor(itemFound.Label);
        }
        else
            this.setBackgroudColor(music.Label);

        VoiceLessons.destoryPlayer();
        VoiceLessonsExercisePlayer.stopMusic();
        $('#videoPlayer').html('');
        $('#divVideoPlayer').html('');
        $('#divVideoPlayer').hide();
        localStorage.setItem('currentItemGuid', music.Label);
        localStorage.setItem('currentItem', JSON.stringify(music));
        this.sharedLibrary.AdvanceSettingExerciseId = 0;
        if (music == undefined) return;
        var playList = [];

        if (music.FilterType == 'Song') {
            let songTittle = '';
            if (window.location.hash.includes('teacher/videoConnected') || window.location.hash.includes('teacher/lesson-planner/library'))
                songTittle = (music.TeacherItemName != undefined && music.TeacherItemName != null) ? music.TeacherItemName : music.LabelName;
            else if (window.location.hash.includes('student/videoConnected')) {
                songTittle = (music.StudentItemName != undefined && music.StudentItemName != null && music.StudentItemName != '') ?
                    music.StudentItemName : ((music.TeacherItemName != undefined && music.TeacherItemName != null && music.TeacherItemName != '') ?
                        music.TeacherItemName : music.LabelName);
            }
            let song = {
                'src': music.AudioFile,
                'jumpPoints': music.JumpPoints != '' ? JSON.parse(music.JumpPoints) : '',
                'tittle': songTittle,
                'label': music.Label,
                'played': music.Played,
                'noteFlightId': music.NoteflightScoreID,
                'lyrics': music.Lyrics,
                'translation': music.TransLations,
            }
            playList.push(song);
            var fileType = song.src.toString().includes(".mid") == true ? 'mid' : 'song';
            VoiceLessons.AudioPlayer('#audioPlayer', playList, this.voiceLessonsMusicCallback, 0, fileType);
            if (option == 'SNP')
                VoiceLessons.audio.pause();
            $('#videoPlayer').hide();
            $('#excrisePlayer').hide();
            $('#audioPlayer').show();

        }
        else if (music.FilterType == 'Video') {
            $('#videoPlayer').show();
            $('#excrisePlayer').hide();
            $('#audioPlayer').hide();
            let songTittle = (music.TeacherItemName != undefined && music.TeacherItemName != null) ? music.TeacherItemName : music.LabelName;
            if (this.activatedRoute.snapshot.routeConfig.path.includes('videoConnected') || this.activatedRoute.snapshot.routeConfig.path.includes('student/guidedvideofeedback')
                || this.activatedRoute.snapshot.routeConfig.path.includes('teacher/lesson-planner/library'))
                VoicelessonsVideoPlayer.init('#videoPlayer', music.VideoUrl, songTittle, null);
            else
                VoicelessonsGuidedVideoPlayer.init('#videoPlayer', music.VideoUrl, songTittle, null);
        }
        else {
            try {

                $('#excrisePlayer').show();
                $('#audioPlayer').hide();
                $('#videoPlayer').hide();

                if (music.Midi == '' || music.Midi == undefined) return;
                var exceriseObj = JSON.parse(music.Midi);
                exceriseObj.name = (music.TeacherItemName != undefined && music.TeacherItemName != null) ? music.TeacherItemName : music.LabelName;
                var excerisePlayList = "[";
                excerisePlayList += JSON.stringify(exceriseObj) + ',';
                excerisePlayList = excerisePlayList.substr(0, excerisePlayList.length - 1);
                excerisePlayList += "]";
                VoiceLessonsExercisePlayer.initPlayer(excerisePlayList, music.Label, this.exceriseCallback, '#excrisePlayer');
                this.sharedLibrary.AdvanceSettingExerciseId = music.SongId;
                if (option == 'SNP')
                    VoiceLessonsExercisePlayer.stopMusic();
            }
            catch
            {
                let song = {
                    'src': music.Midi,
                    'jumpPoints': music.JumpPoints != '' ? JSON.parse(music.JumpPoints) : '',
                    'tittle': (music.TeacherItemName != undefined && music.TeacherItemName != null) ? music.TeacherItemName : music.LabelName,
                    'label': music.Label,
                    'played': music.Played,
                    'noteFlightId': music.NoteflightScoreID,
                    'lyrics': music.Lyrics,
                    'translation': music.TransLations,
                }
                playList.push(song);
                this.sharedLibrary.AdvanceSettingExerciseId = music.SongId;
                var fileType = song.src.toString().includes(".mid") == true ? 'mid' : 'song';
                VoiceLessons.AudioPlayer('#audioPlayer', playList, this.voiceLessonsMusicCallback, 0, fileType);
                if (option == 'SNP')
                    VoiceLessons.audio.pause();
                $('#videoPlayer').hide();
                $('#excrisePlayer').hide();
                $('#audioPlayer').show();
            }
        }
        if (window.location.hash.includes('student/guidedvideofeedback'))
            $('.playerTrack').hide();
    }

    updateLessonQueueHistory(guid) {
        var isPlayNode = false;
        var parentCounter = 0;
        var i = 0;
        var nodeIteam = null;
        if (CommonService.parentNodeList == undefined)
            return;

        CommonService.parentNodeList.forEach(element => {
            //-----------------Parent Node------------------------------------
            if (isPlayNode == false) {
                if (element.Label == guid) {
                    isPlayNode = true;
                    this.sharedLibrary.libraryHistoryNodes[parentCounter].IsTeacherPlayed = true;
                }
                parentCounter = parentCounter + 1;
            }
        });

        parentCounter = 0;
        //-----------------Child Node----------------------------------------------
        if (isPlayNode == false) {
            CommonService.parentNodeList.forEach(element => {
                if (element.nodes.length != 0 && isPlayNode == false) {
                    var childCounter = 0;
                    element.nodes.forEach(childelement => {
                        if (childelement.Label == guid && isPlayNode == false) {
                            isPlayNode = true;
                            this.sharedLibrary.libraryHistoryNodes[parentCounter].nodes[childCounter].IsTeacherPlayed = true
                        }
                        childCounter = childCounter + 1;
                    });
                }
                parentCounter = parentCounter + 1;
            });
        }
        parentCounter = 0;
    }

    exceriseCallback(itemGuid) {

        //mark the exercise LivePlay as false after the first play
        //debugger;
        var curItem = this.findCurrentSongItem(localStorage.getItem('currentItemGuid'));
        var MidiObj = JSON.parse(curItem.Midi);
        MidiObj.LivePlay = false;
        curItem.Midi = JSON.stringify(MidiObj);
        this.updateLessonWithToasterToggle(false);

        if (window.location.hash.includes('student/guidedvideofeedback')) {
            var nextItem = this.findNextSongItem(itemGuid);
            this.playCurrentSong(nextItem);
        }
        else if (CommonService.autoPlay && localStorage.getItem('userRole') == 'Teacher') {
            var nextItem = this.findNextSongItem(itemGuid);
            LivePlayer.sendLessonQueueItem(nextItem.Label);
            this.playCurrentSong(nextItem);
        }
    }

    voiceLessonsMusicCallback(completedSong) {
        var nextItem = this.findNextSongItem(completedSong.label);
        if (CommonService.autoPlay && this.activatedRoute.snapshot.routeConfig.path.includes('student/guidedvideofeedback')) {
            this.playCurrentSong(nextItem);
            return;
        }
        if (CommonService.autoPlay && localStorage.getItem('userRole') == 'Teacher') {
            if (!window.location.hash.includes('student/guidedvideofeedback')) {
                if (CommonService.lessonQueuePlayMode == 'PA') {
                    LivePlayer.sendLessonQueueItem(nextItem.Label);
                    this.playCurrentSong(nextItem);
                }
                else if (CommonService.lessonQueuePlayMode == 'PT') {
                    this.playCurrentSong(nextItem);
                }
                else if (CommonService.lessonQueuePlayMode == 'PS') {
                    LivePlayer.sendLessonQueueItem(nextItem.Label);
                }
                else if (CommonService.lessonQueuePlayMode == 'SNP') {
                    LivePlayer.sendLessonQueueItem(nextItem.Label + ',' + 'SNP');
                }
            }
        }
        else if (localStorage.getItem('userRole') == 'Student') {
            LivePlayer.sendLessonQueuePlayedItem(nextItem.Label);
        }
    }

    delete(index: number, data: Array<Node>, parentNode) {
        var nextItem = null;
        if (localStorage.getItem('currentItemGuid') == data[index].Label)
            nextItem = this.findNextSongItem(localStorage.getItem('currentItemGuid'));
        if (parentNode.length == 1 && parentNode[0].Label == 'Drag Here!...') {
            parentNode.unshift(new Node(CommonService.getGuid(), CommonService.getGuid(), 'Drag Here!...', null, null, null, null, null, null, null, null, null, null, null, null, null, null, [], null, null));
            data.splice(index + 1, 1);
        }
        else
            data.splice(index, 1);
        if (this.sharedLibrary.libraryNodes.length == 0) {
            data.push(new Node(CommonService.getGuid(), CommonService.getGuid(), 'Drag Here!...', null, null, null, null, null, null, null, null, null, null, null, null, null, null, [], null, null));
            $('#excrisePlayer').hide();
            $('#audioPlayer').hide();

        }
        CommonService.parentNodeList = this.sharedLibrary.libraryNodes;
        if (this.sharedLibrary.location != null) {
            if (localStorage.getItem('userRole') == 'Teacher' && (this.sharedLibrary.location.toLocaleLowerCase() == 'videoconnected' || 
            this.sharedLibrary.location.toLocaleLowerCase() == 'library' )) {
                LivePlayer.sendLessonQueueObject(this.sharedLibrary.libraryNodes);
                //if (VoiceLessons.audio != null && data[0].LabelName != 'Drag Here!...') {
                    if (data[0].LabelName != 'Drag Here!...') {
                    LivePlayer.sendLessonQueueItem(nextItem.Label);
                    this.playCurrentSong(nextItem);
                }
            }
        }
        this.updateLesson();
    }

    add(index: number, currentNode, parentNode) {

        this.isChildAdded = true;
        for (var i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].LabelName == "_emptynode_") {
                this.nodes.splice(i, 1);
                break;
            }
        }
        //currentNode.nodes.unshift(new Node(currentNode.SongId, CommonService.getGuid(), currentNode.LabelName, currentNode.Artist, currentNode.VideoUrl, currentNode.AudioFile, currentNode.JumpPoints, currentNode.FilterType, currentNode.CreatedByUserId, false, currentNode.NoteflightScoreID, currentNode.Lyrics, currentNode.TransLations, currentNode.LessonQueue, currentNode.Midi, currentNode.IsTeacherPlayed, currentNode.IsStudentPlayed, [], currentNode.TeacherItemName, currentNode.StudentItemName));
        currentNode.nodes.unshift(new Node(currentNode.SongId, CommonService.getGuid(), currentNode.LabelName, currentNode.Artist, currentNode.VideoUrl, currentNode.AudioFile, currentNode.JumpPoints, currentNode.FilterType, currentNode.CreatedByUserId, false, currentNode.NoteflightScoreID, currentNode.Lyrics, currentNode.TransLations, currentNode.LessonQueue, currentNode.Midi, false, false, [], currentNode.TeacherItemName, currentNode.StudentItemName));

        CommonService.parentNodeList = parentNode;
        if (this.sharedLibrary.location != null) {
            if (localStorage.getItem('userRole') == 'Teacher' && this.sharedLibrary.location.toLocaleLowerCase() == 'videoconnected') {
                LivePlayer.sendLessonQueueObject(this.sharedLibrary.libraryNodes);
                CommonService.parentNodeList = this.sharedLibrary.libraryNodes;
            }
        }
        this.updateLesson();
    }

    bindLiveLesson() {
        var LessonId = 83
        if (LessonId != null && LessonId != 0) {
            this.crudService.post('/lesson/CopyLesson?lessonId=' + LessonId, null).subscribe((response: any) => {
                this.addLiveLessonQueue(response.LessonQueue);
            });
        }
        CommonService.parentNodeList = [];
    }

    getLessonQueue() {
        var LessonGuid = localStorage.getItem('LessonGuid');
        if (LessonGuid != null && LessonGuid != "") {
            this.crudService.get('/lesson/GetLessonDetailsByLessonGuid?lessonGuid=' + LessonGuid, null).subscribe((response: any) => {
                this.sharedLibrary.LessonModel = response;
                CommonService.isEditLessonQueueLoaded = true;
                this.addLiveLessonQueue(response.LessonQueue);
                localStorage.setItem('EditLesson', JSON.stringify(this.sharedLibrary.LessonModel));
            });
        }
        /*  var LessonId = 83;
         if (LessonId != null && LessonId != 0) {
             this.crudService.get('/lesson/GetLessonDetailsById?lessonId=' + LessonId, null).subscribe((response: any) => {
                 this.sharedLibrary.LessonModel.LessonId = response.LessonId;
                 this.addLiveLessonQueue(response.LessonQueue);
             });
         } */
    }

    getEditLessonQueue() {
        if (this.sharedLibrary.LessonModel.LessonId != null && this.sharedLibrary.LessonModel.LessonId != 0) {
            this.crudService.get('/lesson/GetLessonDetailsById?lessonId=' + this.sharedLibrary.LessonModel.LessonId, null).subscribe((response: any) => {
                this.sharedLibrary.LessonModel = response;
                if (response != null) {
                    if (window.location.hash.includes('student/videoConnected'))
                        this.addLiveLessonQueue(response.LessonHistory);
                    else
                        this.addLiveLessonQueue(response.LessonQueue);
                }
                else {
                    this.nodes = [];
                    this.nodes.push(new Node(CommonService.getGuid(), CommonService.getGuid(), 'Drag Here!...', null, null, null, null, null, null, null, null, null, null, null, null, null, null, [], null, null));
                }
            });
        }
    }


    findNextSongItem(guid): any {
        var i = 0;
        var nodeIteam = null;
        if (CommonService.parentNodeList == undefined)
            return;
        CommonService.parentNodeList.forEach(element => {

            var j = 0
            if (element.Label == guid && element.nodes.length > 0) {
                nodeIteam = element.nodes[j];
            }
            else if (element.Label == guid && element.nodes.length == 0 && (CommonService.parentNodeList.length - 1) == i) {
                nodeIteam = CommonService.parentNodeList[0];
            }
            else if (element.Label == guid && element.nodes.length == 0 && (CommonService.parentNodeList.length - 1) > i) {
                nodeIteam = CommonService.parentNodeList[i + 1];
            }
            else {
                element.nodes.forEach(node => {
                    if (node.Label == guid) {
                        if (element.nodes.length - 1 > j)
                            nodeIteam = element.nodes[j + 1];
                        else if (CommonService.parentNodeList.length - 1 > i)
                            nodeIteam = CommonService.parentNodeList[i + 1];
                        else
                            nodeIteam = CommonService.parentNodeList[0];
                    }
                    j++;
                });
            }
            i++;
        });
        return nodeIteam;
    }

    findPreviousSongItem(guid): any {
        var i = 0;
        var nodeIteam = null;
        if (CommonService.parentNodeList == undefined)
            return;
        CommonService.parentNodeList.forEach(element => {
            var j = 0
            if (element.Label == guid && element.nodes.length > 0) {
                nodeIteam = element.nodes[j];
            }
            else if (element.Label == guid && element.nodes.length == 0 && (CommonService.parentNodeList.length - 1) == i) {
                nodeIteam = CommonService.parentNodeList[0];
            }
            else if (element.Label == guid && element.nodes.length == 0 && (CommonService.parentNodeList.length - 1) > i) {
                nodeIteam = CommonService.parentNodeList[i + 1];
            }
            else {
                element.nodes.forEach(node => {
                    if (node.Label == guid) {
                        if (element.nodes.length - 1 > j)
                            nodeIteam = element.nodes[j + 1];
                        else if (CommonService.parentNodeList.length - 1 > i)
                            nodeIteam = CommonService.parentNodeList[i + 1];
                        else
                            nodeIteam = CommonService.parentNodeList[0];
                    }
                    j++;
                });
            }
            i++;
        });
        return nodeIteam;
    }

    findCurrentSongItem(guid): any {
        var isPlayNode = false;
        var parentCounter = 0;
        var i = 0;
        var nodeIteam = null;
        if (CommonService.parentNodeList == undefined)
            return;

        CommonService.parentNodeList.forEach(element => {
            //-----------------Parent Node------------------------------------
            if (isPlayNode == false) {
                if (element.Label == guid) {
                    isPlayNode = true;
                    nodeIteam = CommonService.parentNodeList[parentCounter];
                }
                parentCounter = parentCounter + 1;
            }
        });

        parentCounter = 0;
        //-----------------Child Node----------------------------------------------
        if (isPlayNode == false) {
            CommonService.parentNodeList.forEach(element => {
                if (element.nodes.length != 0 && isPlayNode == false) {
                    var childCounter = 0;
                    element.nodes.forEach(childelement => {
                        if (childelement.Label == guid && isPlayNode == false) {
                            isPlayNode = true;
                            nodeIteam = CommonService.parentNodeList[parentCounter].nodes[childCounter];
                        }
                        childCounter = childCounter + 1;
                    });
                }
                parentCounter = parentCounter + 1;
            });
        }

        parentCounter = 0;
        //-----------------Sub Child Node----------------------------------------------
        if (isPlayNode == false) {
            CommonService.parentNodeList.forEach(element => {
                if (element.nodes.length != 0 && isPlayNode == false) {
                    var childCounter = 0;
                    var subChildCounter = 0;
                    element.nodes.forEach(childelement => {

                        if (childelement.nodes.length != 0 && isPlayNode == false) {
                            childelement.nodes.forEach(subchildelement => {
                                if (subchildelement.Label == guid && isPlayNode == false) {
                                    isPlayNode = true;
                                    nodeIteam = CommonService.parentNodeList[parentCounter].nodes[childCounter].nodes[subChildCounter];
                                }
                                subChildCounter = subChildCounter + 1;
                            });
                        }
                        childCounter = childCounter + 1;
                    });
                }
                parentCounter = parentCounter + 1;
            });
        }
        return nodeIteam;
    }

    playedIteamCallback(itemGuid) {
        var item = this.findCurrentSongItem(itemGuid.split(',')[0]);
        //if Item not exist then push into Queue for Lesson History
        let itemAvailable = this.isItemExist(item);
        if (itemAvailable == null) {
            this.nodes.push(item);
            this.setBackgroudColor(item.Label);
        }
        this.playCurrentSong(item, itemGuid.split(',')[1]);
    }

    setBackgroudColor(itemGuid) {
        setTimeout(() => {
            $('.treeView-drag-over').toArray().forEach(element => {
                $(element).removeClass('treeView-drag-over');
            });
            $('#div_' + itemGuid).addClass('treeView-drag-over');
            if ($('#div_' + itemGuid)[0].offsetTop != undefined)
                $('#customScroll').mCustomScrollbar('scrollTo', $('#div_' + itemGuid)[0].offsetTop);
        }, 50);
    }

    isItemExist(item) {
        let itemFound = null
        this.nodes.forEach(element => {
            if ((element.SongId == item.SongId) && (element.FilterType == item.FilterType)) {
                // if Item found change Item name on student end too
                element.TeacherItemName = item.TeacherItemName;
                itemFound = element;
            }
        });
        return itemFound;
    }

    studentPlayedIteamCallback(itemGuid) {

        var item = this.findCurrentSongItem(itemGuid);
        if (CommonService.autoPlay && !window.location.hash.includes('student/guidedvideofeedback')) {
            if (CommonService.lessonQueuePlayMode == 'PS') {
                LivePlayer.sendLessonQueueItem(item.Label);
            }
            else if (CommonService.lessonQueuePlayMode == 'SNP') {
                LivePlayer.sendLessonQueueItem(item.Label + ',' + 'SNP');
            }
        }
    }
    isPlayerStartedCallback(flag) {
        CommonService.isPlayerStarted = true;
    }

    playNextItem() {
        var item = this.findNextSongItem(localStorage.getItem('currentItemGuid'));
        localStorage.setItem('currentItemGuid', item.Label);
        localStorage.setItem('currentItem', JSON.stringify(item));
        if (window.location.hash.includes('student/guidedvideofeedback'))
            this.playCurrentSong(item);
        else {
            if (CommonService.lessonQueuePlayMode == 'PA') {
                LivePlayer.sendLessonQueueItem(item.Label);
                this.playCurrentSong(item);
            }
            else if (CommonService.lessonQueuePlayMode == 'PT') {
                this.playCurrentSong(item);
            }
            else if (CommonService.lessonQueuePlayMode == 'PS') {
                LivePlayer.sendLessonQueueItem(item.Label);
            }
            else if (CommonService.lessonQueuePlayMode == 'SNP') {
                LivePlayer.sendLessonQueueItem(item.Label + ',' + 'SNP');
            }
        }
    }

    playPreviousItem() {
        var item = this.findPreviousSongItem(localStorage.getItem('currentItemGuid'));
        this.playCurrentSong(item);
        LivePlayer.sendLessonQueueItem(item.Label);
    }

    renameItems(itemName) {
        var nextItem = this.findCurrentSongItem(localStorage.getItem('currentItemGuid'));
        if (window.location.hash.includes('teacher/videoConnected') || window.location.hash.includes('lesson-planner/library'))
            nextItem.TeacherItemName = itemName;
        else if (window.location.hash.includes('student/videoConnected')) {
            let item = this.isItemExist(nextItem);
            item.StudentItemName = itemName;
            this.sharedLibrary.libraryHistoryNodes = this.nodes;
        }
        $('#lblExceriseItemId').html(itemName); $('#exceriseItemId').val(itemName);
        $('#lblSongItemId').html(itemName); $('#txtSongItemId').val(itemName);
        $('#lblVideoItemId').html(itemName); $('#txtVideoItemId').val(itemName);
        $('#lblExceriseItemId').show(); $('#exceriseItemId').hide();
        $('#lblSongItemId').show(); $('#txtSongItemId').hide();
        $('#lblVideoItemId').show(); $('#txtVideoItemId').hide();

        if (this.sharedLibrary.location != null) {
            if (localStorage.getItem('userRole') == 'Teacher' && this.sharedLibrary.location.toLocaleLowerCase() == 'videoconnected') {
                LivePlayer.sendLessonQueueObject(this.sharedLibrary.libraryNodes);
                this.updateLesson();
            }
            else if (window.location.hash.includes('student/videoConnected')) {
                this.updateLessonHistory();
            }
        }


    }

    UpdateAttendee(roomAttendee) {
        this.lobbyService.UpdateAttendee(roomAttendee).subscribe((data: any) => {
            data.forEach(element => {
                LivePlayer.changeUserLobbyStatus(element);
            });
        });
    }

    initTreeViewCallbackEvents() {
        window['angularComponentReference'] = {
            zone: this._ngZone,
            playedIteamCallback: (value) => this.playedIteamCallback(value),
            studentPlayedIteamCallback: (value) => this.studentPlayedIteamCallback(value),
            //sequencerCallback: (value) => this.sequencerCallback(value),
            //sequencerCommondCallback: (value) => this.sequencerCommondCallback(value),
            sequencerCmdSEC3Callback: (value) => this.sequencerCmdSEC3Callback(value),
            sequencerCmdSESCallback: (value) => this.sequencerCmdSESCallback(value),
            sequencerCmdSETCallback: (value) => this.sequencerCmdSETCallback(value),
            sequencerCmdSACCallback: (value) => this.sequencerCmdSACCallback(value),
            isPlayerStartedCallback: (value) => this.isPlayerStartedCallback(value),
            exceriseCallback: (value) => this.exceriseCallback(value),
            voiceLessonsMusicCallback: (value) => this.voiceLessonsMusicCallback(value),
            playNextItem: () => this.playNextItem(),
            playPreviousItem: () => this.playPreviousItem(),
            renameItems: (value) => this.renameItems(value),
            UpdateAttendee: (value) => this.UpdateAttendee(value),
            LessonAddPosition: (position, isPopUp) => this.LessonAddPosition(position, isPopUp),
            component: this,
        };
    }

    songItemNameChanged(music) {
        if (localStorage.getItem('userRole') == 'Teacher' && music.TeacherItemName != $('#txtItemName_' + music.Label).val()) {
            //var item = this.findCurrentSongItem(music.Label);
            music.TeacherItemName = $('#txtItemName_' + music.Label).val();
            $('#lblItemName_' + music.Label).show();
            $('#txtItemName_' + music.Label).hide();
            if (localStorage.getItem('currentItemGuid') == music.Label) {
                $('#lblSongItemId').html(music.TeacherItemName); $('#txtSongItemId').val(music.TeacherItemName);
                $('#lblExceriseItemId').html(music.TeacherItemName); $('#exceriseItemId').val(music.TeacherItemName);
                $('#lblVideoItemId').html(music.TeacherItemName); $('#txtVideoItemId').val(music.TeacherItemName);
            }
            LivePlayer.sendLessonQueueObject(this.sharedLibrary.libraryNodes);
            this.updateLesson();
        }
        else if (localStorage.getItem('userRole') == 'Student' && music.StudentItemName != $('#txtItemName_' + music.Label).val()) {
            //var item = this.findCurrentSongItem(music.Label);
            music.StudentItemName = $('#txtItemName_' + music.Label).val();
            $('#lblItemName_' + music.Label).show();
            $('#txtItemName_' + music.Label).hide();
            let currentItem: any = JSON.parse(localStorage.getItem('currentItem'));
            if (currentItem.SongId == music.SongId && currentItem.FilterType == music.FilterType) {
                $('#lblSongItemId').html(music.StudentItemName);
                $('#txtSongItemId').val(music.StudentItemName);
            }
            this.sharedLibrary.libraryHistoryNodes = this.nodes;
            this.updateLessonHistory();
        }
        $('#lblItemName_' + music.Label).show();
        $('#txtItemName_' + music.Label).hide();
    }

    labelItemClick(music) {
        //if (localStorage.getItem('userRole') == 'Teacher') {
        $('.lblItemClass').show();
        $('.txtItemClass').hide();
        $('#lblItemName_' + music.Label).hide();
        $('#lblItemName_' + music.Label).hide();
        $('#txtItemName_' + music.Label).show();
        $('#txtItemName_' + music.Label).focus();
        //}
    }
}