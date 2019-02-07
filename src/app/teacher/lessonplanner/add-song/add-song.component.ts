import { Component, OnInit, Injectable, ViewChild, EventEmitter } from '@angular/core';
import { TooltipPosition, MatChipInputEvent } from '@angular/material';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { FormGroup, FormControl } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { CommonService } from '../../../common/common.service';
import { UploadOutput, UploadInput, UploadFile, humanizeBytes, UploaderOptions, UploadStatus } from 'ngx-uploader';
import { BlobService, UploadConfig } from 'angular-azure-blob-service'
import { Config } from '../../../models/config.template';
import { UploadEvent } from '../../../../../node_modules/ngx-file-drop';
import { LessonsService } from '../../../services/lessons.service';
import { SongsService } from '../../../services/song.service';
import { Node } from '../../tree-view/node';
import { SharedlibraryService } from '../../../services/sharedlibrary.service';
import { LoaderService } from '../../../services/loader.service';
import { GuidedvideoService } from '../../../services/guidedvideo.service';
import { PlaylistService } from '../../../services/playlist.service';

@Component({
    selector: 'app-add-song',
    templateUrl: './add-song.component.html',
    styleUrls: ['./add-song.component.scss']
})
@Injectable()
export class AddSongComponent implements OnInit {
    @ViewChild('formStep1') formStep1: any;
    @ViewChild('formStep2') formStep2: any;
    [x: string]: any;
    jumpPoint3: string;
    jumpPoint2: string;
    jumpPoint1: string;
    jumpPointName2: string;
    jumpPointName3: string;
    jumpPointName1: string;
    songModel: any;
    isStep1SubmitFlag: boolean = false;
    isStep2SubmitFlag: boolean = false;
    myGroup(arg0: any): any {
        throw new Error("Method not implemented.");
    }
    SongArtist: any;
    SongTitle: any;
    isDropup = true;
    SongsObj: any;
    visible: boolean = true;
    selectable: boolean = true;
    removable: boolean = true;
    addOnBlur: boolean = true;
    options: UploaderOptions;
    formData: FormData;
    files: UploadFile[];
    uploadInput: EventEmitter<UploadInput>;
    humanizeBytes: Function;
    dragOver: boolean;
    config: UploadConfig;
    nodes: Array<Node>;
    // Enter, comma
    separatorKeysCodes = [ENTER, COMMA];

    songTagsList = [
    ];

    emptyJumpPoints: any = [{
        Point: "",
        Name: ""
    }];

    window: any;
    isGuidedVideoLesson: boolean = false;
    isPlaylist: boolean = false;

    constructor(public sharedLibrary: SharedlibraryService, private toastr: ToastrService, private route: Router,
        private blob: BlobService, public lessonService: LessonsService, public songService: SongsService,
        private loaderService: LoaderService, public guidedvideoService: GuidedvideoService, public playlistService: PlaylistService) {
        this.options = { concurrency: 1, maxUploads: 3 };
        this.files = [];
        this.uploadInput = new EventEmitter<UploadInput>();
        this.humanizeBytes = humanizeBytes;
        this.isGuidedVideoLesson = this.route.url.includes('guidedvideo-lessonplanner');
        this.isPlaylist = this.route.url.includes('playlist');
    }

    add(event: MatChipInputEvent): void {
        let input = event.input;
        let value = event.value;

        // Add our fruit
        if ((value || '').trim() && this.songTagsList.findIndex(x => x.name === value.trim()) === -1) {
            this.songTagsList.push({ name: value.trim() });
        }
        else if (value === "") {
            this.toastr.error("Please enter a valid tag.")
        }
        else if (this.songTagsList.findIndex(x => x.name === value.trim()) != -1) {
            this.toastr.warning("This tag already exists !")
        }


        // Reset the input value
        if (input) {
            input.value = '';
        }
    }

    remove(tag: any): void {
        let index = this.songTagsList.indexOf(tag);
        if (index >= 0) {
            this.songTagsList.splice(index, 1);
        }
    }

    firstFormGroup: FormGroup;
    secondFormGroup: FormGroup;

    positionOptions: TooltipPosition[] = ['left'];
    position = new FormControl(this.positionOptions[0]);

    public dropped(event: UploadEvent) {
        this.serImageUpload.startUpload(event.files, "ExerciseUpload");
    }

    public fileOver(event) {
        console.log(event);
    }

