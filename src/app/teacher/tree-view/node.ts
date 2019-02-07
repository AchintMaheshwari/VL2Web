import { stringify } from "@angular/compiler/src/util";
import { CommonService } from "../../common/common.service";

declare var VoiceLessons: any;
declare var VoiceLessonsExercisePlayer: any;
declare var LivePlayer: any;

export class Node {
    expanded = true;
    searchResult: any[];
    uniqueId: string;
    libraryHistory: any[] = [];
    currentSongNo: any;

    constructor(public SongId: string,public Label: string, public LabelName: string, public Artist: string, public VideoUrl: string, public AudioFile: string, public JumpPoints: Object,
        public FilterType: string,
        public CreatedByUserId: string,
        public Played: boolean,
        public NoteflightScoreID: string,
        public Lyrics: string,
        public TransLations: string,
        public LessonQueue: string,
        public Midi: string,
        public IsTeacherPlayed: boolean,
        public IsStudentPlayed: boolean,
        public nodes: Array<Node>,
        public TeacherItemName: string,
        public StudentItemName: string,) {
    }

    playSong(currentSongNo, songNodeList) {
        var playList = [];
        songNodeList.forEach(element => {
            var jp = '';
            if(element.JumpPoints != '') {
                jp = JSON.parse(element.JumpPoints);
            }
            var song = {
                'src': element.AudioFile,
                'jumpPoints': jp,
                'tittle': element.LabelName,
                'label':element.Label,
                'played':element.Played,
                'noteFlightId':element.NoteflightScoreID,
                'lyrics': element.Lyrics,
                'translation': element.TransLations,
            }
            playList.push(song);
        });
        //debugger;
        CommonService.treeViewObject = this;
        VoiceLessons.AudioPlayer('#songplayer', playList, this.voiceLessonsCallback , currentSongNo);
    }
    voiceLessonsCallback(completeSong){
        var playedLibraryModel = [];
            var jp = '';
            if(completeSong.JumpPoints != '') {
                jp = JSON.parse(completeSong.JumpPoints);
            }
            var song = {
                'src': completeSong.src,
                'jumpPoints': jp,
                'tittle': completeSong.tittle,
                'label':completeSong.label,
                'played':true,
                'noteFlightId':completeSong.NoteflightScoreID,
                'lyrics': completeSong.Lyrics,
                'translation': completeSong.TransLations,
            }
            //playedLibraryModel.push(song);
            CommonService.treeViewObject.libraryHistory.push(song);            
            //this.libraryHistory.push(playedLibraryModel);
            console.log('Played object');
            console.log(this.libraryHistory)
            console.log(completeSong);
    }
}
