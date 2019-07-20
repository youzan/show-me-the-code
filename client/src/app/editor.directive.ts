import { Directive, AfterViewInit, ViewContainerRef, OnDestroy, HostListener } from '@angular/core';
import * as monaco from 'monaco-editor';
import { Subscription } from 'rxjs';
import { EditorService } from './editor.service';

@Directive({
  selector: '[monaco-editor-container]',
})
export class MonacoEditorDirective implements AfterViewInit, OnDestroy {
  editor: monaco.editor.IStandaloneCodeEditor | null = null;
  $$: Subscription[] = [];

  private scheduled = false;

  constructor(private readonly viewContainerRef: ViewContainerRef, private readonly editorService: EditorService) {}

  @HostListener('window:resize')
  onWindowResize() {
    if (this.scheduled) {
      return;
    }
    this.scheduled = true;
    requestAnimationFrame(() => {
      this.scheduled = false;
      this.editor && this.editor.layout();
    });
  }

  ngAfterViewInit() {
    const el: HTMLElement = this.viewContainerRef.element.nativeElement;
    this.editor = monaco.editor.create(el, {
      model: this.editorService.model,
    });
    this.$$.push(
      this.editorService.fontSize$.subscribe(fontSize => {
        this.editor.updateOptions({
          fontSize,
        });
      }),
    );
  }

  ngOnDestroy() {
    this.$$.forEach(it => it.unsubscribe());
    this.$$ = [];
  }
}