    public fileLeave(event) {
        console.log(event);
    }

    public initialiseSongData() {
        this.songModel = {
            SongId: 0,
            SongGUID: "",
            NoteflightScoreID: "",
            Label: "",
            Slug: "",
            GroupEx: 0,
            Tempo: "",
            HFNumber: "",
            Publisher: "",
            CreatedOn: new Date(),
            ModifiedOn: null,
            CreatedByUserId: 0,
            ModifiedByUserId: 0,
            AudioFile: "",
            MidiFile: "",
            Artist: "",
            VideoUrl: "",
            SongJumpPoints: [],
            JumpPoints: null,
            Lyrics: "",
            TransLations: "",
            Tags: "",
            LibraryType: 0,
            Genre: "",
            Keys: null,
            VocalType: "",
            SkillLevel: 0,
            Worship: 0,
            FileType: "",
            AccessType: "Private"
        }
        this.addJumpPoint();
    }

    ngOnInit() {
        this.window = window;
        this.initialiseSongData();
        if (this.songService.songId > 0) {
            this.lessonService.get('/song/GetSongData', new HttpParams().set('songId', this.songService.songId.toString())).subscribe(result => {
                this.songModel = result;
                this.songModel.Tags = this.songService.songTags;
                if (this.songModel.JumpPoints === null) {
                    this.addJumpPoint();
                }
                else {
                    this.songModel.SongJumpPoints = JSON.parse(this.songModel.JumpPoints);
                }
                if (this.songModel.Tags.trim() != "") {
                    this.songModel.Tags.split(',').forEach(x => {
                        this.songTagsList.push({ name: x.trim() });
                    });
                }
                if (this.songModel.VocalType != null && this.songModel.VocalType != "") {
                    var vocals = this.songModel.VocalType.split(',');
                    this.selectedVocal = [];
                    vocals.forEach(element => {
                        var vocalItem = this.lessonService.vocalList.filter(x => x.item_id == element)[0].item_text;
                        this.jsonObj = [];
                        let savedVocalType = {
                            "item_id": parseInt(element),
                            "item_text": vocalItem
                        }
                        this.selectedVocal.push(savedVocalType);
                    });
                }
                if (this.songModel.Genre != null && this.songModel.Genre != "") {
                    var genres = this.songModel.Genre.split(',');
                    this.selectedGenre = [];
                    genres.forEach(element => {
                        var genreItem = this.lessonService.genreList.filter(x => x.item_id == element)[0].item_text;
                        this.jsonObj = [];
                        let savedGenre = {
                            "item_id": parseInt(element),
                            "item_text": genreItem
                        }
                        this.selectedGenre.push(savedGenre);
                    });
                }
            })
        }
        this.lessonService.getDropDownSetting();
    }

    addSong() {
        let userId = CommonService.getUser().UserId;
        this.songModel.CreatedByUserId = userId;
        this.songModel.Tags = "";
        this.songTagsList.forEach(element => {
            this.songModel.Tags = this.songModel.Tags + element.name + ',';
        });
        this.songModel.Tags = this.songModel.Tags.substr(0, this.songModel.Tags.length - 1);
        if (this.songModel.SongJumpPoints.length === 1 && this.songModel.SongJumpPoints[0].Point === '' && this.songModel.SongJumpPoints[0].Name === '') {
            this.songModel.JumpPoints = null;
        } else if (this.songModel.SongJumpPoints != null) {
            this.songModel.JumpPoints = JSON.stringify(this.songModel.SongJumpPoints);
        }
        this.songService.post('/song/UpsertSong', this.songModel, new HttpParams()).subscribe((response: any) => {
            var newAddedSong = response;
            //-------------if exercise added in an lesson--------------------------------------------------------------------
            if (!this.isGuidedVideoLesson && !this.isPlaylist && (localStorage.getItem('EditLesson') != null && localStorage.getItem('EditLesson') != "")) {
                this.addSongInLiveLesson(newAddedSong);
            }
            else if (this.isGuidedVideoLesson && !this.isPlaylist) {
                this.addSongInGuidedVideoLesson(newAddedSong);
            }
            else if (!this.isGuidedVideoLesson && this.isPlaylist) {
                this.addSongInPlaylistLesson(newAddedSong);
            }
            //---------------------------------------------------------------------------------------------------------------
            else {
                if (this.songModel.songId > 0) {
                    this.songService.songId = 0;
                    this.songService.songTags = "";
                    this.toastr.success('An Song Updated!!');
                    if (this.sharedLibrary.saveItemSource === "library")
                        this.route.navigateByUrl('/teacher/song-library');
                }
                else if (this.songService.IsAddedFromLibrary == true) {
                    this.songService.IsAddedFromLibrary = false;
                    this.toastr.success('A New Song Added in Library!!');
                    if (this.sharedLibrary.saveItemSource === "library")
                        this.route.navigateByUrl('/teacher/song-library');
                }
                else {
                    this.toastr.success('A New Song Added in Queue!!');
                    if (this.sharedLibrary.saveItemSource === "library")
                        this.route.navigate(['/teacher/lesson-planner/library']);
                }
            }
        });
    }

