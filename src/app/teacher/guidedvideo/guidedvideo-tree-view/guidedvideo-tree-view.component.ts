import { Component, Input, OnDestroy, NgZone, OnInit, AfterViewChecked, trigger, state, style, transition, animate } from '@angular/core';
import { Node } from '../../tree-view/node';
import { CommonService } from '../../../common/common.service';
import { DragLessonDialogComponent } from '../../drag-lesson-dialog/drag-lesson-dialog.component';
import { MatDialog } from '../../../../../node_modules/@angular/material';
import { HttpParams } from '@angular/common/http';
import { CrudService } from '../../../services/crud.service';
import { LobbyService } from '../../../services/lobby.service';
import { ToastrService } from 'ngx-toastr';
import { GuidedvideoService } from '../../../services/guidedvideo.service';

declare var VoiceLessons: any;
declare var VoiceLessonsExercisePlayer: any;
declare var LivePlayer: any;
@Component({
    selector: 'app-guidedvideo-tree-view',
    templateUrl: './guidedvideo-tree-view.component.html',
    animations: [
        trigger('animateState', [
            state('active', style({
                backgroundColor: '#1c1d1f'
            })),
            transition('* => *', animate(1500))
        ])
    ]
})

export class GuidedvideoTreeViewComponent implements OnInit, OnDestroy {
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

    ngOnInit(): void {
        if (CommonService.isGVLessonQueueLoaded == false) {
            CommonService.isGVLessonQueueLoaded = true;
            this.getGuidedVideoLesson();
        }
        /*  if (localStorage.getItem('GVLesson') != null && localStorage.getItem('GVLesson') != "" &&
        localStorage.getItem('GVLesson') != undefined) {
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
            if (this.sharedLibrary.location.toLocaleLowerCase() == 'videoconnected') {
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
    } */
        // if (this.sharedLibrary.location.toLocaleLowerCase() == 'videoconnected')
        //     this.isVideoConnectedPage = true;
    }

    ngOnDestroy(): void {
        CommonService.isPlayerStarted = false;
    }

    constructor(private guidedvideoService: GuidedvideoService, public dialog: MatDialog, private lobbyService: LobbyService,
        public toastr: ToastrService, private crudService: CrudService, private _ngZone: NgZone) {
    }

