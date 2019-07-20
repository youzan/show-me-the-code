import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

import { AppComponent } from './app.component';
import { MonacoEditorDirective } from './editor.directive';
import { EditorService } from './editor.service';
import { HeaderComponent } from './header.component';
import { ConfigCompoennt } from './config.component';
import { ConnectionService } from './connection.service';
import { JoinDialogComponent } from './join-dialog.component';
import { UsersComponent } from './users.component';

@NgModule({
  declarations: [
    AppComponent,
    MonacoEditorDirective,
    HeaderComponent,
    ConfigCompoennt,
    JoinDialogComponent,
    UsersComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ButtonModule,
    DropdownModule,
    OverlayPanelModule,
    DialogModule,
    InputTextModule,
  ],
  providers: [EditorService, ConnectionService],
  bootstrap: [AppComponent],
})
export class AppModule {}