    addSongInLiveLesson(newAddedSong) {
        this.sharedLibrary.LessonModel = JSON.parse(localStorage.getItem('EditLesson'));
        this.nodes = [];
        var queue = "";
        if (this.sharedLibrary.LessonModel.LessonQueue != "") {
            queue = JSON.parse(this.sharedLibrary.LessonModel.LessonQueue);
            var nodes = this.addLiveLessonQueue(queue, newAddedSong);
            this.sharedLibrary.LessonModel = JSON.parse(localStorage.getItem('EditLesson'));
            var nodeLength = nodes.length;
            for (let index = 0; index < nodeLength; index++) {
                if (nodes[0].LabelName == 'Drag Here!...') {
                    nodes.splice(index, 1);
                    break;
                }
            }
            this.sharedLibrary.LessonModel.LessonQueue = JSON.stringify(nodes);
        }
        else {
            this.nodes.push(new Node(newAddedSong.SongId, CommonService.getGuid(), newAddedSong.Label, newAddedSong.Artist, newAddedSong.VideoURL, newAddedSong.AudioFile, newAddedSong.JumpPoints, 'Song', newAddedSong.CreatedByUserId, false, newAddedSong.NoteflightScoreID, newAddedSong.Lyrics, newAddedSong.TransLations, '', newAddedSong.Midi, false, false, [], undefined, undefined))
            this.sharedLibrary.LessonModel.LessonQueue = JSON.stringify(this.nodes);
        }


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

        if (this.sharedLibrary.LessonModel.Tags == null) {
            this.sharedLibrary.LessonModel.Tags = "";
        }
        this.songService.post('/lesson/UpsertLesson', this.sharedLibrary.LessonModel, new HttpParams()).subscribe((response: any) => {
            CommonService.isEditLessonQueueLoaded = false;
            this.songService.songId = 0;
            this.songService.songTags = "";
            if (this.sharedLibrary.saveItemSource === "library") {
                this.route.navigate(['/teacher/lesson-planner/library']);
            }
            else if (this.sharedLibrary.saveItemSource === "video") {
                CommonService.isEditLessonQueueLoaded = true;
                this.window.addItemLessonQueue(nodes);
                this.sharedLibrary.isSong = this.sharedLibrary.isExercise = this.sharedLibrary.isVideo = false;
                this.sharedLibrary.isLibrary = true;
            }
        });
    }

