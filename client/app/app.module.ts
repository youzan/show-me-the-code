import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MobxAngularModule } from 'mobx-angular';

import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BlockUIModule } from 'primeng/blockui';
import { RadioButtonModule } from 'primeng/radiobutton'
import { MessageService } from 'primeng/components/common/messageservice';

import { AppComponent } from './app.component';
import { MonacoEditorDirective } from './editor.directive';
import { EditorService } from './editor.service';
import { HeaderComponent } from './header.component';
import { ConfigComponent } from './config.component';
import { ConnectionService } from './connection.service';
import { JoinDialogComponent } from './join-dialog.component';
import { UsersComponent } from './users.component';
import { UserClassNamePipe, UserListItemPipe } from './user.pipe';
import { CodeService } from './code.service';
import { ExecutionService } from './execution.service';
import { OutputComponent } from './output.component';
import { OutputItemComponent } from './output-item.component';
import { ToStringPipe } from './to-string.pipe';

@NgModule({
  declarations: [
    AppComponent,
    MonacoEditorDirective,
    HeaderComponent,
    ConfigComponent,
    JoinDialogComponent,
    UsersComponent,
    UserClassNamePipe,
    UserListItemPipe,
    OutputComponent,
    OutputItemComponent,
    ToStringPipe,
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
    ToastModule,
    ProgressSpinnerModule,
    BlockUIModule,
    MobxAngularModule,
    RadioButtonModule,
  ],
  providers: [EditorService, ConnectionService, MessageService, CodeService, ExecutionService],
  bootstrap: [AppComponent],
})
export class AppModule {}
