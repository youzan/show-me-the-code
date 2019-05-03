import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { MobxAngularModule } from 'mobx-angular';

import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { NgxJsonViewerModule } from 'ngx-json-viewer';

import { AppComponent } from './app.component';
import { EditorService } from './editor.service';
import { MonacoEditorDirective } from './monaco-editor.directive';
import { HeaderComponent } from './header.component';
import { ConfigComponent } from './config.component';
import { OutputComponent } from './output.component';
import { ExecutionService } from './execution.service';

@NgModule({
  imports: [
    BrowserModule,
    MobxAngularModule,
    BrowserAnimationsModule,
    FormsModule,
    ButtonModule,
    DropdownModule,
    OverlayPanelModule,
    NgxJsonViewerModule,
  ],
  declarations: [AppComponent, MonacoEditorDirective, HeaderComponent, ConfigComponent, OutputComponent],
  bootstrap: [AppComponent],
  providers: [EditorService, ExecutionService],
})
export class AppModule {}