    addSongInGuidedVideoLesson(newAddedSong) {
        this.guidedvideoService.LessonModel = JSON.parse(localStorage.getItem('GVLesson'));
        this.nodes = [];
        var queue = "";
        if (this.guidedvideoService.LessonModel.LessonQueue != "") {
            queue = JSON.parse(this.guidedvideoService.LessonModel.LessonQueue);
            var nodes = this.addLiveLessonQueue(queue, newAddedSong);
            this.guidedvideoService.LessonModel = JSON.parse(localStorage.getItem('GVLesson'));
            var nodeLength = nodes.length;
            for (let index = 0; index < nodeLength; index++) {
                if (nodes[0].LabelName == 'Drag Here!...') {
                    nodes.splice(index, 1);
                    break;
                }
            }
            this.guidedvideoService.LessonModel.LessonQueue = JSON.stringify(nodes);
        }
        else {
            this.nodes.push(new Node(newAddedSong.SongId, CommonService.getGuid(), newAddedSong.Label, newAddedSong.Artist, newAddedSong.VideoURL, newAddedSong.AudioFile, newAddedSong.JumpPoints, 'Song', newAddedSong.CreatedByUserId, false, newAddedSong.NoteflightScoreID, newAddedSong.Lyrics, newAddedSong.TransLations, '', newAddedSong.Midi, false, false, [], undefined, undefined))
            this.guidedvideoService.LessonModel.LessonQueue = JSON.stringify(this.nodes);
        }


        if (this.guidedvideoService.LessonModel.Student != undefined) {
            if (this.guidedvideoService.LessonModel.Student.length > 0) {
                this.guidedvideoService.LessonModel.Student.forEach(element => {
                    if (this.guidedvideoService.LessonModel.Users == null)
                        this.guidedvideoService.LessonModel.Users = element.UserId + ',';
                    else
                        this.guidedvideoService.LessonModel.Users = this.guidedvideoService.LessonModel.Users + element.UserId + ',';
                });
            }
            else {
                this.guidedvideoService.LessonModel.Users = "";
            }
        }
        else {
            this.guidedvideoService.LessonModel.Users = "";
        }

        if (this.guidedvideoService.LessonModel.Tags == null) {
            this.guidedvideoService.LessonModel.Tags = "";
        }
        this.songService.post('/lesson/UpsertLesson', this.guidedvideoService.LessonModel, new HttpParams()).subscribe((response: any) => {
            this.songService.songId = 0;
            this.songService.songTags = "";
            CommonService.isGVLessonQueueLoaded = false;
            this.route.navigate(['teacher/guidedvideo-lessonplanner']);
        });
    }

    addSongInPlaylistLesson(newAddedSong) {
        this.playlistService.LessonModel = JSON.parse(localStorage.getItem('Playlist'));
        this.nodes = [];
        var queue = "";
        if (this.playlistService.LessonModel.LessonQueue != "") {
            queue = JSON.parse(this.playlistService.LessonModel.LessonQueue);
            var nodes = this.addLiveLessonQueue(queue, newAddedSong);
            this.playlistService.LessonModel = JSON.parse(localStorage.getItem('Playlist'));
            var nodeLength = nodes.length;
            for (let index = 0; index < nodeLength; index++) {
                if (nodes[0].LabelName == 'Drag Here!...') {
                    nodes.splice(index, 1);
                    break;
                }
            }
            this.playlistService.LessonModel.LessonQueue = JSON.stringify(nodes);
        }
        else {
            this.nodes.push(new Node(newAddedSong.SongId, CommonService.getGuid(), newAddedSong.Label, newAddedSong.Artist, newAddedSong.VideoURL, newAddedSong.AudioFile, newAddedSong.JumpPoints, 'Song', newAddedSong.CreatedByUserId, false, newAddedSong.NoteflightScoreID, newAddedSong.Lyrics, newAddedSong.TransLations, '', newAddedSong.Midi, false, false, [], undefined, undefined))
            this.playlistService.LessonModel.LessonQueue = JSON.stringify(this.nodes);
        }


        if (this.playlistService.LessonModel.Student != undefined) {
            if (this.playlistService.LessonModel.Student.length > 0) {
                this.playlistService.LessonModel.Student.forEach(element => {
                    if (this.playlistService.LessonModel.Users == null)
                        this.playlistService.LessonModel.Users = element.UserId + ',';
                    else
                        this.playlistService.LessonModel.Users = this.playlistService.LessonModel.Users + element.UserId + ',';
                });
            }
            else {
                this.playlistService.LessonModel.Users = "";
            }
        }
        else {
            this.playlistService.LessonModel.Users = "";
        }

        if (this.playlistService.LessonModel.Tags == null) {
            this.playlistService.LessonModel.Tags = "";
        }
        this.songService.post('/lesson/UpsertLesson', this.playlistService.LessonModel, new HttpParams()).subscribe((response: any) => {
            this.songService.songId = 0;
            this.songService.songTags = "";
            CommonService.isPlayListLoaded = false;
            this.route.navigate(['student/playlist']);
        });
    }

    addJumpPoint() {
        if (this.songModel.SongJumpPoints === undefined || this.songModel.SongJumpPoints === null) {
            this.songModel.SongJumpPoints = [];
        }
        let jumpPoint = {
            Point: "",
            Name: ""
        };
        this.songModel.SongJumpPoints.push(jumpPoint);
    }

    uploadKeyboardFiles() {
        this.startUpload(File, 'song');
    }

