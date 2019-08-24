import { Component, ChangeDetectionStrategy, Input, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';

type IItemType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'undefined'
  | 'object'
  | 'error'
  | 'null'
  | 'bigint'
  | 'symbol'
  | 'function'
  | 'array';

@Component({
  selector: 'app-output-item',
  templateUrl: './output-item.component.html',
  styleUrls: ['./output-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class OutputItemComponent {
  @Input()
  value: any;

  @Input()
  key?: string;

  expand = false;

  constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

  get type(): IItemType {
    if (this.value instanceof Error) {
      return 'error';
    }
    if (this.value === null) {
      return 'null';
    }
    if (Array.isArray(this.value)) {
      return 'array';
    }
    return typeof this.value;
  }

  toggle() {
    this.expand = !this.expand;
    this.changeDetectorRef.markForCheck();
  }
}
