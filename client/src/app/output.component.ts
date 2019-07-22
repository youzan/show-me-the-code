import { Component, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { ExecutionService } from './execution.service';

@Component({
  selector: 'app-output',
  template: `
    <ng-container *mobxAutorun>
      <div *ngFor="let line of output" class="line">
        <ng-container *mobxAutorun>
          <app-output-item *ngFor="let item of line" [value]="item"></app-output-item>
        </ng-container>
      </div>
    </ng-container>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        overflow-x: hidden;
        overflow-y: auto;
        background: #222;
      }

      .line {
        border-bottom: 1px solid #000;
        line-height: 24px;
        background: #333;
        margin: 1px 0;
        border-radius: 5px;
        padding: 0 5px;
        display: flex;
        flex-wrap: wrap;
      }
    `,
  ],
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OutputComponent {
  constructor(private readonly executionService: ExecutionService) {}

  get output() {
    return this.executionService.output;
  }
}