    onUploadOutput(output: UploadOutput, file: string): void {
        if (output.file != undefined) {
            this.startUpload(output.file, file);
            if (output.type === 'allAddedToQueue') {
            }
            else if (output.type === 'addedToQueue' && typeof output.file !== 'undefined') {
            }
            else if (output.type === 'uploading' && typeof output.file !== 'undefined') {
                const index = this.files.findIndex(file => typeof output.file !== 'undefined' && file.id === output.file.id);
                this.files[index] = output.file;
            }
            else if (output.type === 'removed') {
                this.files = this.files.filter((file: UploadFile) => file !== output.file);
            }
            else if (output.type === 'dragOver') {
                this.dragOver = true;
            }
            else if (output.type === 'dragOut') {
                this.dragOver = false;
            }
            else if (output.type === 'drop') {
                this.dragOver = false;
            }
            else if (output.type === 'rejected' && typeof output.file !== 'undefined') {
                console.log(output.file.name + ' rejected');
            }
            this.files = this.files.filter(file => file.progress.status !== UploadStatus.Done);
        }
    }

    startUpload(fileUpload, file) {
        this.songService.post('/planner/GetBlobSasToken?filename=' + fileUpload.nativeFile.name + '&containerName=' + "vl2songs", new HttpParams()).subscribe((response: any) => {
            Config.sas = response;
            if (fileUpload !== null) {
                const baseUrl = this.blob.generateBlobUrl(Config, fileUpload.nativeFile.name);
                this.config = {
                    baseUrl: baseUrl,
                    sasToken: Config.sas,
                    blockSize: 1024 * 64,
                    file: fileUpload.nativeFile,
                    complete: () => {
                        if (file === 'song') {
                            this.songModel.AudioFile = baseUrl;
                            this.songModel.FileType = fileUpload.nativeFile.name.substr(fileUpload.nativeFile.name.lastIndexOf('.') + 1);;
                        }
                        else if (file === 'score') {
                            this.songModel.NoteflightScoreID = baseUrl;
                        }
                        this.toastr.success('Transfer completed!!');
                    },
                    error: () => {
                        console.log('Error !');
                        this.songModel.AudioFile = null;
                    },
                    progress: (percent) => {
                        this.loaderService.percent=percent;
                      /*   if (percent < 100)
                            this.loaderService.processloader = true
                        else if (percent === 100)
                            this.loaderService.processloader = false; */
                    }
                };
                this.blob.upload(this.config);
            }
        });
    }

    onValueSelect(item: any, type: string) {
        if (type === "Genre") {
            if (this.songModel.Genre == "" || this.songModel.Genre == null) {
                this.songModel.Genre = item.item_id;
            }
            else {
                this.songModel.Genre = this.songModel.Genre + ',' + item.item_id;
            }
        }
        if (type === "Vocal") {
            if (this.songModel.VocalType == "" || this.songModel.VocalType == null) {
                this.songModel.VocalType = item.item_id;
            }
            else {
                this.songModel.VocalType = this.songModel.VocalType + ',' + item.item_id;
            }
        }
    }

    onValueSelectAll(items: any, type: string) {
        if (type === "Genre") {
            this.songModel.Genre = "";
            items.forEach(element => {
                if (this.songModel.Genre == "" || this.songModel.Genre == null) {
                    this.songModel.Genre = element.item_id;
                }
                else {
                    this.songModel.Genre = this.songModel.Genre + ',' + element.item_id;
                }
            });
        }
        if (type === "Vocal") {
            this.songModel.VocalType = "";
            items.forEach(element => {
                if (this.songModel.VocalType == "" || this.songModel.VocalType == null) {
                    this.songModel.VocalType = element.item_id;
                }
                else {
                    this.songModel.VocalType = this.songModel.VocalType + ',' + element.item_id;
                }
            });
        }
    }

