import { Directive, AfterViewInit, ViewContainerRef, OnDestroy } from '@angular/core';
import * as monaco from 'monaco-editor';
import ResizeObserver from 'resize-observer-polyfill';
import { EditorService } from './editor.service';
import { Subscription } from 'rxjs';

@Directive({
  selector: 'monaco-editor',
})
export class MonacoEditorDirective implements AfterViewInit, OnDestroy {
  private editor: monaco.editor.IStandaloneCodeEditor | null = null;
  private readonly resizeObserver = new ResizeObserver(() => {
    if (this.scheduled) {
      return;
    }
    requestAnimationFrame(this._doLayout);
    this.scheduled = true;
  });
  private scheduled = false;
  private $fontSize: Subscription;

  constructor(private readonly viewContainerRef: ViewContainerRef, private readonly editorService: EditorService) {
    this.$fontSize = this.editorService.fontSize$.subscribe(fontSize => {
      this.editor &&
        this.editor.updateOptions({
          fontSize,
        });
    });
  }

  ngAfterViewInit() {
    const el: HTMLElement = this.viewContainerRef.element.nativeElement;
    this.editor = monaco.editor.create(el, {
      model: this.editorService.model,
    });
    this.resizeObserver.observe(el);
  }

  ngOnDestroy() {
    this.editor && this.editor.dispose();
    this.editor = null;
    this.resizeObserver.disconnect();
    this.$fontSize.unsubscribe();
  }

  private _doLayout = () => {
    this.scheduled = false;
    this.editor && this.editor.layout();
  };
}
