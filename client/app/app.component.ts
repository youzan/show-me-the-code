import { Component, HostListener } from '@angular/core';
import { Observable, merge, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConnectionService } from './connection.service';
import { CodeService } from './code.service';
import { size } from '../collections/Users.bs';

declare const process: any;

@Component({
  selector: 'app-root',
  template: `
    <app-header></app-header>
    <div monaco-editor-container></div>
    <app-output></app-output>
    <p-toast></p-toast>
    <app-join [visible$]="joinVisible$"></app-join>
    <p-blockUI [blocked]="blockUI$ | async">
      <p-progressSpinner class="global-spinner"></p-progressSpinner>
    </p-blockUI>
  `,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  readonly joinVisible$: Observable<boolean>;
  readonly blockUI$: Observable<boolean>;

  constructor(private readonly connectionService: ConnectionService, private readonly codeService: CodeService) {
    this.joinVisible$ = connectionService.channel$.pipe(map(channel => channel === null));
    this.blockUI$ = combineLatest(
      connectionService.channel$,
      connectionService.connected$,
      (channel, connected) => channel !== null && !connected,
    );
  }

  @HostListener('window:beforeunload', ['$event'])
  autoSave(e: BeforeUnloadEvent) {
    if (process.env.NODE_ENV === 'development') {
      return;
    }
    if (size(this.connectionService.users$.getValue()) === 1) {
      this.codeService.save();
    }
    e.returnValue = 'Sure ?';
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if (e.metaKey && e.key === 's') {
      e.preventDefault();
      this.codeService.save();
    }
  }
}
