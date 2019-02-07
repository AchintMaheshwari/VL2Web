import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, Event as NavigationEvent } from '@angular/router';


@Component({
  selector: 'app-settings-menu',
  templateUrl: './settings-menu.component.html',
  styleUrls: ['./settings-menu.component.scss']
})
export class SettingsMenuComponent implements OnInit {
  currentUrl: string;
  constructor(private _router: Router) {
    if (_router.events) {
      _router.events.subscribe((event: NavigationEvent) => {
        if (event instanceof NavigationEnd) {
          this.currentUrl = event.url;
        }
      });
    }
  }

  ngOnInit() {
  }

}
