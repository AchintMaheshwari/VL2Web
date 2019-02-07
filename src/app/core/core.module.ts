import { NgModule } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { SharedModule } from '../shared/shared.module';
import { AppRoutingModule } from '../app-routing.module';
import { MenuComponent } from './menu/menu.component';
import { TeacherModule } from '../teacher/teacher.module';
import { BsDropdownModule, CollapseModule, PopoverModule } from 'ngx-bootstrap';
import { MalihuScrollbarService, MalihuScrollbarModule } from 'ngx-malihu-scrollbar';
import { NgChatModule } from '../ng-chat/ng-chat.module';
import { ClipboardModule } from 'ngx-clipboard';

@NgModule({
  declarations: [
    HeaderComponent,
    HomeComponent,
    MenuComponent
  ],
  imports: [
    SharedModule,
    AppRoutingModule,
    TeacherModule,
    BsDropdownModule.forRoot(),
    NgChatModule,
    CollapseModule.forRoot(),
    MalihuScrollbarModule,
    PopoverModule.forRoot(),
    ClipboardModule,
  ],
  exports: [
    AppRoutingModule,
    HeaderComponent
  ],
  providers: [MalihuScrollbarService]
})
export class CoreModule {}