    getGuidedVideoLesson() {
        this.guidedvideoService.LessonModel = JSON.parse(localStorage.getItem('GVLesson'));
        if (this.guidedvideoService.LessonModel != null) {
            this.crudService.get('/lesson/GetLessonDetailsByLessonGuid?lessonGuid=' + this.guidedvideoService.LessonModel.LessonGuid, null).subscribe((response: any) => {
               // this.guidedvideoService.LessonModel = response;
                // this.sharedLibrary.LessonModel.LessonId = response.LessonId;
                this.addLiveLessonQueue(response.LessonQueue);
               // localStorage.setItem('GVLesson', JSON.stringify(this.guidedvideoService.LessonModel));
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
            this.guidedvideoService.event = $event;
            if (this.nodes[0].LabelName == 'Drag Here!...') {
                if ($event.dragData.LessonQueue != '') {
                    var json = JSON.parse($event.dragData.LessonQueue);
                    this.addLessonNodes(json, nodeLength, 'bottom', false);
                    // this.updateLesson();
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
            this.guidedvideoService.libraryNodes = this.nodes;
            if (this.guidedvideoService.libraryNodes == undefined || this.guidedvideoService.libraryNodes.length == 0) {
                this.guidedvideoService.libraryHistoryNodes = this.nodes;
            }
            this.updateLesson();
            //CommonService.parentNodeList = this.sharedLibrary.libraryNodes;
        }
       
        //setTimeout(() => { this.addBackgroundColor(itemGuid) }, 10);
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
        // LivePlayer.sendLessonQueueObject(this.sharedLibrary.libraryNodes);
        // this.updateLesson();

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

    updateLesson() {
        this.guidedvideoService.LessonModel = JSON.parse(localStorage.getItem('GVLesson'));
        if (this.guidedvideoService.LessonModel.LessonId != 0) {
            for (let index = 0; index < this.guidedvideoService.libraryNodes.length; index++) {
                if (this.guidedvideoService.libraryNodes[0].LabelName == 'Drag Here!...') {
                    this.guidedvideoService.libraryNodes.splice(index, 1);
                    break;
                }
            }
            if (this.guidedvideoService.libraryNodes.length > 0) {
                this.guidedvideoService.LessonModel.LessonQueue = JSON.stringify(this.guidedvideoService.libraryNodes);
            } else {
                this.guidedvideoService.LessonModel.LessonQueue = "";
            }

            this.guidedvideoService.LessonModel.LessonHistory = JSON.stringify(this.guidedvideoService.libraryHistoryNodes);
            this.guidedvideoService.LessonModel.IsLessonQueueChange = true;
            if (this.guidedvideoService.LessonModel.Tags == null) {
                this.guidedvideoService.LessonModel.Tags = "";
            }
            this.guidedvideoService.post('/lesson/UpsertLesson', this.guidedvideoService.LessonModel, new HttpParams()).subscribe((response: any) => {
                this.guidedvideoService.LessonModel.LessonQueue = response.LessonQueue;
                this.guidedvideoService.LessonModel.IsLessonQueueChange = false;
                localStorage.setItem('GVLesson', JSON.stringify(this.guidedvideoService.LessonModel));
                if (response.LessonQueue == "") {
                    this.addLiveLessonQueue(response.LessonQueue);
                }

                this.toastr.success("Lesson Queue updated successfully.");
                
            });
        }
    }

    openDragLessonPopUp(event) {
        const dialogRef = this.dialog.open(DragLessonDialogComponent, {});
    }

    LessonAddPosition(position, isPopUp = false) {
        this.nodes = this.guidedvideoService.libraryNodes;
        var nodeLength = this.nodes.length;
        if (this.guidedvideoService.event.dragData.LessonQueue != '') {
            var json = JSON.parse(this.guidedvideoService.event.dragData.LessonQueue);
            this.addLessonNodes(json, nodeLength, position, isPopUp);
            // this.updateLesson();
        }
     /*    if (localStorage.getItem('userRole') == 'Teacher' && this.guidedvideoService.location.toLocaleLowerCase() == 'videoconnected') {
            LivePlayer.sendLessonQueueObject(this.guidedvideoService.libraryNodes);
        } */
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
                this.nodes.push(new Node(nodelist[i].SongId, CommonService.getGuid(), nodelist[i].LabelName, nodelist[i].Artist, nodelist[i].VideoUrl, nodelist[i].AudioFile, nodelist[i].JumpPoints, nodelist[i].FilterType, nodelist[i].CreatedByUserId, false, nodelist[i].NoteflightScoreID, nodelist[0].Lyrics, nodelist[i].TransLations, nodelist[i].LessonQueue, nodelist[i].Midi, nodelist[i].IsTeacherPlayed, nodelist[i].IsStudentPlayed, nodelist[i].nodes, nodelist[i].TeacherItemName, nodelist[i].StudentItemName));
            }
            else {
                CommonService.currentParentNodeList.push(new Node(nodelist[i].SongId, CommonService.getGuid(), nodelist[i].LabelName, nodelist[i].Artist, nodelist[i].VideoUrl, nodelist[i].AudioFile, nodelist[i].JumpPoints, nodelist[i].FilterType, nodelist[i].CreatedByUserId, false, nodelist[i].NoteflightScoreID, nodelist[0].Lyrics, nodelist[i].TransLations, nodelist[i].LessonQueue, nodelist[i].Midi, nodelist[i].IsTeacherPlayed, nodelist[i].IsStudentPlayed, nodelist[i].nodes, nodelist[i].TeacherItemName, nodelist[i].StudentItemName));
            }
        }
        this.guidedvideoService.libraryNodes = this.nodes;
        this.guidedvideoService.libraryHistoryNodes = this.nodes;
        CommonService.currentParentNodeList = this.nodes;
        CommonService.parentNodeList = this.guidedvideoService.libraryNodes;
        //this.updateLesson();
        if (isPopUp)
            this.nodes = CommonService.currentParentNodeList;
    }

    /*   lessonQueueCallback(lessonQueueJsonObject) {
          var arrayNodeList: any[] = lessonQueueJsonObject;
          var nodelist = this.lessonQueueFromJsonNodes(arrayNodeList);
          this.nodes = null;
          this.nodes = nodelist;
          CommonService.parentNodeList = nodelist;
      } */

    /* sequencerCallback(keyBoardExceriseData) {
        var exceriseData = '{"name":"KeyBoard-Excerise","data":';
        var JsonData = JSON.stringify(keyBoardExceriseData);
        exceriseData += JsonData + '}';
        var exceriseItem = new Node(CommonService.getGuid(), CommonService.getGuid(), 'KeyBoard-Excerise', null, null, null, null, 'Excerise', null, false, null, null, null, null, exceriseData, null, null, [], null, null);
        this.nodes.push(exceriseItem);

        if (this.nodes.length == 2 && this.nodes[0].LabelName == 'Drag Here!...') {
            this.nodes.splice(0, 1);
        }
        LivePlayer.sendLessonQueueObject(this.guidedvideoService.libraryNodes);
        this.playCurrentSong(exceriseItem);
    } */

    /*    sequencerCommondCallback(commond) {
           VoiceLessonsExercisePlayer.stopMusic();
       } */

    convertLessonToNodes(songNodes: any): Array<Node> {
        if (songNodes == undefined) return;
        var nodeList = new Array<Node>();
        var parentCounter = 0;
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

    playSong(currentSongNo, NodeList, option) {
                if (!CommonService.isPlayerStarted)
                   LivePlayer.sendLessonQueueObject(this.guidedvideoService.libraryNodes);
                if (option == 'PA') {
                    LivePlayer.sendLessonQueueItem(NodeList[currentSongNo].Label);
                    this.playCurrentSong(NodeList[currentSongNo]);
                }
                else if (option == 'PT') {
                    this.playCurrentSong(NodeList[currentSongNo]);
                }
                else if (option == 'PS') {
                    LivePlayer.sendLessonQueueItem(NodeList[currentSongNo].Label);
                }
                else if (option == 'SNP') {
                    LivePlayer.sendLessonQueueItem(NodeList[currentSongNo].Label + ',' + 'SNP');
                }
                this.currentSongNo = currentSongNo;
    }


    trackMediaPlayed(music) {        
        let playedItem = {
            "UserId": CommonService.getUser().UserId,
            "PlayerItemId": music.SongId,
            "ItemType": music.FilterType,
        }
        this.guidedvideoService.post('/lesson/trackMediaPlayed', playedItem, null).subscribe((result: any) => {            
        });
    }

    playCurrentSong(music, option = null) {
        this.trackMediaPlayed(music)
        VoiceLessons.destoryPlayer();
        VoiceLessonsExercisePlayer.stopMusic();
        localStorage.setItem('currentItemGuid', music.Label);
        if (music == undefined) return;
        var playList = [];
        if (music.FilterType == 'Song') {
            var song = {
                'src': music.AudioFile,
                'jumpPoints': music.JumpPoints != '' ? JSON.parse(music.JumpPoints) : '',
                'tittle': (music.TeacherItemName != undefined && music.TeacherItemName != null) ? music.TeacherItemName : music.LabelName,
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

            $('#excrisePlayer').hide();
            $('#audioPlayer').show();
        }
        else {
            if (music.Midi == '' || music.Midi == undefined) return;
            var exceriseObj = JSON.parse(music.Midi);
            exceriseObj.name = (music.TeacherItemName != undefined && music.TeacherItemName != null) ? music.TeacherItemName : music.LabelName;
            var excerisePlayList = "[";
            excerisePlayList += JSON.stringify(exceriseObj) + ',';
            excerisePlayList = excerisePlayList.substr(0, excerisePlayList.length - 1);
            excerisePlayList += "]";
            VoiceLessonsExercisePlayer.initPlayer(excerisePlayList, music.Label, this.exceriseCallback, '#excrisePlayer');
            if (option == 'SNP')
                VoiceLessonsExercisePlayer.stopMusic();

            $('#excrisePlayer').show();
            $('#audioPlayer').hide();
        }
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
                    this.guidedvideoService.libraryHistoryNodes[parentCounter].IsTeacherPlayed = true;
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
                            this.guidedvideoService.libraryHistoryNodes[parentCounter].nodes[childCounter].IsTeacherPlayed = true
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
        if (CommonService.autoPlay && localStorage.getItem('userRole') == 'Teacher') {
            var nextItem = this.findNextSongItem(itemGuid);
            LivePlayer.sendLessonQueueItem(nextItem.Label);
            this.playCurrentSong(nextItem);
        }
    }

    voiceLessonsMusicCallback(completedSong) {
        if (CommonService.autoPlay && localStorage.getItem('userRole') == 'Teacher') {
            var nextItem = this.findNextSongItem(completedSong.label);
            LivePlayer.sendLessonQueueItem(nextItem.Label);
            this.playCurrentSong(nextItem);
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
        if (this.guidedvideoService.libraryNodes.length == 0) {
            data.push(new Node(CommonService.getGuid(), CommonService.getGuid(), 'Drag Here!...', null, null, null, null, null, null, null, null, null, null, null, null, null, null, [], null, null));
            $('#excrisePlayer').hide();
            $('#audioPlayer').hide();

        }
        CommonService.parentNodeList = this.guidedvideoService.libraryNodes;
        if (this.guidedvideoService.location != null) {
            if (localStorage.getItem('userRole') == 'Teacher' && this.guidedvideoService.location.toLocaleLowerCase() == 'videoconnected') {
                LivePlayer.sendLessonQueueObject(this.guidedvideoService.libraryNodes);
                if (VoiceLessons.audio != null && data[0].LabelName != 'Drag Here!...') {
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
        currentNode.nodes.unshift(new Node(currentNode.SongId, CommonService.getGuid(), currentNode.LabelName, currentNode.Artist, currentNode.VideoUrl, currentNode.AudioFile, currentNode.JumpPoints, currentNode.FilterType, currentNode.CreatedByUserId, false, currentNode.NoteflightScoreID, currentNode.Lyrics, currentNode.TransLations, currentNode.LessonQueue, currentNode.Midi, false, false, [], currentNode.TeacherItemName, currentNode.StudentItemName));

        CommonService.parentNodeList = parentNode;
      /*   if (this.guidedvideoService.location != null) {
            if (localStorage.getItem('userRole') == 'Teacher' && this.guidedvideoService.location.toLocaleLowerCase() == 'videoconnected') {
                LivePlayer.sendLessonQueueObject(this.guidedvideoService.libraryNodes);
                CommonService.parentNodeList = this.guidedvideoService.libraryNodes;
            }
        } */
        console.log(this.nodes);
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
                this.guidedvideoService.LessonModel = response;
                // this.sharedLibrary.LessonModel.LessonId = response.LessonId;
                CommonService.isGVLessonQueueLoaded = true;
                this.addLiveLessonQueue(response.LessonQueue);
                localStorage.setItem('GVLesson', JSON.stringify(this.guidedvideoService.LessonModel));
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
        if (this.guidedvideoService.LessonModel.LessonId != null && this.guidedvideoService.LessonModel.LessonId != 0) {
            this.crudService.get('/lesson/GetLessonDetailsById?lessonId=' + this.guidedvideoService.LessonModel.LessonId, null).subscribe((response: any) => {
                //this.sharedLibrary.LessonModel.LessonId = response.LessonId;
                this.guidedvideoService.LessonModel = response;
                this.addLiveLessonQueue(response.LessonQueue);
                localStorage.setItem('GVLesson', JSON.stringify(this.guidedvideoService.LessonModel));
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
        this.playCurrentSong(item, itemGuid.split(',')[1]);
    }

    isPlayerStartedCallback(flag) {
        CommonService.isPlayerStarted = true;
    }

    playNextItem() {
        var item = this.findNextSongItem(localStorage.getItem('currentItemGuid'));
        this.playCurrentSong(item);
        LivePlayer.sendLessonQueueItem(item.Label);
    }

    playPreviousItem() {
        var item = this.findPreviousSongItem(localStorage.getItem('currentItemGuid'));
        this.playCurrentSong(item);
        LivePlayer.sendLessonQueueItem(item.Label);
    }

    renameItems(itemName) {
        var nextItem = this.findCurrentSongItem(localStorage.getItem('currentItemGuid'));
        nextItem.TeacherItemName = itemName;
        $('#lblExceriseItemId').html(itemName); $('#exceriseItemId').val(itemName);
        $('#lblSongItemId').html(itemName); $('#txtSongItemId').val(itemName);
        $('#lblExceriseItemId').show(); $('#exceriseItemId').hide();
        $('#lblSongItemId').show(); $('#txtSongItemId').hide();
        if (this.guidedvideoService.location != null) {
            if (localStorage.getItem('userRole') == 'Teacher' && this.guidedvideoService.location.toLocaleLowerCase() == 'videoconnected') {
                LivePlayer.sendLessonQueueObject(this.guidedvideoService.libraryNodes);
            }
        }
        //this.updateLesson();
    }

    UpdateAttendee(roomAttendee) {
        this.lobbyService.UpdateAttendee(roomAttendee).subscribe((data: any) => {
            data.forEach(element => {
                LivePlayer.changeUserLobbyStatus(element);
            });
        });
    }

    /*  initTreeViewCallbackEvents() {
         window['angularComponentReference'] = {
             zone: this._ngZone,
             playedIteamCallback: (value) => this.playedIteamCallback(value),
             sequencerCallback: (value) => this.sequencerCallback(value),
             sequencerCommondCallback: (value) => this.sequencerCommondCallback(value),
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
     } */

    songItemNameChanged(music) {
        if (localStorage.getItem('userRole') == 'Teacher' && music.TeacherItemName != $('#txtItemName_' + music.Label).val()) {
            var item = this.findCurrentSongItem(music.Label);
            music.TeacherItemName = $('#txtItemName_' + music.Label).val();
            $('#lblItemName_' + music.Label).show();
            $('#txtItemName_' + music.Label).hide();
            LivePlayer.sendLessonQueueObject(this.guidedvideoService.libraryNodes);
            //this.updateLesson();
        }
    }

    labelItemClick(music) {
        if (localStorage.getItem('userRole') == 'Teacher') {
            $('.lblItemClass').show();
            $('.txtItemClass').hide();
            $('#lblItemName_' + music.Label).hide();
            $('#lblItemName_' + music.Label).hide();
            $('#txtItemName_' + music.Label).show();
            $('#txtItemName_' + music.Label).focus();
        }
    }

    onDragEnter($event: any) {
        $($event.mouseEvent.target).parent('li').addClass('treeView-drag-over');
      }
    
      onDragLeave($event: any) {
        $($event.mouseEvent.target).parent('li').removeClass('treeView-drag-over');
      }
}   