    onValueDeSelect(item: any, type: string) {
        if (type === "Genre") {
            if (this.songModel.Genre.includes(item.item_id)) {
                var n = this.songModel.Genre.lastIndexOf(item.item_id);
                var length = 0;
                if (n == 0) {
                    var Keyarray = this.songModel.Genre.split(',');
                    if (Keyarray.length == 1) {
                        length = 0;
                    } else {
                        length = this.songModel.Genre.length - 1;
                    }
                } else {
                    length = this.songModel.Genre.length - 1;
                }

                if (length == 0) {
                    this.songModel.Genre = this.songModel.Genre.replace(item.item_id, '');
                }
                else if (n == length) {
                    this.songModel.Genre = this.songModel.Genre.replace(',' + item.item_id, '');
                }
                else {
                    this.songModel.Genre = this.songModel.Genre.replace(item.item_id + ',', '');
                }
            }
        }
        if (type === "Vocal") {
            if (this.songModel.VocalType.includes(item.item_id)) {
                var n = this.songModel.VocalType.lastIndexOf(item.item_id);
                var length = this.songModel.VocalType.length - 1;
                if (length == 0) {
                    this.songModel.VocalType = this.songModel.VocalType.replace(item.item_id, '');
                }
                else if (n == length) {
                    this.songModel.VocalType = this.songModel.VocalType.replace(',' + item.item_id, '');
                }
                else {
                    this.songModel.VocalType = this.songModel.VocalType.replace(item.item_id + ',', '');
                }
            }
        }
    }

    restrictWhiteSpace() {
        if (this.songModel.Label.length > 0) {
            this.songModel.Label = this.songModel.Label.trim();
        }
    }

    restrictJPWhiteSpace(pointName: string) {
        let index = this.songModel.SongJumpPoints.findIndex(x => x.Name === pointName);
        this.songModel.SongJumpPoints[index].Name = this.songModel.SongJumpPoints[index].Name.trim();
    }

    setNextStep(id: number) {
        if (id === 2) {
            if (this.formStep1.valid) {
                if (this.songTagsList.length === 0) {
                    this.toastr.error("Please enter tags.");
                }
                else {
                    this.sharedLibrary.isStep2 = true;
                    this.sharedLibrary.isStep3 = false;
                    this.enableDisableTabs(id);
                }
            }
            else {
                this.isStep1SubmitFlag = true;
            }
        }
        else if (id === 3) {
            let jpValid = true;
            if (this.formStep2.valid) {
                if (this.songModel.SongJumpPoints.length >= 1) {
                    this.songModel.SongJumpPoints.forEach(element => {
                        if (element.Name.trim() != '' && element.Point != '' || (element.Name.trim() === '' && element.Point === '')) {
                            jpValid = true;
                        }
                        else {
                            jpValid = jpValid && false;
                        }
                    });
                }
                if (jpValid) {
                    this.sharedLibrary.isStep2 = false;
                    this.sharedLibrary.isStep3 = true;
                    this.enableDisableTabs(id);
                }
                else {
                    this.toastr.error("Please enter valid jump points.");
                }
            }
            else {
                this.isStep2SubmitFlag = true;
            }
        }
    }

    enableDisableTabs(id: number) {
        let idNext = '#tab' + id + '-link';
        let idPrevious = '#tab' + (id - 1) + '-link';
        let idNextTab = '#tab' + id;
        let idPreviousTab = '#tab' + (id - 1);
        $('.tab-container ul').find(idPrevious).parent().removeClass('active');
        $(idPrevious).removeClass('active');
        $('.tab-container ul').find(idNext).parent().addClass('active');
        $(idNext).addClass('active');
        $(idPreviousTab).removeClass('active');
        $(idNextTab).addClass('active');
    }

    setPreviousStep(id: number) {
        if (id === 2) {
            this.sharedLibrary.isStep2 = false;
            this.sharedLibrary.isStep3 = false;
        }
        let idNext = '#tab' + id + '-link';
        let idPrevious = '#tab' + (id - 1) + '-link';
        let idNextTab = '#tab' + id;
        let idPreviousTab = '#tab' + (id - 1);
        $('.tab-container ul').find(idPrevious).parent().addClass('active');
        $(idPrevious).addClass('active');
        $('.tab-container ul').find(idNext).parent().removeClass('active');
        $(idNext).removeClass('active');
        $(idPreviousTab).addClass('active');
        $(idNextTab).removeClass('active');
    }

    clearAllValues(type: string) {
        if (type === "Genre") {
            this.songModel.Genre = "";
        }
        if (type === "Vocal") {
            this.songModel.VocalType = "";
        }
    }

