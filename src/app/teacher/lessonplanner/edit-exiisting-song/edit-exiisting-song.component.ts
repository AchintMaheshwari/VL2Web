import { Component, OnInit, ViewChild } from '@angular/core';

import {OwlCarousel} from 'ngx-owl-carousel';
 
@Component({
  selector: 'app-edit-exiisting-song',
  templateUrl: './edit-exiisting-song.component.html',
  styleUrls: ['./edit-exiisting-song.component.scss']
})
export class EditExiistingSongComponent implements OnInit {

  @ViewChild('owlElement') owlElement: OwlCarousel
  isDropup = true;
 
   fun() {
     this.owlElement.next([200])
     //duration 200ms
   }

  constructor() { }

  ngOnInit() {
  }

}
