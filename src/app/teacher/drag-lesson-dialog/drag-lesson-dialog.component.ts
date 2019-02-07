import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '../../../../node_modules/@angular/material';
import { DialogData } from '../exercise-library/lesson-library/add-student-dialog/add-student-dialog.component';
import { TreeView } from '../tree-view/tree-view';
import { SharedlibraryService } from '../../services/sharedlibrary.service';
import { MatDialog } from '../../../../node_modules/@angular/material';
import { ToastrService } from 'ngx-toastr';
import { GuidedvideoTreeViewComponent } from './../guidedvideo/guidedvideo-tree-view/guidedvideo-tree-view.component';
import { GuidedvideoService } from '../../services/guidedvideo.service';
import { Router } from '../../../../node_modules/@angular/router';

@Component({
    selector: 'app-drag-lesson-dialog',
    templateUrl: './drag-lesson-dialog.component.html',
    styleUrls: ['./drag-lesson-dialog.component.scss'],
})
export class DragLessonDialogComponent implements OnInit {
    dragLesson: string = "bottom";
    dragLessonWindow: any = window;
    isGuidedVideoLesson: boolean = false;
    constructor(public dialogRef: MatDialogRef<DragLessonDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData,
        private sharedLibrary: SharedlibraryService, public dialog: MatDialog, public toastrService: ToastrService,
        private guidedvideoService: GuidedvideoService, private route: Router) { }

    onNoClick(): void {
        this.dialogRef.close();
    }

    ngOnInit() {
    }

    AddLesson() {
        debugger;
        this.dialogRef.close();
        this.isGuidedVideoLesson = this.route.url.includes('guidedvideo-lessonplanner');
        if (this.isGuidedVideoLesson == true) {
            let guidedvideoTreeViewComponent = new GuidedvideoTreeViewComponent(this.guidedvideoService, null, null, this.toastrService, null, null);
            guidedvideoTreeViewComponent.LessonAddPosition(this.dragLesson, true);
        } else {
            let treeView = new TreeView(this.sharedLibrary, null, null, this.toastrService, null, null, null);
            treeView.LessonAddPosition(this.dragLesson, true);
        }

        /*    if (this.dragLessonWindow.angularComponentReference.LessonAddPosition == undefined) {
               let treeView = new TreeView(this.sharedLibrary, null, null,this.toastrService, null, null);
               treeView.LessonAddPosition(this.dragLesson, true);
           } else {
               this.dragLessonWindow.angularComponentReference.zone.run(() => { this.dragLessonWindow.angularComponentReference.LessonAddPosition(this.dragLesson, true); });
           } */
    }


    CloseLessonModal() {
        this.dialogRef.close();
    }

}
