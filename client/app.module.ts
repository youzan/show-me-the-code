import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { MobxAngularModule } from 'mobx-angular';

import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { OverlayPanelModule } from 'primeng/overlaypanel';

import { AppComponent } from './app.component';
import { EditorService } from './editor.service';
import { MonacoEditorDirective } from './monaco-editor.directive';
import { HeaderComponent } from './header.component';
import { ConfigComponent } from './config.component';

@NgModule({
  imports: [
    BrowserModule,
    MobxAngularModule,
    BrowserAnimationsModule,
    FormsModule,
    ButtonModule,
    DropdownModule,
    OverlayPanelModule,
  ],
  declarations: [AppComponent, MonacoEditorDirective, HeaderComponent, ConfigComponent],
  bootstrap: [AppComponent],
  providers: [EditorService],
})
export class AppModule {}
