import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogData } from '../teacher/exercise-library/lesson-library/create-lesson-dialog/create-lesson-dialog.component';
import { SongsService } from '../services/song.service';
import { SharedlibraryService } from '../services/sharedlibrary.service';
import { ToastrService } from 'ngx-toastr';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-advanced-search-dialog',
  templateUrl: './advanced-search-dialog.component.html',
  styleUrls: ['./advanced-search-dialog.component.scss']
})
export class AdvancedSearchDialogComponent implements OnInit {
  AdvancedSettings: JSON;
  obj: any;

  AscendingInterval: string;
  DescendingInternval: string;
  BPM: number = 20;
  Ascending: number = 0;
  Descending: number = 0;;
  BeatsBetweenRepetitions: number = 0;

  isAscFraction: boolean = true;
  isAscNumberFraction: boolean = false;
  AscendingIntervalNumber: number = 0;
  fraction1Asc: number = 1;
  fraction2Asc: number = 2;

  isDescFraction: boolean = true;
  isDescNumberFraction: boolean = false;
  DescendingIntervalNumber: number = 0;
  fraction1Desc: number = 1;
  fraction2Desc: number = 2;

  constructor(public dialogRef: MatDialogRef<AdvancedSearchDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private so: SongsService, private sharedLibrary: SharedlibraryService, private toastr: ToastrService) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    if (this.sharedLibrary.AdvanceSettingExerciseId != 0) {
      this.getExceriseSettings()
    }
  }

  upAscendingInterval() {
    if ((this.AscendingIntervalNumber == 0 || this.AscendingIntervalNumber > 0) && this.fraction1Asc != 0) {
      this.AscendingIntervalNumber = parseInt(this.AscendingIntervalNumber.toString()) + 1;
      this.isAscNumberFraction = true;
    }

    if (this.fraction1Asc == 0) {
      this.fraction1Asc = 1;
      this.fraction2Asc = 2;
    } else {
      this.fraction1Asc = 0;
      this.fraction2Asc = 0;
    }

    if (this.fraction1Asc != 0) {
      this.isAscFraction = true;
    } else {
      this.isAscFraction = false;
    }
  }

  downAscendingInterval() {
    if ((this.AscendingIntervalNumber > 0) && this.fraction1Asc == 0) {
      this.AscendingIntervalNumber = parseInt(this.AscendingIntervalNumber.toString()) - 1;
      this.isAscNumberFraction = true;
    } else {
      if (this.AscendingIntervalNumber > 0) {
        this.AscendingIntervalNumber = this.AscendingIntervalNumber;
      }
    }

    if (this.AscendingIntervalNumber == 0) {
      this.fraction1Asc = 1;
      this.fraction2Asc = 2;
    } else {
      if (this.fraction1Asc == 0) {
        this.fraction1Asc = 1;
        this.fraction2Asc = 2;
      } else {
        this.fraction1Asc = 0;
        this.fraction2Asc = 0;
      }
    }

    if (this.fraction1Asc != 0) {
      this.isAscFraction = true;
    } else {
      this.isAscFraction = false;
    }
  }

  upDescendingInterval() {
    if ((this.DescendingIntervalNumber == 0 || this.DescendingIntervalNumber > 0) && this.fraction1Desc != 0) {
      this.DescendingIntervalNumber = parseInt(this.DescendingIntervalNumber.toString()) + 1;
      this.isDescNumberFraction = true;
    }

    if (this.fraction1Desc == 0) {
      this.fraction1Desc = 1;
      this.fraction2Desc = 2;
    } else {
      this.fraction1Desc = 0;
      this.fraction2Desc = 0;
    }

    if (this.fraction1Desc != 0) {
      this.isDescFraction = true;
    } else {
      this.isDescFraction = false;
    }
  }

  downDescendingInterval() {
    if ((this.DescendingIntervalNumber > 0) && this.fraction1Desc == 0) {
      this.DescendingIntervalNumber = parseInt(this.DescendingIntervalNumber.toString()) - 1;
      this.isDescNumberFraction = true;
    } else {
      if (this.DescendingIntervalNumber > 0) {
        this.DescendingIntervalNumber = this.DescendingIntervalNumber;
      }
    }

    if (this.DescendingIntervalNumber == 0) {
      this.fraction1Desc = 1;
      this.fraction2Desc = 2;
    } else {
      if (this.fraction1Desc == 0) {
        this.fraction1Desc = 1;
        this.fraction2Desc = 2;
      } else {
        this.fraction1Desc = 0;
        this.fraction2Desc = 0;
      }
    }


    if (this.fraction1Desc != 0) {
      this.isDescFraction = true;
    } else {
      this.isDescFraction = false;
    }
  }

  upAscending() {
    if ((this.Ascending > 0 || this.Ascending == 0) && this.Ascending < 999)
      this.Ascending = this.Ascending + 1;
  }

  downAscending() {
    if (this.Ascending > 0)
      this.Ascending = this.Ascending - 1;
  }

  upDescending() {
    if ((this.Descending > 0 || this.Descending == 0) && this.Descending < 999)
      this.Descending = this.Descending + 1;
  }

  downDescending() {
    if (this.Descending > 0)
      this.Descending = this.Descending - 1;
  }

  upBeats() {
    if ((this.BeatsBetweenRepetitions > 0 || this.BeatsBetweenRepetitions == 0) && this.BeatsBetweenRepetitions < 999)
      this.BeatsBetweenRepetitions = this.BeatsBetweenRepetitions + 1;
  }

  downBeats() {
    if (this.BeatsBetweenRepetitions > 0)
      this.BeatsBetweenRepetitions = this.BeatsBetweenRepetitions - 1;
  }

  upBPM() {
    if ((this.BPM > 20 || this.BPM == 20) && this.BPM < 300)
      this.BPM = this.BPM + 1;
  }

  downBPM() {
    if (this.BPM > 20)
      this.BPM = this.BPM - 1;
  }


  saveSettings() {
    this.obj =
      {
        "AscendingInterval": this.AscendingIntervalNumber + ',' + this.fraction1Asc + ',' + this.fraction2Asc,
        "DescendingInternval": this.DescendingIntervalNumber + ',' + this.fraction1Desc + ',' + this.fraction2Desc,
        "BPM": this.BPM,
        "Ascending": this.Ascending,
        "Descending": this.Descending,
        "BeatsBetweenRepetitions": this.BeatsBetweenRepetitions
      }
    this.AdvancedSettings = <JSON>this.obj;
    if (this.sharedLibrary.AdvanceSettingExerciseId != 0) {
      this.sharedLibrary.post('/planner/UpsertAdvancedSettings?exerciseId=' + this.sharedLibrary.AdvanceSettingExerciseId + '&advancedSetting=' + JSON.stringify(this.AdvancedSettings), null).subscribe((result) => {
        if (result == true) {
          this.toastr.success('Advanced Setting saved successfully!');
          this.dialogRef.close();
        }
        else {
          this.toastr.error('Something gone wrong!!!');
        }
      });
    }
    console.log(this.AdvancedSettings);
  }

  getExceriseSettings() {
    this.sharedLibrary.get('/planner/GetExerciseDataById', new HttpParams().set("exerciseId", this.sharedLibrary.AdvanceSettingExerciseId.toString())).subscribe((result: any) => {
      let objAadvancedSetting = JSON.parse(result.AdvancedSettings);
      if (objAadvancedSetting != null) {
        var AscendingInt = objAadvancedSetting.AscendingInterval.split(',');
        this.AscendingIntervalNumber = AscendingInt[0];
        this.fraction1Asc = AscendingInt[1];
        this.fraction2Asc = AscendingInt[2];
        if ((this.AscendingIntervalNumber != 0 && this.AscendingIntervalNumber != undefined) && (this.fraction1Asc == 0 || this.fraction1Asc == undefined)) {
          this.isAscNumberFraction = true;
        }

        else if ((this.AscendingIntervalNumber == 0) && (this.fraction1Asc == 0 || this.fraction1Asc == undefined)) {
          this.isAscNumberFraction = true;
        }

        else if ((this.AscendingIntervalNumber != 0 && this.AscendingIntervalNumber != undefined) && (this.fraction1Asc != 0 && this.fraction1Asc != undefined)) {
          this.isAscNumberFraction = true;
        }

        var DescendingInt = objAadvancedSetting.DescendingInternval.split(',');
        this.DescendingIntervalNumber = DescendingInt[0];
        this.fraction1Desc = DescendingInt[1];
        this.fraction2Desc = DescendingInt[2];

        if ((this.DescendingIntervalNumber != 0 && this.DescendingIntervalNumber != undefined) && (this.fraction1Desc == 0 || this.fraction1Desc == undefined)) {
          this.isDescNumberFraction = true;
        }

        else if ((this.DescendingIntervalNumber == 0) && (this.fraction1Desc == 0 || this.fraction1Desc == undefined)) {
          this.isDescNumberFraction = true;
        }

        else if ((this.DescendingIntervalNumber != 0 && this.DescendingIntervalNumber != undefined) && (this.fraction1Desc != 0 && this.fraction1Desc != undefined)) {
          this.isDescNumberFraction = true;
        }

        this.BPM = objAadvancedSetting.BPM;
        this.Ascending = objAadvancedSetting.Ascending;
        this.Descending = objAadvancedSetting.Descending;
        this.BeatsBetweenRepetitions = objAadvancedSetting.BeatsBetweenRepetitions;
      }
    });
  }

}