    addLiveLessonQueue(lessonQueue, newAddedSong) {
        this.nodes = [];
        this.nodes.push(new Node(CommonService.getGuid(), CommonService.getGuid(), 'Drag Here!...', null, null, null, null, null, null, null, null, null, null, null, null, null, null, [], null, null));
        if (lessonQueue != "") {
            var nodelist: any;
            nodelist = this.convertLessonToNodes(lessonQueue);
            for (var i = 0; i < nodelist.length; i++) {
                this.nodes.push(new Node(nodelist[i].SongId, CommonService.getGuid(), nodelist[i].LabelName, nodelist[i].Artist, nodelist[i].VideoUrl, nodelist[i].AudioFile, nodelist[i].JumpPoints, nodelist[i].FilterType, nodelist[i].CreatedByUserId, false, nodelist[i].NoteflightScoreID, nodelist[0].Lyrics, nodelist[i].TransLations, nodelist[i].LessonQueue, nodelist[i].Midi, nodelist[i].IsTeacherPlayed, nodelist[i].IsStudentPlayed, nodelist[i].nodes, nodelist[i].TeacherItemName, nodelist[i].StudentItemName));
            }
            this.nodes.push(new Node(newAddedSong.SongId, CommonService.getGuid(), newAddedSong.Label, newAddedSong.Artist, newAddedSong.VideoURL, newAddedSong.AudioFile, newAddedSong.JumpPoints, 'Song', newAddedSong.CreatedByUserId, false, newAddedSong.NoteflightScoreID, newAddedSong.Lyrics, newAddedSong.TransLations, '', newAddedSong.Midi, false, false, [], undefined, undefined))
        } else {
            this.nodes.push(new Node(newAddedSong.SongId, CommonService.getGuid(), newAddedSong.Label, newAddedSong.Artist, newAddedSong.VideoURL, newAddedSong.AudioFile, newAddedSong.JumpPoints, 'Song', newAddedSong.CreatedByUserId, false, newAddedSong.NoteflightScoreID, newAddedSong.Lyrics, newAddedSong.TransLations, '', newAddedSong.Midi, false, false, [], undefined, undefined))
        }
        return this.nodes;
    }

    convertLessonToNodes(songNodes: any): Array<Node> {
        if (songNodes == undefined) return;
        var nodeList = new Array<Node>();
        var parentCounter = 0;
        songNodes.forEach(element => {
            nodeList.push(new Node(element.SongId, CommonService.getGuid(), element.LabelName, element.Artist, element.VideoUrl, element.AudioFile, element.JumpPoints, element.FilterType, element.CreatedByUserId, false, element.NoteflightScoreID, element.Lyrics, element.TransLations, element.LessonQueue, element.Midi, element.IsTeacherPlayed, element.IsStudentPlayed, [], element.TeacherItemName, element.StudentItemName));
            if (element.nodes.length != 0) {
                var childCounter = 0;
                element.nodes.forEach(childelement => {
                    nodeList[parentCounter].nodes.push(new Node(childelement.SongId, CommonService.getGuid(), childelement.LabelName, childelement.Artist, childelement.VideoUrl, childelement.AudioFile, childelement.JumpPoints, childelement.FilterType, childelement.CreatedByUserId, false, childelement.NoteflightScoreID, childelement.Lyrics, childelement.TransLations, childelement.LessonQueue, childelement.Midi, childelement.IsTeacherPlayed, childelement.IsStudentPlayed, [], childelement.TeacherItemName, childelement.StudentItemName));
                    if (childelement.nodes.length != 0) {
                        var subchildCounter = 0;
                        childelement.nodes.forEach(subchildelement => {
                            nodeList[parentCounter].nodes[childCounter].nodes.push(new Node(subchildelement.SongId, CommonService.getGuid(), subchildelement.LabelName, subchildelement.Artist, subchildelement.VideoUrl, subchildelement.AudioFile, subchildelement.JumpPoints, subchildelement.FilterType, subchildelement.CreatedByUserId, false, subchildelement.NoteflightScoreID, subchildelement.Lyrics, subchildelement.TransLations, subchildelement.LessonQueue, subchildelement.Midi, subchildelement.IsTeacherPlayed, subchildelement.IsStudentPlayed, [], subchildelement.TeacherItemName, subchildelement.StudentItemName));
                            subchildCounter = subchildCounter + 1;
                        });
                    }
                    childCounter = childCounter + 1;
                });
            }
            parentCounter = parentCounter + 1;
        });
        return nodeList;
    }

    onAccessChange(value) {
        if (value) {
            this.songModel.AccessType = "Public";
        }
        else {
            this.songModel.AccessType = "Private";
        }
    }
}
