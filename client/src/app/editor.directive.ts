import { Directive, AfterViewInit, ViewContainerRef, OnDestroy, HostListener, Injector } from '@angular/core';
import * as monaco from 'monaco-editor';
import { Subscription } from 'rxjs';
import { EditorService } from './editor.service';
import { CodeService } from './code.service';

@Directive({
  selector: '[monaco-editor-container]',
})
export class MonacoEditorDirective implements AfterViewInit, OnDestroy {
  editor: monaco.editor.IStandaloneCodeEditor | null = null;
  $$: Subscription[] = [];

  private scheduled = false;

  constructor(
    private readonly viewContainerRef: ViewContainerRef,
    private readonly editorService: EditorService,
    private readonly codeService: CodeService,
  ) {}

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
        this.editor &&
          this.editor.updateOptions({
            fontSize,
          });
      }),
    );
    this.codeService.init(this.editor);
  }

  ngOnDestroy() {
    this.editor && this.editor.dispose();
    this.editor = null;
    this.$$.forEach(it => it.unsubscribe());
    this.$$ = [];
  }
}
