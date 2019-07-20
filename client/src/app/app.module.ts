import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { OverlayPanelModule } from 'primeng/overlaypanel';

import { AppComponent } from './app.component';
import { MonacoEditorDirective } from './editor.directive';
import { EditorService } from './editor.service';
import { HeaderComponent } from './header.component';
import { ConfigCompoennt } from './config.component';

@NgModule({
  declarations: [AppComponent, MonacoEditorDirective, HeaderComponent, ConfigCompoennt],
  imports: [BrowserModule, BrowserAnimationsModule, FormsModule, ButtonModule, DropdownModule, OverlayPanelModule],
  providers: [EditorService],
  bootstrap: [AppComponent],
})
export class AppModule {}
