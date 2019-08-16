import { Component } from '@angular/core';
import { EditorService } from './editor.service';
import { ExecutionService } from './execution.service';
import { CodeService } from './code.service';

@Component({
  selector: 'app-header',
  template: `
    <p-overlayPanel #op>
      <app-config></app-config>
    </p-overlayPanel>

    <button
      type="button"
      pButton
      class="options ui-button-secondary"
      icon="pi pi-cog"
      (click)="op.toggle($event)"
    ></button>

    <app-users></app-users>

    <button type="button" pButton class="ui-button-primary save" icon="pi pi-save" (click)="save()"></button>

    <button
      type="button"
      pButton
      class="ui-button-secondary format"
      label="Format (Shift + Alt + F)"
      (click)="format()"
    ></button>

    <div class="button-group">
      <button type="button" pButton icon="pi pi-caret-right" class="ui-button-success" (click)="execute()"></button>
      <button type="button" pButton icon="pi pi-trash" class="ui-button-warning" (click)="clean()"></button>
      <button type="button" pButton icon="pi pi-times" class="ui-button-danger" (click)="terminate()"></button>
    </div>

    <a class="github" href="https://github.com/youzan/show-me-the-code" target="_blank" rel="noopener noreferrer"></a>
  `,
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  constructor(
    private readonly editorService: EditorService,
    private readonly executionService: ExecutionService,
    private readonly codeService: CodeService,
  ) {}

  execute() {
    const lang = this.editorService.language$.getValue();
    const code = this.editorService.model.getValue();
    if (lang === 'typescript') {
      this.executeTypeScript(code);
      return;
    }
    this.executionService.exec(lang, code);
  }

  async executeTypeScript(source: string) {
    const ts = await import('typescript');
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2019,
      },
    });
    this.executionService.exec('javascript', outputText);
  }

  clean() {
    this.executionService.terminate();
    this.executionService.output = [];
  }

  terminate() {
    this.executionService.terminate();
  }

  save() {
    this.codeService.save();
  }

  format() {
    this.editorService.format();
  }
}
